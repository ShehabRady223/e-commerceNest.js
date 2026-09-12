import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import multer from 'multer';

const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
        if (!file)
            throw new BadRequestException('No file provided for upload.');
        if (file.size > this.MAX_FILE_SIZE)
            throw new BadRequestException(`File "${file.originalname}" exceeds the 5MB size limit.`);
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype))
            throw new BadRequestException(`Invalid file type for "${file.originalname}". Only JPEG, PNG, WEBP, and AVIF are allowed.`);
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'uploads',
                    allowed_formats: ['jpg', 'png', 'webp', 'avif'],
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new InternalServerErrorException('Cloudinary upload returned no result'));
                    resolve(result);
                });
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadImages(files: Express.Multer.File[]): Promise<CloudinaryResponse[]> {
        if (!files || files.length === 0) 
            throw new BadRequestException('No files provided for upload.');
        
        const uploadPromises = files.map((file) => {
            // Security check: Size validation
            if (file.size > this.MAX_FILE_SIZE) 
                throw new BadRequestException(`File "${file.originalname}" exceeds the 5MB size limit.`);
            
            // Security check: Strict MIME-type whitelist validation
            if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) 
                throw new BadRequestException(`Invalid file type for "${file.originalname}". Only JPEG, PNG, WEBP, and AVIF are allowed.`);
            
            return new Promise<CloudinaryResponse>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'uploads', // Centralized folder isolation
                        allowed_formats: ['jpg', 'png', 'webp', 'avif'], // Cloudinary-side restriction
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Performance optimization
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new InternalServerErrorException('Cloudinary upload returned no result.'));
                        resolve(result);
                    },
                );
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        });
        try {
            // Process all uploads concurrently for better performance
            return await Promise.all(uploadPromises);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new InternalServerErrorException(`Image upload failed: ${message}`);
        }
    }
}
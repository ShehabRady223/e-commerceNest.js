import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('upload')
    // must name of form-data field as 'file' to match the FileInterceptor('file') argument
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 500000 }), //0.5 M
            new FileTypeValidator({ fileType: /^image\/(png|jpeg)$/ }),
        ]
    })) file: Express.Multer.File, @Req() req) {
        // console.log(req.file);
        return await this.cloudinaryService.uploadImage(file);
    }

}

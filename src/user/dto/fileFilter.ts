import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return callback(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
    }
    callback(null, true);
};
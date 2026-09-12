import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
// import { CloudinaryController } from './cloudinary.controller';

@Module({
  //the controller Just for test
  // controllers: [CloudinaryController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService, CloudinaryProvider]
})
export class CloudinaryModule { }

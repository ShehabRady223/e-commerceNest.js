import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandScheam } from './entities/brand.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Brand.name, schema: BrandScheam }])],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule { }

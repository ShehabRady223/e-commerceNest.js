import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review, ReviewSchema } from './entities/review.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../product/entities/product.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema },
  { name: Product.name, schema: ProductSchema }])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule { }

import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';
import { Brand, BrandSchema } from '../brand/entities/brand.entity';
import { SubCategory, SubCategorySchema } from '../sub-category/entities/sub-category.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }
    ,{ name: Category.name, schema: CategorySchema }
    ,{ name: Brand.name, schema: BrandSchema }, { name: SubCategory.name, schema: SubCategorySchema }
  ])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }

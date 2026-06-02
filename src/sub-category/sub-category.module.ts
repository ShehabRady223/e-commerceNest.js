import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, SubCategorySchema } from './entities/sub-category.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema },
  { name: Category.name, schema: CategorySchema }
  ])],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule { }

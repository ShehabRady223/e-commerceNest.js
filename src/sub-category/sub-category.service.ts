import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from './entities/sub-category.entity';
import mongoose, { Model } from 'mongoose';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class SubCategoryService {

  constructor(@InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategory>
    , @InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const existingSubCategory = await this.subCategoryModel.findOne({ name: createSubCategoryDto.name });
    if (existingSubCategory)
      throw new BadRequestException('Sub-Category name already exists');
    const existingCategory = await this.categoryModel.findById(createSubCategoryDto.category);
    if (!existingCategory)
      throw new BadRequestException('Category not exists');
    const subCategory = new this.subCategoryModel(createSubCategoryDto);
    return await subCategory.save();
  }

  async findAll(search: string) {
    const subCategories = await this.subCategoryModel.find().where('name').regex(new RegExp(search, 'i'));
    return subCategories;
  }

  async findOne(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid SubCategory ID')
    const subCategory = await this.subCategoryModel.findById(_id);
    if (!subCategory)
      throw new BadRequestException("SubCategory not found")
    return subCategory;
  }

  async update(_id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid SubCategory ID')
    const newSubCategory = await this.subCategoryModel.findByIdAndUpdate(_id, updateSubCategoryDto, { new: true });
    if (!newSubCategory)
      throw new BadRequestException("SubCategory not found")
    return newSubCategory;
  }

  async remove(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid SubCategory ID')
    const newSubCategory = await this.subCategoryModel.findByIdAndDelete(_id);
    if (!newSubCategory)
      throw new BadRequestException("SubCategory not found")
  }
}


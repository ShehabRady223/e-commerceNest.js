import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {

  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name });
    if (existingCategory)
      throw new BadRequestException('Category name already exists');
    const category = new this.categoryModel(createCategoryDto);
    return await category.save();
  }

  async findAll(search: string) {
    const categories = await this.categoryModel.find().where('name').regex(new RegExp(search, 'i'));
    return categories;
  }

  async findOne(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid category ID')
    const category = await this.categoryModel.findById(_id);
    if (!category)
      throw new BadRequestException("Category not found")
    return category;
  }

  async update(_id: string, updateCategoryDto: UpdateCategoryDto) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid category ID')
    const newCategory = await this.categoryModel.findByIdAndUpdate(_id, updateCategoryDto, { new: true });
    if (!newCategory)
      throw new BadRequestException("Category not found")
    return newCategory;
  }

  async remove(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid category ID')
    const category = await this.categoryModel.findByIdAndDelete(_id);
    if (!category)
      throw new BadRequestException("Category not found")
  }
}

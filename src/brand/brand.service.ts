import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './entities/brand.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class BrandService {

  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) { }

  async create(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.brandModel.findOne({ name: createBrandDto.name });
    if (existingBrand)
      throw new BadRequestException('Brand name already exists');
    const brand = new this.brandModel(createBrandDto);
    return await brand.save();
  }

  async findAll(search: string) {
    const brands = await this.brandModel.find().where('name').regex(new RegExp(search, 'i'));
    return brands;
  }

  async findOne(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid Brand ID')
    const brand = await this.brandModel.findById(_id);
    if (!brand)
      throw new BadRequestException("Brand not found")
    return brand;
  }

  async update(_id: string, updateBrandDto: UpdateBrandDto) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid brand ID')
    const newBrand = await this.brandModel.findByIdAndUpdate(_id, updateBrandDto, { new: true });
    if (!newBrand)
      throw new BadRequestException("Brand not found")
    return newBrand;
  }

  async remove(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid brand ID')
    const brand = await this.brandModel.findByIdAndDelete(_id);
    if (!brand)
      throw new BadRequestException("Brand not found")
  }
}

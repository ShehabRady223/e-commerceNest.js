import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './entities/coupon.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CouponService {

  constructor(@InjectModel(Coupon.name) private readonly CouponModel: Model<Coupon>) { }

  async create(createCouponDto: CreateCouponDto) {
    const currentDate = Date.now();
    if (currentDate > new Date(createCouponDto.expirdate).getTime())
      throw new BadRequestException('expirdate must be in future')
    const existingCoupon = await this.CouponModel.findOne({ name: createCouponDto.name });
    if (existingCoupon)
      throw new BadRequestException('Coupon name already exists');
    const Coupon = new this.CouponModel(createCouponDto);
    return await Coupon.save();
  }

  async findAll(search: string) {
    const Coupons = await this.CouponModel.find().where('name').regex(new RegExp(search, 'i'));
    return Coupons;
  }

  async findOne(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid Coupon ID')
    const Coupon = await this.CouponModel.findById(_id);
    if (!Coupon)
      throw new BadRequestException("Coupon not found")
    return Coupon;
  }

  async update(_id: string, updateCouponDto: UpdateCouponDto) {
    // console.log(updateCouponDto.expirdate);
    // console.log(new Date());
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid Coupon ID')
    const currentDate = Date.now()
    if (updateCouponDto.expirdate && currentDate > new Date(updateCouponDto.expirdate).getTime())
      throw new BadRequestException('expirdate must be at future')
    const newCoupon = await this.CouponModel.findByIdAndUpdate(_id, updateCouponDto, { new: true });
    if (!newCoupon)
      throw new BadRequestException("Coupon not found")
    return newCoupon;
  }

  async remove(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException('Invalid Coupon ID')
    const Coupon = await this.CouponModel.findByIdAndDelete(_id);
    if (!Coupon)
      throw new BadRequestException("Coupon not found")
  }
}

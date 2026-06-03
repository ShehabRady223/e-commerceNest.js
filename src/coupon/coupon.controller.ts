import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UsePipes, ValidationPipe, HttpStatus, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@UseGuards(RolesGuard)
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @Roles(["admin"])
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCouponDto: CreateCouponDto) {
    const coupon = await this.couponService.create(createCouponDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Coupon created successfully',
      coupon
    }
  }

  @Roles(["admin"])
  @Get()
  async findAll(@Query('search') search: string) {
    const coupons = await this.couponService.findAll(search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupons found successfully',
      data: coupons
    }
  }

  @Roles(["admin"])
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.couponService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon found successfully',
      data
    }
  }

  @Roles(["admin"])
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    const data = await this.couponService.update(id, updateCouponDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon updated successfully',
      data
    }
  }

  @Roles(["admin"])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.couponService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon removed successfully'
    }
  }
}

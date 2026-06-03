import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UsePipes, ValidationPipe, HttpStatus, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createBrandDto: CreateBrandDto) {
    const brand = await this.brandService.create(createBrandDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Brand created successfully',
      brand
    }
  }

  @Get()
  async findAll(@Query('search') search: string) {
    const brands = await this.brandService.findAll(search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Brands found successfully',
      data: brands
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.brandService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Brand found successfully',
      data
    }
  }

  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const data = await this.brandService.update(id, updateBrandDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Brand updated successfully',
      data
    }
  }

@Roles(['admin'])
  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'brand removed successfully'
    }
  }
}

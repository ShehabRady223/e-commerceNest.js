import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, HttpStatus, Query, Put } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  /**
   * Handles creation of a new sub-category.
   * HTTP POST `/sub-category` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    const data = await this.subCategoryService.create(createSubCategoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sub-category created successfully',
      data
    }
  }

  /**
   * Retrieves a paginated list of sub-categories.
   * HTTP GET `/sub-category`. Optionally filters results by the `search` query parameter.
   */
  @Get()
  async findAll(@Query('search') search: string) {
    const categories = await this.subCategoryService.findAll(search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Categories found successfully',
      data: categories
    }
  }

  /**
   * Retrieves a single sub-category by its unique identifier.
   * HTTP GET `/sub-category/:id`.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.subCategoryService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category found successfully',
      data
    }
  }

  /**
   * Updates an existing sub-category.
   * HTTP PUT `/sub-category/:id` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    const data = await this.subCategoryService.update(id, updateCategoryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data
    }
  }

  /**
   * Deletes a sub-category by its unique identifier.
   * HTTP DELETE `/sub-category/:id`.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
        await this.subCategoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category removed successfully'
    }
  }
}

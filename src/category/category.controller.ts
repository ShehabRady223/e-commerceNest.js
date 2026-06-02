import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, HttpStatus, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { Roles } from '../auth/decorators/role.decorator';


@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  /**
   * Handles creation of a new category.
   * HTTP POST `/category` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoryService.create(createCategoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
      data
    }
  }

  /**
   * Retrieves a paginated list of categories.
   * HTTP GET `/category`. Optionally filters results by the `search` query parameter.
   */
  @Get()
  async findAll(@Query('search') search: string) {
    const categories = await this.categoryService.findAll(search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Categories found successfully',
      data: categories
    }
  }

  /**
   * Retrieves a single category by its unique identifier.
   * HTTP GET `/category/:id`.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoryService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category found successfully',
      data
    }
  }

  /**
   * Updates an existing category.
   * HTTP PUT `/category/:id` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Put(':id')
  // @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,skipMissingProperties:true }))
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const data = await this.categoryService.update(id, updateCategoryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data
    }
  }

  /**
   * Deletes a category by its unique identifier.
   * HTTP DELETE `/category/:id` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category removed successfully'
    }
  }
}

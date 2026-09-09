import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UsePipes, ValidationPipe, HttpStatus, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { QueryParams } from './dto/QueryParams';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  /**
   * Handles creation of a new product.
   * HTTP POST `/product` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'product created successfully',
      product
    }
  }

  /**
   * Retrieves a paginated list of products.
   * HTTP GET `/product`. Supports `page`, `limit`, `keyword`, `sortBy`, and `sortOrder` query parameters.
   */
  @Get()
  async findAll(@Query() queryParams: QueryParams) {
    const products = await this.productService.findAll(queryParams);
    return {
      statusCode: HttpStatus.OK,
      message: "products found successfully",
      products
    }
  }

  /**
   * Retrieves a single product by its unique identifier.
   * HTTP GET `/product/:id`.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "product found successfully",
      product
    }
  }

  /**
   * Updates an existing product.
   * HTTP PUT `/product/:id` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productService.update(id, updateProductDto);
    return {
      statusCode: HttpStatus.OK,
      message: "product found successfully",
      updatedProduct
    }
  }

  /**
   * Deletes a product by its unique identifier.
   * HTTP DELETE `/product/:id` (restricted to users with the `admin` role).
   */
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: "product deleted successfully",
    }
  }
}

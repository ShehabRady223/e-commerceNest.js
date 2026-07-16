import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, HttpStatus, Put } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const review = await this.reviewService.create(createReviewDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'review created successfully',
      data: review
    }
  }

  @Get(':id')
  async findAllReviewByProduct(@Param('id') productId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'reviews fetched successfully',
      data: await this.reviewService.findAllReviewByProduct(productId)
    }
  }

  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Get('user/:id')
  async findAllReviewByUser(@Param('id') userId: string) {
    // const reviews = await this.reviewService.findOne(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'reviews fetched successfully',
      data: await this.reviewService.findAllReviewByUser(userId)
    }
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(@Param('id') reviewId: string, @Req() req, @Body() updateReview: UpdateReviewDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'review updated successfully',
      data: await this.reviewService.update(reviewId, req.user.id, updateReview)
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') reviewId: string, @Req() req) {
    return {
      statusCode: HttpStatus.OK,
      message: 'review deleted successfully',
      data: await this.reviewService.remove(reviewId, req.user.id, req.user.role === 'admin')
    }
  }
}

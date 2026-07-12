import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './entities/review.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) { }

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const reviewExists = await this.reviewModel.findOne({ product: createReviewDto.product, user: userId });
    if (reviewExists)
      throw new NotFoundException('Review already exists for this product by this user');
    const review = new this.reviewModel({ ...createReviewDto, user: userId });
    await review.populate({
      path: 'product',
      select: 'title description category', //// Must include 'category' so Mongoose knows what to populate next
      populate: {
        path: 'category',
        select: 'name',
      },
    });
    return await review.save();
  }

  async findAll(productId: string) {
    const reviews = await this.reviewModel.find({ product: productId }).populate('product user', 'name email title').select('-__v').exec();
    if (!reviews || reviews.length === 0)
      throw new NotFoundException('No reviews found for this product');
    //* 36 ms with populate and 23ms without populate for one review
    // await Promise.all(reviews.map(review => review.populate({
    //   path: 'product',
    //   select: 'title description category',
    //   populate: {
    //     path: 'category',
    //     select: 'name',
    //   },
    // })));
    return reviews;
  }

  async findOne(userId: string) {
    const isValid = mongoose.Types.ObjectId.isValid(userId);
    if (!isValid)
      throw new BadRequestException("Invalid Review ID")
    const reviews = await this.reviewModel.find({ user: userId }).populate('user').populate('product', 'title').exec();
    if (!reviews || reviews.length === 0)
      throw new NotFoundException('No reviews found for this user');
    return reviews;
  }

//TODO Test update and delete review ,Or pray to it works fine (I choose choice number 2)

  async update(reviewId: string, userId: string, updateReview: UpdateReviewDto) {
    const isValid = mongoose.Types.ObjectId.isValid(reviewId);
    if (!isValid)
      throw new BadRequestException("Invalid Review ID")
    const review = await this.reviewModel.findById(reviewId);
    if (!review)
      throw new NotFoundException('Review not found');
    if (review.user.toString() !== userId)
      throw new ForbiddenException('You do not have permission to edit this review');
    // if (updateRating.rating !== undefined)
    // review.rating = updateReview.rating ?? review.rating;
    // review.reviewText = updateReview.reviewText ?? review.reviewText;
    Object.assign(review, updateReview);
    return await review.save();
  }

  async remove(reviewId: string, userId: string, isAdmin: boolean = false) {
    if (!mongoose.Types.ObjectId.isValid(reviewId))
      throw new BadRequestException('Invalid Review ID');

    const review = await this.reviewModel.findById(reviewId);
    if (!review)
      throw new NotFoundException('Review not found');

    const isOnwer = review.user.toString() !== userId
    if (!isOnwer && !isAdmin)
      throw new ForbiddenException('You do not have permission to delete this review');

    await review.deleteOne();
    return review;
  }
}
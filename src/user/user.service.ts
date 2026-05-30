import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { QueryParams } from './dto/query-params';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findAll(queryParams: QueryParams) {
    const { page = 1, limit = 3, search } = queryParams;
    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query['name'] = { $regex: search, $options: 'i' };
    }
    const users = await this.userModel.find(query).skip(skip).limit(limit);
    return users;
  }

  async findOne(_id: string) {
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId)
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    const user = await this.userModel.findById(_id);
    if (!user)
      throw new NotFoundException('User not found');
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserDto) {
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId)
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    const newUser = await this.userModel.findByIdAndUpdate(_id, updateUserDto, { new: true });
    if (!newUser)
      throw new NotFoundException('User not found');
    return newUser;
  }

  async remove(_id: string) {
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId)
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    const user = await this.userModel.findByIdAndDelete(_id);
    console.log(user);
    if (!user)
      throw new NotFoundException('User not found');
  }
}

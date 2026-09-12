import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { QueryParams } from './dto/query-params';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService) { }

  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const { email, password } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      createUserDto.avatar = uploadResult.secure_url;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    createUserDto.password = hashedPassword;
    const newUser = new this.userModel(createUserDto);
    await newUser.save();
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId)
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    const { password } = updateUserDto;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateUserDto.password = hashedPassword;
    }
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      updateUserDto.avatar = uploadResult.secure_url;
    }
    const newUser = await this.userModel.findByIdAndUpdate(_id, updateUserDto, { new: true });
    if (!newUser) throw new NotFoundException('User not found');
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }

  async remove(_id: string) {
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId)
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    const user = await this.userModel.findByIdAndDelete(_id);
    console.log(user);
    if (!user) throw new NotFoundException('User not found');
  }
}

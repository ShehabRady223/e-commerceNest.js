import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwtPayload';
import * as bcrypt from 'bcrypt';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    const hasheedPassword = await bcrypt.hash(password, 10);
    signupDto.password = hasheedPassword;
    const user = new this.userModel(signupDto);
    await user.save();
    const payload: JwtPayload = {
      id: user._id,
      name: signupDto.name,
      role: 'user',
    };
    const token = await this.jwtService.signAsync(payload);
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return { user: userWithoutPassword, token };
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const payload: JwtPayload = {
      id: user._id,
      name: user.name,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return { user: userWithoutPassword, token };
  }
}

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
  ) { }

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    const hasheedPassword = await bcrypt.hash(password, 10);
    signupDto.password = hasheedPassword;
    const user = new this.userModel(signupDto);
    await user.save();
    const tokens = await this.generateTokenPair({ id: String(user._id), name: user.name, role: user.role });
    await this.persistRefreshTokenHash(String(user._id), tokens.refreshToken);
    const userObject = user.toObject();
    const { password: _pw, hashedRefreshToken: _hrt, ...safeUser } = userObject;
    return { user: safeUser, ...tokens };
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokenPair({ id: String(user._id), name: user.name, role: user.role });
    await this.persistRefreshTokenHash(String(user._id), tokens.refreshToken);
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return { user: userWithoutPassword, ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET});
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.userModel
      .findById(payload.id)
      .select('+hashedRefreshToken');
    if (!user || !user.hashedRefreshToken) {
      // No refresh token is stored in the first place
      // (either they logged out previously or the account was deleted)
      throw new UnauthorizedException('Access denied');
    }
    const isTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isTokenValid) {
      // This is a critical security scenario: An old token was reused (Refresh Token Reuse).
      // This means either the token was stolen, or two clients are trying to use the same session.
      // The secure course of action: Immediately revoke all current sessions for the user (Revoke All).
      user.hashedRefreshToken = undefined;
      await user.save();
      throw new UnauthorizedException('Refresh token reuse detected, all sessions revoked',);
    }
    const tokens = await this.generateTokenPair({ id: String(user._id), name: user.name, role: user.role });
    await this.persistRefreshTokenHash(String(user._id), tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: null,
    });
  }

  private async generateTokenPair(basePayload: { id: string, name: string, role: string }) {
    const accessPayload: JwtPayload = { ...basePayload, type: 'access' };
    const refreshPayload: JwtPayload = { ...basePayload, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d', })
    ]);

    return { accessToken, refreshToken };
  }
  private async persistRefreshTokenHash(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { hashedRefreshToken });
  }
}

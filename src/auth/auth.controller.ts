import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Registers a new customer account with validated credentials.
   * Persists the user and returns profile data with a JWT access token.
   */
  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.signup(signupDto);
    this.setRefreshTokenCookie(res, refreshToken);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'signup successfully',
      user,
      accessToken,
    };
  }

  /**
   * Authenticates an existing user with email and password.
   * Verifies credentials and returns profile data with a JWT access token.
   */
  @Post('signin')
  @UsePipes(new ValidationPipe())
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.signin(signinDto);
    this.setRefreshTokenCookie(res, refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'signin successfully',
      user,
      accessToken: accessToken,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response,) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    this.setRefreshTokenCookie(res, newRefreshToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'token refreshed successfully',
      accessToken,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return {
      statusCode: HttpStatus.OK,
      message: 'logout successfully',
    };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, // Prevents JavaScript access to the cookie (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Sent over HTTPS only in production
      sameSite: 'strict', // Prevents sending the cookie in cross-site requests (CSRF protection)
      path: '/auth/refresh', // Sent only to /auth/refresh, not the entire API
      maxAge: 7 * 24 * 60 * 60 * 1000 //7 days in MS
    })
  }
}

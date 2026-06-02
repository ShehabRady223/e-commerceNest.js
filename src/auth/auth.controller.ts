import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
//* add refreshtoken to the system
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new customer account with validated credentials.
   * Persists the user and returns profile data with a JWT access token.
   */
  @Post('signup')
  @UsePipes(new ValidationPipe())
  async signup(@Body() signupDto: SignupDto) {
    const { user, token } = await this.authService.signup(signupDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'signup successfully',
      user,
      accessToken: token,
    };
  }

  /**
   * Authenticates an existing user with email and password.
   * Verifies credentials and returns profile data with a JWT access token.
   */
  @Post('signin')
  @UsePipes(new ValidationPipe())
  async signin(@Body() signinDto: SigninDto) {
    const { user, token } = await this.authService.signin(signinDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'signin successfully',
      user,
      accessToken: token,
    };
  }
}

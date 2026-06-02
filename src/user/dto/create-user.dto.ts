import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'the name is required' })
  @IsString()
  @MinLength(3, { message: 'the name must be at least 3 characters' })
  @MaxLength(15, { message: 'the name must be less than 15 characters' })
  name!: string;

  @IsEmail(undefined, { message: 'please enter a valid email' })
  @IsNotEmpty({ message: 'the email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'the password is required' })
  @MinLength(4, { message: 'the password must be at least 4 characters' })
  password!: string;

  @IsEnum(['user', 'admin'], { message: 'Invalid role' })
  @IsNotEmpty({ message: 'the role is required' })
  role!: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['male', 'female'])
  gender?: string;
}

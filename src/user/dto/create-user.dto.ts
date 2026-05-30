import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'the name is required' })
    @IsString()
    name!: string;

    @IsEmail(undefined, { message: 'please enter a valid email' })
    @IsNotEmpty({ message: 'the email is required' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'the password is required' })
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

import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateBrandDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(3, { message: 'the name must be at least 3 characters' })
    @MaxLength(30, { message: 'the name must be less than 30 characters' })
    name!: string;

    @IsUrl({}, { message: 'Invalid URL format' })
    @IsOptional()
    image?: string;
}

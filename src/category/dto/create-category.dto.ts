import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name!: string;

    @IsUrl({}, { message: 'Invalid URL format' })
    @IsOptional()
    image?: string;
}

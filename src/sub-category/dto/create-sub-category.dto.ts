import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSubCategoryDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name is required' })
    @MinLength(3, { message: 'the name must be at least 3 characters' })
    @MaxLength(30, { message: 'the name must be less than 30 characters' })
    name!: string;

    @IsMongoId({ message: 'category ID must be valid' })
    @IsNotEmpty({ message: 'category ID is required' })
    category!: string;
}

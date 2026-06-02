import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateSubCategoryDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name is required' })
    name!: string;

    @IsMongoId({ message: 'category ID must be valid' })
    @IsNotEmpty({ message: 'category ID is required' })
    category!: string;
}

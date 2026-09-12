import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from "class-validator";


export class CreateProductDto {
    @IsNotEmpty({ message: "title can't be null" })
    @IsString({ message: "title must be a string" })
    @MinLength(3, { message: "title must be at least 3 characters" })
    title!: string;
    @MinLength(20, { message: "description must be at least 3 characters" })
    @IsNotEmpty({ message: "description can't be null" })
    @IsString({ message: "description must be a string" })
    description!: string;
    @IsNotEmpty({ message: "quantity can't be null" })
    @IsNumber({}, { message: "quantity must be a number" })
    @Type(() => Number)
    @Min(1, { message: "quantity must be at least 1 item" })
    quantity!: number;
    @IsNotEmpty({ message: "price can't be null" })
    @Type(() => Number)
    @IsNumber({}, { message: "price must be a number" })
    @Min(1, { message: "price can't be less than 0 pound" })
    price!: number
    // @IsNotEmpty({ message: "image cover can't be null" })
    // @IsUrl({}, { message: "image cover must be a valid url" })
    imageCover!: string;
    @IsNotEmpty({ message: "category can't be null" })
    @IsMongoId({ message: "category ID must be a vaild" })
    category!: string;

    @IsOptional()
    @IsArray()
    // @IsUrl({}, { each: true })
    images?: string[];
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    sold?: number;
    @IsOptional()
    @IsArray()
    color?: string[];

    @IsOptional()
    @IsMongoId()
    subCategory?: string;
    @IsMongoId()
    @IsOptional()
    brand?: string;
}

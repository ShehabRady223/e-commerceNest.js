import { Optional } from "@nestjs/common";
import { IsMongoId, IsNumber, IsString, Max, Min, MinLength } from "class-validator";

export class CreateReviewDto {
    @Optional()
    @IsString({ message: "reviewText must be a string" })
    @MinLength(3, { message: "reviewText must be at least 3 characters" })
    reviewText?: string;
    @IsNumber({}, { message: "rating must be a number" })
    @Min(1, { message: "rating must be at least 1" })
    @Max(5, { message: "rating can't be more than 5" })
    rating!: number;
    @IsMongoId({ message: "user ID must be a valid" })
    product!: string;
}

import { IsDateString, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateCouponDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(3, { message: 'the name must be at least 3 characters' })
    @MaxLength(10, { message: 'the name must be less than 10 characters' })
    name!: string;

    //why cant pass Date.now() ?
    // cause Date.now() is number 
    // @IsDate()
    @IsDateString({}, { message: 'expirdate must be a date' })
    expirdate!: Date;
    @IsNumber({}, { message: 'Discount must be a number' })
    @Min(0, { message: 'Discount must be more than 0 pound' })
    discount!: number
}

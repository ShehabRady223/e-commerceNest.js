import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsMongoId, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateCartItemDto {
    @IsMongoId({ message: 'Invalid product id' })
    productId!: string;

    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity!: number;

    @IsOptional()
    @IsString({ message: 'Color must be a string' })
    color?: string;
}

export class CreateCouponDto {
    @IsMongoId({ message: 'Invalid coupon id' })
    couponId!: string;
}

export class CreateCartDto {
    @IsOptional()
    @IsArray({ message: 'Cart items must be an array' })
    @ArrayMinSize(1, { message: 'Cart must contain at least one item' })
    @ValidateNested({ each: true })
    @Type(() => CreateCartItemDto)
    cartItems?: CreateCartItemDto[];

    @IsOptional()
    @IsArray({ message: 'Coupon must be an array' })
    @ValidateNested({ each: true })
    @Type(() => CreateCouponDto)
    coupon?: CreateCouponDto[];
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { Product } from '../../product/entities/product.entity';

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: Types.ObjectId, required: true, ref: User.name })
    user!: Types.ObjectId;

    @Prop({
        type: [
            {
                productId: { type: Types.ObjectId, ref: Product.name, required: true },
                quantity: { type: Number, default: 1, required: true },
                color: { type: String },
                price: { type: Number, required: true },
                // price: { type: Number, required: false, default: 0 },
            },
        ],
        required: true,
    })
    cartItems!: Array<{
        productId: Types.ObjectId | Product;
        quantity: number;
        color?: string;
        price: number;
        // price?: number;
    }>;

    @Prop({
        type: [{
            name: { type: String },
            couponId: { type: Types.ObjectId, ref: Coupon.name },
        }],
        required: false,
    })
    coupon?: Array<{ name: string; couponId: string }>;

    @Prop({ type: Number, required: true, default: 0 })
    totalPrice!: number;

    @Prop({ type: Number, required: true, default: 0 })
    totalPriceAfterDiscount!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
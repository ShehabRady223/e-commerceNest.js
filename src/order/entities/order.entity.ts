import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../product/entities/product.entity";

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
}

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, required: true, ref: User.name })
    user!: Types.ObjectId;
    @Prop({ type: String, required: false })
    sessionId?: string;
    @Prop({
        type: [
            {
                productId: { type: Types.ObjectId, ref: Product.name, required: true },
                quantity: { type: Number, default: 1, required: true },
                color: { type: String },
                price: { type: Number, required: true },
            },
        ],
        required: true,
    })
    cartItems!: Array<{
        productId: Types.ObjectId | Product;
        quantity: number;
        color?: string;
        price: number;
    }>;
    @Prop({ type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.CASH, required: true })
    paymentMethod!: string;
    @Prop({ type: Number, required: false, default: 0 })
    shippingPrice?: number;
    @Prop({ type: Number, required: true, default: 0 })
    totalOrderPrice!: number;
    @Prop({ type: Boolean, required: false, default: false })
    isPaid?: boolean
    @Prop({ type: Date, required: false })
    paidAt?: Date
    @Prop({ type: Boolean, required: false, default: false })
    isDeliverd?: boolean
    @Prop({ type: Date, required: false })
    deliverdAt?: Date
    @Prop({ type: String, required: true, default: 0 })
    shippingAddress!: string;
}

export const orderSchema = SchemaFactory.createForClass(Order);

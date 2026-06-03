import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ required: true, trim: true, maxLength: 10, minlength: 3, unique: true })
    name!: string;
    @Prop({ type: Date, required: true, min: Date.now() })
    expirdate!: Date;
    @Prop({ type: Number, required: true, min: 0 })
    discount!: number
}

export const CouponScheam = SchemaFactory.createForClass(Coupon);

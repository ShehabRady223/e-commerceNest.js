import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ required: true, trim: true, maxLength: 10, minlength: 3, unique: true })
    name!: string;
    // @Prop({ type: Date, required: true, validate: { validator: (value: Date) => value > new Date(), message: 'The date cannot be in the past!' } })
    @Prop({ type: Date, required: true, min: Date.now() })
    expirdate!: Date;
    @Prop({ type: Number, required: true, min: 0 })
    discount!: number
}

export const CouponScheam = SchemaFactory.createForClass(Coupon);

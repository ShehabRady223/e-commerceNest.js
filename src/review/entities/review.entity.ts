import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: String, trim: true, minLength: [3, "Review text must be at least 3 characters"] })
    reviewText?: string;
    @Prop({ type: Number, required: true, min: [1, "Rating must be at least 1"], max: [5, "Rating can't be more than 5"] })
    rating!: number;
    @Prop({ type: mongoose.Types.ObjectId, required: true, ref: "User" })
    user!: string;
    @Prop({ type: mongoose.Types.ObjectId, required: true, ref: "Product" })
    product!: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

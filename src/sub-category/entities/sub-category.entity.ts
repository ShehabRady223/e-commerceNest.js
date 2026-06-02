import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class SubCategory {
    @Prop({ required: true, minLength: 3, maxLength: 20, trim: true })
    name!: string;

    @Prop({ type: mongoose.Types.ObjectId, required: true, ref: 'Category' })
    category!: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

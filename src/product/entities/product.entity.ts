import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Category } from "../../category/entities/category.entity";
import { SubCategory } from "../../sub-category/entities/sub-category.entity";
import { Brand } from "../../brand/entities/brand.entity";


@Schema({ timestamps: true })
export class Product {
    //Requirements
    @Prop({ type: String, required: true, unique: true, trim: true, minLength: [3, "Title must be at least 3 characters"] })
    title!: string;
    @Prop({ type: String, required: true, trim: true, minLength: [20, "Description must be at least 20 characters"] })
    description!: string;
    @Prop({ type: Number, required: true, trim: true, min: [1, "Quantity must be at least 1 item"] })
    quantity!: number;
    @Prop({ type: Number, required: true, min: [0, "Price can't be less than 0 pound "] })
    price!: number
    @Prop({ type: String, required: true })
    imageCover!: string;
    @Prop({ type: mongoose.Types.ObjectId, required: true, ref: Category.name })
    category!: string;
    //Optional
    @Prop({ type: [String], required: false })
    images?: string[];
    @Prop({ type: Number, required: false, default: 0 })
    sold?: number;
    @Prop({ type: [String] })
    color?: string[];
    @Prop({ type: Number, default: 0 })
    ratingsAverage?: number
    @Prop({ type: Number, default: 0 })
    ratingsQuantity?: number
    //Optinal Relations
    @Prop({ type: mongoose.Types.ObjectId, ref: SubCategory.name })
    subCategory?: string;
    @Prop({ type: mongoose.Types.ObjectId, ref: Brand.name })
    brand?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

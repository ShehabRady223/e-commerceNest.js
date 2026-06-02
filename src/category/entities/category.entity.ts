import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, unique: true, minLength: 3, maxLength: 30, trim: true })
    name!: string;

    @Prop()
    image?: string
}

export const CategorySchema = SchemaFactory.createForClass(Category);

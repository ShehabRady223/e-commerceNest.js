import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Brand {
    @Prop({ required: true, trim: true, maxLength: 10, minlength: 3, unique: true })
    name!: string;
    @Prop({ type: String })
    image?: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

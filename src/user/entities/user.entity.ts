import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from "mongoose";

// export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
//versionKey:false it hidde __v field from the document
export class User {
  @Prop({ required: true, minLength: 3, maxLength: 30, trim: true })
  name!: string;
  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true,
    lowercase: true,
  })
  email!: string;
  @Prop({ required: true, minLength: 4, select: false })
  password!: string;
  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role!: string;
  @Prop()
  avatar?: string;
  @Prop()
  age?: number;
  // just accept Egyptian number
  @Prop({ match: /^(?:\+20|0)?1[0125][0-9]{8}$/ })
  phoneNumber?: string;
  @Prop({ trim: true })
  address?: string;
  @Prop({ type: Boolean, default: true })
  isActive?: boolean;
  @Prop({ select: false })
  verificationCode?: string;
  @Prop({ enum: ['male', 'female'] })
  gender?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

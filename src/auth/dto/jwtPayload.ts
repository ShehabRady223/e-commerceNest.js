import mongoose from 'mongoose';

export type JwtPayload = {
  id: mongoose.Types.ObjectId;
  name: string;
  role: string;
};

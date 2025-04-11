import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;  // Clerk user ID
  credits: number;
  totalQuestionsGenerated: number;
  createdAt: Date;
  lastCreditRefresh: Date;
}

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  credits: {
    type: Number,
    default: 100, 
    min: 0
  },
  totalQuestionsGenerated: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastCreditRefresh: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
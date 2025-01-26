import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  userId: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  difficulty: string;
  createdAt: Date;
  timesAnswered: number;
  averageScore: number;
}

const QuestionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  field: {
    type: String,
    required: true,
    index: true
  },
  subField: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionGroup extends Document {
  userId: string;
  name: string;
  field: string;
  subField: string;
  questions: string[]; // Array of question IDs
  currentIndex: number;
  scores: number[];
  completed: boolean;
  createdAt: Date;
  lastAccessedAt: Date;
}

const QuestionGroupSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  subField: {
    type: String,
    required: true
  },
  questions: {
    type: [String],
    required: true
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  scores: {
    type: [Number],
    default: []
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.QuestionGroup || mongoose.model<IQuestionGroup>('QuestionGroup', QuestionGroupSchema); 
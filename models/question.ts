import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  userId: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  userAnswer?: string;
  attempts: {
    answer: string;
    score: number;
    timestamp: Date;
  }[];
  difficulty: string;
  notes: {
    id: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  lastReviewedAt?: Date;
  scores: number[];
  averageScore: number;
  timesAnswered: number;
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
  userAnswer: {
    type: String
  },
  
  attempts: [{
    answer: String,
    score: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  notes: [{
    id: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastReviewedAt: {
    type: Date
  },
  scores: {
    type: [Number],
    default: []
  },
  averageScore: {
    type: Number,
    default: 0
  },
  timesAnswered: {
    type: Number,
    default: 0
  }
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
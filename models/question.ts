import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  userId: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  userAnswer?: string;
  score?: number;
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
  score: {
    type: Number
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
  }
});

// Virtual for getting average score
QuestionSchema.virtual('averageScore').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  const sum = this.attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  return Number((sum / this.attempts.length).toFixed(1));
});

// Virtual for getting best score
QuestionSchema.virtual('bestScore').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  return Math.max(...this.attempts.map(a => a.score || 0));
});

// Virtual for getting latest score
QuestionSchema.virtual('latestScore').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  return this.attempts[this.attempts.length - 1].score;
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
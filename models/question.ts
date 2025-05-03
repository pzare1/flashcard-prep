import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  userAnswer?: string;
  attempts: {
    userId: string;
    answer: string;
    score: number;
    feedback?: string;
    keyPoints?: string[];
    strengthAreas?: string[];
    weaknessAreas?: string[];
    technicalAccuracy?: number;
    suggestedResources?: string[];
    practicalApplication?: string;
    timeTaken?: number;
    timestamp: Date;
    evaluationResults?: {
      score: number;
      time?: number;
      keyPoints: string[];
      strengths: string[];
      improvementAreas: string[];
      practicalApplication?: string;
      resources?: string[];
    };
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
  isPublic?: boolean;
}

const QuestionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: false
  },
  jobDescription: {
    type: String,
    required: false
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
  isPublic: {
    type: Boolean,
    default: false
  },
  attempts: [{
    userId: {
      type: String,
      required: true
    },
    answer: String,
    score: Number,
    feedback: String,
    keyPoints: [String],
    strengthAreas: [String],
    weaknessAreas: [String],
    technicalAccuracy: Number,
    suggestedResources: [String],
    practicalApplication: String,
    timeTaken: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    evaluationResults: {
      score: Number,
      time: Number,
      keyPoints: [String],
      strengths: [String],
      improvementAreas: [String],
      practicalApplication: String,
      resources: [String]
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
import mongoose, { Schema } from 'mongoose';

const QuestionSchema = new Schema({
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
  userId: {
    type: String,
    required: true,
    index: true
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

export default Question;
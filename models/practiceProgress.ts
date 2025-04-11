import mongoose, { Schema } from 'mongoose';

const PracticeProgressSchema = new Schema({
  userId: String,
  field: String,
  subField: String,
  questions: [String], // Store question IDs as strings
  currentIndex: Number,
  scores: [Number],
  totalTime: Number,
  streakCount: Number,
  isCompleted: Boolean,
  startedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
});

// Use a more reliable way to register the model
const PracticeProgress = mongoose.models.PracticeProgress || 
  mongoose.model('PracticeProgress', PracticeProgressSchema);

export default PracticeProgress; 
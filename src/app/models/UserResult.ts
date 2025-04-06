import mongoose, { Schema, model, models } from "mongoose";

const userResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    score: { type: Number },
    maxScore: { type: Number },
    grade: { type: String },
    submittedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number }
  });
  
  export default mongoose.models.UserResult || mongoose.model('UserResult', userResultSchema);
  
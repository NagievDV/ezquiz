import mongoose, { Schema, model, models } from "mongoose";

const userAnswerSchema = new mongoose.Schema({
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserResult', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: { type: Boolean },
    earnedPoints: { type: Number }
  });
  
  export default mongoose.models.UserAnswer || mongoose.model('UserAnswer', userAnswerSchema);
  
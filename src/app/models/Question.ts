import mongoose, { Schema, model, models } from "mongoose";

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['single', 'multiple', 'match', 'order'], 
      required: true 
    },
    points: { type: Number, default: 0 },
    imageUrl: { type: String }, 
    options: [String], 
    correctAnswer: mongoose.Schema.Types.Mixed,
    matchPairs: [{
      left: String,
      right: String
    }],
    order: [String]
  });
  
  export default mongoose.models.Question || mongoose.model('Question', questionSchema);
  
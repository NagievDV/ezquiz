import mongoose, { Schema, model, models } from "mongoose";

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['quiz', 'test'], required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String }
}, {
  timestamps: true,});

export default mongoose.models.Test || mongoose.model('Test', testSchema);


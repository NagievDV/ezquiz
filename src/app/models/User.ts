import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
export type UserDocument = mongoose.HydratedDocumentFromSchema<typeof userSchema>;
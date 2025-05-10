import mongoose, { Schema, model, models } from "mongoose";

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
  });
  
export default mongoose.models.Tag || mongoose.model('Tag', tagSchema);
export type TagDocument = mongoose.HydratedDocumentFromSchema<typeof tagSchema>;
import mongoose, { Schema, Document } from "mongoose";
import { User, SkillProfile } from "@/types";

export interface IUser extends Document, Omit<User, "userId"> {
  _id: string;
  password?: string; // Optional - Clerk handles authentication
}

const SkillProfileSchema = new Schema<SkillProfile>({
  arrays: { type: Number, default: 0 },
  strings: { type: Number, default: 0 },
  recursion: { type: Number, default: 0 },
  dp: { type: Number, default: 0 },
  graphs: { type: Number, default: 0 },
  trees: { type: Number, default: 0 },
  greedy: { type: Number, default: 0 },
  bitManipulation: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { 
      type: String, 
      required: false,
      default: null,
      select: false // Don't include in queries by default
    }, // Optional - Clerk handles authentication
    skills: { type: SkillProfileSchema, default: () => ({}) },
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Clear cached model to ensure fresh schema
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>("User", UserSchema);


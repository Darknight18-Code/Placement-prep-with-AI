import mongoose, { Schema, Document } from "mongoose";
import { Submission, AIAnalysis } from "@/types";

export interface ISubmission extends Document, Omit<Submission, "submissionId"> {
  _id: string;
}

const AIAnalysisSchema = new Schema<AIAnalysis>({
  approach: {
    type: String,
    enum: ["correct", "incorrect", "partial"],
    required: true,
  },
  feedback: { type: String, required: true },
  complexity: {
    time: { type: String },
    space: { type: String },
  },
  edgeCases: { type: [String] },
  suggestions: { type: [String] },
  hintLevel: { type: Number, default: 1 },
});

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
    status: {
      type: String,
      enum: ["partial", "correct", "incorrect"],
      default: "partial",
    },
    analysis: { type: AIAnalysisSchema },
    hintsUsed: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);


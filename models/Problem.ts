import mongoose, { Schema, Document } from "mongoose";
import { Problem } from "@/types";

export interface IProblem extends Omit<Document, "_id">, Omit<Problem, "problemId"> {
  _id: string;
}

const ExampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
});

const TestCaseSchema = new Schema({
  input: { type: Schema.Types.Mixed, required: true },
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  isHidden: { type: Boolean, default: false },
});

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    topic: { type: String, required: true },
    constraints: { type: String, required: true },
    examples: { type: [ExampleSchema], default: [] },
    hints: { type: [String], default: [] },
    testCases: { type: [TestCaseSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);


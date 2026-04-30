"use server";

import { db } from "@/lib/newdb";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProblemSchema = z.object({
  questionNo: z.coerce.number().int().positive("Question number must be positive"), // Added this
  title: z.string().min(3, "Title must be at least 3 characters"),
  topic: z.string().min(2, "Topic is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  description: z.string().min(10, "Description is too short"),
  constraints: z.string().optional(),
  metadata: z.object({
    fnName: z.string().min(1, "Function name is required"),
    returnType: z.string().min(1, "Return type is required"),
    params: z.array(z.object({
      name: z.string().min(1),
      type: z.string().min(1)
    }))
  }),
  examples: z.array(z.object({
    input: z.string().min(1),
    output: z.string().min(1),
    explanation: z.string().optional()
  })),
  testCases: z.array(z.object({
    input: z.string().min(1),
    expectedOutput: z.string().min(1),
    isSample: z.boolean().default(false),
    isHidden: z.boolean().default(false) // Added this to match your earlier UI changes
  })).min(1, "At least one test case is required"),
  hints: z.array(z.string()).optional()
});

export async function addProblem(data: any) {
  try {
    const validatedData = ProblemSchema.parse(data);

    const newProblem = await db.problem.create({
      data: {
        questionNo: validatedData.questionNo, // Added this
        title: validatedData.title,
        description: validatedData.description,
        difficulty: validatedData.difficulty,
        topic: validatedData.topic,
        constraints: validatedData.constraints || "",
        hints: validatedData.hints || [],
        metadata: validatedData.metadata, 
        examples: validatedData.examples,
        testCases: {
          create: validatedData.testCases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
            isHidden: tc.isHidden, // Added this
          })),
        },
      },
    });

    revalidatePath("/problems");
    return { success: true, id: newProblem.id };
  } catch (error: any) {
    // Catch Zod Validation Errors
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    // Catch Prisma Duplicate Key Error (P2002 is the code for unique constraint failure)
    if (error.code === 'P2002') {
      return { success: false, error: `Question No. ${data.questionNo} already exists!` };
    }

    console.error("Database Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
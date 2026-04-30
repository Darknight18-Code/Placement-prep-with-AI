import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/newdb"; // Ensure this points to your Prisma instance

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Fetch the problem by ID
    // We explicitly select metadata to ensure the CodeEditor can generate starter code
    const problem = await db.problem.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        topic: true,
        constraints: true,
        examples: true,
        hints: true,
        metadata: true, // This contains fnName, params, and returnType
      },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // 2. Format the response for the frontend
    const formattedProblem = {
      problemId: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      topic: problem.topic,
      constraints: problem.constraints,
      examples: problem.examples || [],
      hints: problem.hints || [],
      metadata: problem.metadata, 
    };

    return NextResponse.json({ problem: formattedProblem });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}
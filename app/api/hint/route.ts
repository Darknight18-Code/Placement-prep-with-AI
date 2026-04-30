import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";
import { generateHint } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, problemId, hintLevel } = await request.json();

    if (!code || !problemId || !hintLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const mappedProblem = {
      ...problem,
      problemId: problem.id,
    };

    const hint = await generateHint(code, mappedProblem as any, hintLevel);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Hint Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
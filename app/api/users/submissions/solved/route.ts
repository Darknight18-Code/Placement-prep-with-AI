import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ solvedIds: [] });

    const solvedSubmissions = await db.submission.findMany({
      where: {
        userId: userId,
        status: "correct",
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'], 
    });

    // CRITICAL: Explicitly convert the problemId to a String 
    // to ensure the frontend Set contains plain strings
    const solvedIds = solvedSubmissions.map((s) => String(s.problemId));

    return NextResponse.json({ solvedIds });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ solvedIds: [] }, { status: 500 });
  }
}
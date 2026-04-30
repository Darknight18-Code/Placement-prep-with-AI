import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the 10 most recent submissions with problem details
    const submissions = await db.submission.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topic: true,
          }
        }
      }
    });

    // 2. Calculate Topic Distribution for the Radar Chart
    // We only count 'correct' submissions for skill analysis
    const topicMap: Record<string, number> = {};
    
    // Fetch all successful submissions to get a full skill profile
    const allSolved = await db.submission.findMany({
      where: { 
        userId,
        status: "correct"
      },
      include: {
        problem: {
          select: { topic: true }
        }
      }
    });

    allSolved.forEach((sub) => {
      const topic = sub.problem.topic || "General";
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    return NextResponse.json({
      submissions,
      topicDistribution: topicMap
    });

  } catch (error) {
    console.error("Recent Submissions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
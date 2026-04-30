import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all successful submissions for this user
    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        status: "correct",
      },
      select: {
        createdAt: true,
      },
    });

    // 2. Group submissions by date (YYYY-MM-DD)
    // We want a result like: { "2024-05-20": 3, "2024-05-21": 1 }
    const activityMap: Record<string, number> = {};

    submissions.forEach((sub) => {
      const dateKey = sub.createdAt.toISOString().split("T")[0];
      activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
    });

    return NextResponse.json({ activity: activityMap });
  } catch (error) {
    console.error("Heatmap API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
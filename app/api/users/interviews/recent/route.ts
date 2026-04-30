import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We query Feedback but filter and sort based on the parent Interview
    const feedbacks = await db.feedback.findMany({
      where: {
        interview: {
          userId: userId, // Reaching into the Interview model
        },
      },
      orderBy: {
        interview: {
          createdAt: "desc", // Using Interview's timestamp since Feedback lacks one
        },
      },
      take: 10,
      include: {
        interview: {
          select: {
            jobRole: true,
            interviewType: true,
            createdAt: true, // We need this for the frontend trend chart
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching recent interviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
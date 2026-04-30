import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/newdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const difficulty = searchParams.get("difficulty");
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");

  try {
    const problems = await db.problem.findMany({
      where: {
        AND: [
          // Difficulty filter (Case-insensitive check)
          difficulty ? { difficulty: difficulty.toLowerCase() as any } : {},
          
          // Topic filter
          topic ? { topic: { contains: topic, mode: 'insensitive' } } : {},
          
          // Search filter (Title OR Question Number)
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              // If search is a number, check questionNo
              !isNaN(parseInt(search)) ? { questionNo: parseInt(search) } : {},
            ]
          } : {},
        ]
      },
      orderBy: { questionNo: 'asc' }, 
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
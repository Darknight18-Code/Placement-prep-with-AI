import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";
import { analyzeCode } from "@/lib/ai";

/**
 * Utility to clean AI output that might be wrapped in Markdown code blocks
 */
function sanitizeAIResponse(analysis: any) {
  if (!analysis) return null;

  let feedback = analysis.feedback || "";
  
  // Remove Markdown JSON blocks if present: ```json ... ```
  feedback = feedback.replace(/```json\n?|```text\n?|```/g, "").trim();
  
  // Handle cases where the AI might have been cut off or returned a partial JSON string
  if (feedback.startsWith("{") && feedback.endsWith("}")) {
    try {
      const parsed = JSON.parse(feedback);
      feedback = parsed.feedback || feedback;
    } catch (e) {
      // Not valid JSON, keep it as text
    }
  }

  return {
    ...analysis,
    feedback: feedback
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, language, problemId, hintLevel } = await request.json();

    if (!problemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch problem details
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Logic to determine if this is "starter code" or "empty"
    // This prevents the "Incorrect" icon from showing if the user hasn't started yet.
    const isStarterCode = !code || code.trim().length < 20;

    let analysis = await analyzeCode(
      code || "", 
      problem as any, 
      hintLevel || 1, 
      language || "javascript"
    );

    // Sanitize the text (Removes ```json and backticks)
    analysis = sanitizeAIResponse(analysis);

    // Override the approach if the user is just asking for a hint on empty code
    if (isStarterCode && analysis.approach === "incorrect") {
      analysis.approach = "hint"; // Use "hint" to avoid the red X icon
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const stats = await req.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an elite AI coding mentor for a software engineering platform.
      Look at the user's current platform statistics:
      - Problems Solved: ${stats.totalSolved}
      - Current Streak: ${stats.currentStreak} days
      - Success Rate: ${stats.successRate}%
      - Latest Mock Interview Score: ${stats.latestScore}%
      
      Generate exactly 3 short, punchy, and highly actionable insights or motivational tips for this user. 
      - If their streak is 0, encourage them to start.
      - If their success rate is low, tell them to focus on easier problems or review fundamentals.
      - If they have a high interview score, congratulate them and suggest tackling hard problems.
      
      Return ONLY a raw JSON array of 3 strings. Do not include markdown formatting like \`\`\`json.
      Example: ["Insight 1", "Insight 2", "Insight 3"]
    `;

    const result = await model.generateContent(prompt);
    let cleanText = result.response.text().trim();
    
    if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
    if (cleanText.startsWith("```")) cleanText = cleanText.substring(3);
    if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);

    const insights = JSON.parse(cleanText.trim());

    return NextResponse.json({ insights }, { status: 200 });

  } catch (error: any) {
    console.error("Insights API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights." },
      { status: 500 }
    );
  }
}
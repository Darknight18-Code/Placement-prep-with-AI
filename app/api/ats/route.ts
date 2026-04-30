import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. Extract JSON body instead of FormData
    const body = await req.json();
    const { resumeText, jd } = body;

    if (!resumeText || !jd) {
      return NextResponse.json(
        { error: "Resume text and Job Description are required." },
        { status: 400 }
      );
    }

    // 2. Connect to Gemini 1.5 Flash (Most stable for parsing text)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Construct the ATS Prompt
    const prompt = `
      You are an expert enterprise Applicant Tracking System (ATS) and a Senior Technical Recruiter.
      I will provide you with a candidate's Resume Text and a Target Job Description.
      
      Your task is to analyze the resume against the job description and return a JSON object with the exact structure below. Do not return any markdown formatting like \`\`\`json. Just return the raw JSON object.

      {
        "score": <number between 0 and 100 representing the ATS match percentage>,
        "summary": "<A 2-3 sentence professional summary of the candidate's fit for the role>",
        "missingKeywords": [<Array of up to 7 critical hard skills/keywords from the JD that are missing in the resume>],
        "matchedKeywords": [<Array of up to 7 critical hard skills/keywords that successfully matched>],
        "recommendations": [
          "<Actionable bullet point 1 on how to improve the resume>",
          "<Actionable bullet point 2 on how to improve the resume>",
          "<Actionable bullet point 3 on how to improve the resume>"
        ]
      }

      --- RESUME TEXT ---
      ${resumeText}

      --- TARGET JOB DESCRIPTION ---
      ${jd}
    `;

    // 4. Call Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 5. Clean up the response (in case Gemini wraps it in markdown)
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }

    // 6. Parse and send to frontend
    const parsedData = JSON.parse(cleanJson);
    return NextResponse.json(parsedData, { status: 200 });

  } catch (error: any) {
    console.error("ATS API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while communicating with Gemini AI." },
      { status: 500 }
    );
  }
}
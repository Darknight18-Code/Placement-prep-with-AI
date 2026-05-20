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
      
      Your task is to analyze the resume against the job description and return a JSON object. 
      
      CRITICAL: Calculate the "score" rigorously using the following weighted algorithm. Do not guess the score. 
      1. Hard Skills & Keywords (45% weight): Do they have the exact technical skills, languages, and tools required?
      2. Experience Match (30% weight): Do their years of experience and past responsibilities align with the JD requirements?
      3. Job Title Alignment (15% weight): Do their current/past job titles show a logical progression to this target role?
      4. Education & Certifications (10% weight): Do they meet the baseline educational or certification requirements?
      
      Sum these calculated weights to output the final integer score.

      Return ONLY a raw JSON object with the exact structure below. Do not include markdown formatting like \`\`\`json, and do not include any explanatory text outside the JSON.

      {
        "score": <calculated integer between 0 and 100 representing the exact ATS match percentage based on the rubric>,
        "summary": "<A 2-3 sentence professional summary of the candidate's fit for the role>",
        "missingKeywords": [<Array of up to 7 critical hard skills/keywords from the JD that are missing in the resume. Leave empty if none.>],
        "matchedKeywords": [<Array of up to 7 critical hard skills/keywords that successfully matched>],
        "recommendations": [
          "<Actionable bullet point 1 on how to improve the resume for this specific role>",
          "<Actionable bullet point 2 on how to improve the resume for this specific role>",
          "<Actionable bullet point 3 on how to improve the resume for this specific role>"
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
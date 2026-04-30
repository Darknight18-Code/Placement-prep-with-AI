"use server";

import { db } from "@/lib/newdb";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function createInterview(data: {
  jobRole: string;
  jobDesc: string;
  yearsOfExp: number;
  type: string;
  resumeText: string;
  questionCount: number;
}) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // 1. Define a strict JSON schema for the response
    const schema = {
      description: "List of interview questions",
      type: SchemaType.OBJECT,
      properties: {
        questions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["questions"],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
        maxOutputTokens: 2500, // Increased to ensure long questions aren't cut off
      },
    });

    const prompt = `
      You are an expert Technical Recruiter. Generate exactly ${data.questionCount} ${data.type} interview questions.
      Role: ${data.jobRole}
      Job Description: ${data.jobDesc}
      Candidate Experience: ${data.yearsOfExp} years
      Candidate Resume: ${data.resumeText}
      
      Ensure questions are complete, professional, and tailored to their specific projects and tech stack.
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    console.log("--- RAW AI OUTPUT ---");
    console.log(content);

    // 2. Parse the guaranteed JSON response
    const parsed = JSON.parse(content);
    const finalQuestions = parsed.questions || [];

    // 3. Save to MongoDB
    const interview = await db.interview.create({
      data: {
        userId,
        jobRole: data.jobRole,
        jobDescription: data.jobDesc,
        yearsOfExperience: data.yearsOfExp,
        interviewType: data.type,
        resumeText: data.resumeText,
        questionCount: data.questionCount,
        questions: finalQuestions, 
      },
    });

    return { success: true, id: interview.id };
  } catch (error) {
    console.error("Interview Generation Error:", error);
    return { success: false, error: "Failed to generate a full interview session." };
  }
}

export async function createFeedback(
  interviewId: string, 
  transcript: { question: string; answer: string }[]
) {
  try {
    // 1. Updated Schema to include specific categories
    const schema = {
      description: "Evaluation of interview performance with detailed scoring",
      type: SchemaType.OBJECT,
      properties: {
        totalScore: { type: SchemaType.NUMBER },
        overallFeedback: { type: SchemaType.STRING },
        // New category scores for your model
        communicationScore: { type: SchemaType.NUMBER },
        technicalScore: { type: SchemaType.NUMBER },
        problemSolvingScore: { type: SchemaType.NUMBER },
        fitScore: { type: SchemaType.NUMBER },
        confidenceScore: { type: SchemaType.NUMBER },
        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: [
        "totalScore", "overallFeedback", "strengths", "improvements",
        "communicationScore", "technicalScore", "problemSolvingScore", "fitScore", "confidenceScore"
      ],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use stable model
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    });

    const transcriptText = transcript
      .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
      .join("\n\n");

    const prompt = `
      System: You are a professional interviewer analyzing a mock interview.
      
      User Transcript:
      ${transcriptText}
      
      Please evaluate the candidate and score them from 0 to 100 in:
      - Communication Skills
      - Technical Knowledge
      - Problem-Solving
      - Cultural & Role Fit
      - Confidence & Clarity
      
      Provide an overall total score (0-100), overall feedback summary, 3 strengths, and 3 improvements.
    `;

    const result = await model.generateContent(prompt);
    const evaluation = JSON.parse(result.response.text());

    // 2. Save to MongoDB - Correcting 'content' to 'feedback'
    await db.interview.update({
      where: { id: interviewId },
      data: {
        finalized: true,
        feedback: {
          create: {
            totalScore: evaluation.totalScore,
            // FIX: This must be 'feedback' to match your Prisma model
            feedback: evaluation.overallFeedback, 
            
            // Map the AI scores to your Prisma fields
            communicationScore: evaluation.communicationScore,
            technicalScore: evaluation.technicalScore,
            problemSolvingScore: evaluation.problemSolvingScore,
            fitScore: evaluation.fitScore,
            confidenceScore: evaluation.confidenceScore,

            strengths: { set: evaluation.strengths },
            improvements: { set: evaluation.improvements },
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    return { success: false, error: "Failed to generate detailed feedback." };
  }
}

export async function deleteInterview(interviewId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Prisma will delete related feedback if you have 'onDelete: Cascade' in schema.
    // Otherwise, we delete the feedback manually first.
    await db.feedback.deleteMany({
      where: { interviewId: interviewId }
    });

    await db.interview.delete({
      where: { 
        id: interviewId,
        userId: userId // Security: Ensure users only delete their own interviews
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete interview session." };
  }
}
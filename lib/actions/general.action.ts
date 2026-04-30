"use server";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "@/lib/newdb";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Initialize the Google Provider with your custom .env variable
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * PHASE 1: Generate Questions
 * Called by the Agent during the "Setup" phase after voice gathering.
 */
export async function generateInterviewQuestions({ 
  interviewId, 
  count, 
  role, 
  techStack,
  level,
  type
}: { 
  interviewId: string, 
  count: number, 
  role: string, 
  techStack: string,
  level?: string,
  type?: string
}) {
  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        questions: z.array(z.string()),
      }),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level || "Mid"}.
        The tech stack used in the job is: ${techStack}.
        The focus between behavioural and technical questions should lean towards: ${type || "Technical"}.
        The amount of questions required is: ${count}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you!`,
    });

    // Save generated questions to MongoDB
    await db.interview.update({
      where: { id: interviewId },
      data: {
        questions: object.questions,
      },
    });

    // Refresh the page data so the UI switches to "Interview Mode"
    revalidatePath(`/interview/${interviewId}`);
    return { success: true };
  } catch (error) {
    console.error("Question Generation Error:", error);
    return { success: false };
  }
}

/**
 * PHASE 2: Create Feedback
 * Called by the Agent once the Vapi call ends and the transcript is ready.
 */
export async function createFeedback(params: {
  interviewId: string;
  userId: string;
  transcript: any[];
}) {
  const { interviewId, userId, transcript } = params;

  try {
    // Format the conversation for AI analysis
    const formattedTranscript = transcript
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        totalScore: z.number().min(0).max(100),
        finalAssessment: z.string(),
        strengths: z.array(z.string()),
        areasForImprovement: z.array(z.string()),
        categoryScores: z.array(z.object({
          name: z.string(),
          score: z.number().min(0).max(100),
          comment: z.string(),
        })),
      }),
      prompt: `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Save analysis to MongoDB
    const feedback = await db.feedback.create({
      data: {
        interviewId,
        userId,
        totalScore: object.totalScore,
        finalAssessment: object.finalAssessment,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        categoryScores: object.categoryScores as any,
        transcript: transcript as any,
      },
    });

    revalidatePath(`/interview/${interviewId}/feedback`);
    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    return { success: false };
  }
}

/**
 * GETTERS: Fetch data for the UI
 */
export async function getInterviewById(id: string) {
  try {
    return await db.interview.findUnique({
      where: { id },
    });
  } catch (error) {
    return null;
  }
}

export async function getFeedbackByInterviewId(params: { interviewId: string; userId: string }) {
  const { interviewId, userId } = params;
  try {
    return await db.feedback.findFirst({
      where: {
        interviewId: interviewId,
        userId: userId,
      },
    });
  } catch (error) {
    return null;
  }
}
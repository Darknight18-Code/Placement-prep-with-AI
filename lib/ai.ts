import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIAnalysis, Problem } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Schema definition for Gemini to enforce JSON structure
const analysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    approach: { type: SchemaType.STRING, enum: ["correct", "incorrect", "partial", "hint", "starter"] },
    feedback: { type: SchemaType.STRING },
    complexity: {
      type: SchemaType.OBJECT,
      properties: {
        time: { type: SchemaType.STRING },
        space: { type: SchemaType.STRING },
      },
    },
    edgeCases: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    hintLevel: { type: SchemaType.NUMBER },
  },
  required: ["approach", "feedback", "hintLevel"],
};

const SYSTEM_PROMPT = `You are an expert DSA mentor. Guide students WITHOUT providing complete solutions.
CRITICAL: 
- NEVER provide final code.
- If code is empty or just starter code, use approach: "hint" or "starter".
- If a user has a syntax error like using .size() instead of .length in JS, point it out as a language-specific hint.
- Return ONLY raw JSON. No markdown, no backticks.`;

export async function analyzeCode(
  code: string,
  problem: Problem,
  hintLevel: number = 1,
  language: string = "javascript"
): Promise<AIAnalysis> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use 1.5-flash for stable JSON mode
      generationConfig: {
        temperature: 0.4, // Lower temperature for more consistent JSON
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: analysisSchema, // Direct schema enforcement
      },
    });

    const userPrompt = `
      Problem: ${problem.title}
      Description: ${problem.description}
      Difficulty: ${problem.difficulty}
      User's Code (${language}): ${code || "// No code provided yet"}
      Current Hint Level: ${hintLevel}
    `;

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
    const content = result.response.text();

    if (!content) throw new Error("No response from AI");

    // Robust parsing
    let parsed;
    try {
      // Clean any accidental markdown wrappers just in case
      const cleanJson = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Manual parse failed, raw content:", content);
      throw parseError;
    }

    return {
      approach: parsed.approach || "hint",
      feedback: parsed.feedback || "Keep working on your logic!",
      complexity: parsed.complexity || { time: "N/A", space: "N/A" },
      edgeCases: parsed.edgeCases || [],
      suggestions: parsed.suggestions || [],
      hintLevel: parsed.hintLevel || hintLevel,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      approach: "hint",
      feedback: "I'm having trouble analyzing this code. Try checking your syntax or refreshing.",
      hintLevel: 1,
    };
  }
}

export async function generateHint(
  code: string,
  problem: Problem,
  hintLevel: number
): Promise<string> {
  // Keeping this simple for quick text-based hints
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `As a DSA tutor, give a 1-sentence hint for ${problem.title}. 
    User code: ${code}. Hint Level ${hintLevel}/4. NO CODE.`;
    
    const response = await model.generateContent(prompt);
    return response.response.text().trim() || "Think about the constraints.";
  } catch (error) {
    return "Consider the edge cases of the problem.";
  }
}
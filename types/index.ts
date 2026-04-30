export interface User {
  userId: string;
  email: string;
  name: string;
  skills: SkillProfile;
  streak: number;
  xp: number;
  badges: string[];
  createdAt: Date;
}

export interface SkillProfile {
  arrays: number;
  strings: number;
  recursion: number;
  dp: number;
  graphs: number;
  trees: number;
  greedy: number;
  bitManipulation: number;
  [key: string]: number;
}

export interface Problem {
  problemId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  constraints: string;
  examples: Example[];
  hints: string[];
  testCases: TestCase[];
  createdAt: Date;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  isHidden: boolean;
}

export interface Submission {
  submissionId: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: "partial" | "correct" | "incorrect";
  analysis?: AIAnalysis;
  hintsUsed: number;
  createdAt: Date;
}

// types/index.ts
export interface AIAnalysis {
  // Update this line to include the new states
  approach: "correct" | "incorrect" | "partial" | "hint" | "starter"; 
  feedback: string;
  complexity?: {
    time: string;
    space: string;
  };
  suggestions?: string[];
  edgeCases?: string[];
  hintLevel: number;
}

export interface Hint {
  level: number;
  message: string;
  type: "validation" | "mistake" | "optimization" | "nudge";
}

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//     userId?: string;
//   }
// }


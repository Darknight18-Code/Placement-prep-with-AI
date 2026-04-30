import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function calculateXP(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 10;
    case "medium":
      return 25;
    case "hard":
      return 50;
    default:
      return 0;
  }
}

export function updateSkillLevel(
  currentLevel: number,
  isCorrect: boolean,
  difficulty: "easy" | "medium" | "hard"
): number {
  const increment = isCorrect
    ? difficulty === "easy"
      ? 5
      : difficulty === "medium"
      ? 10
      : 15
    : -2;

  return Math.max(0, Math.min(100, currentLevel + increment));
}


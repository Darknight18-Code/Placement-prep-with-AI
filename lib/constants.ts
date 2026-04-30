export const SKILL_TOPICS = [
  "arrays",
  "strings",
  "recursion",
  "dp",
  "graphs",
  "trees",
  "greedy",
  "bitManipulation",
] as const;

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;

export const HINT_LEVELS = {
  VALIDATION: 1,
  MISTAKE: 2,
  OPTIMIZATION: 3,
  NUDGE: 4,
} as const;

export const BADGES = {
  FIRST_PROBLEM: "First Problem",
  WEEK_WARRIOR: "Week Warrior",
  MONTH_MASTER: "Month Master",
  ARRAY_MASTER: "Array Master",
  GRAPH_MASTER: "Graph Master",
  DP_MASTER: "DP Master",
  PERFECT_STREAK_7: "Perfect Week",
  PERFECT_STREAK_30: "Perfect Month",
} as const;


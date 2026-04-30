import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing data to avoid duplicates
  await prisma.testCase.deleteMany({});
  await prisma.problem.deleteMany({});

  // --- PROBLEM 1: TWO SUM ---
  await prisma.problem.create({
    data: {
      title: "Two Sum",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      difficulty: "easy",
      topic: "Array",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
      metadata: {
        fnName: "solve",
        params: [
          { name: "nums", type: "int[]" },
          { name: "target", type: "int" }
        ],
        returnType: "int[]"
      },
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
      ],
      testCases: {
        create: [
          { input: "2,7,11,15\n9", expectedOutput: "0,1", isSample: true },
          { input: "3,2,4\n6", expectedOutput: "1,2", isSample: true },
          { input: "3,3\n6", expectedOutput: "0,1", isSample: true }
        ]
      }
    }
  });

  // --- PROBLEM 2: VALID PARENTHESES ---
  await prisma.problem.create({
    data: {
      title: "Valid Parentheses",
      description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
      difficulty: "easy",
      topic: "Stack",
      constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
      metadata: {
        fnName: "isValid",
        params: [{ name: "s", type: "string" }],
        returnType: "boolean"
      },
      examples: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" }
      ],
      testCases: {
        create: [
          { input: "()", expectedOutput: "true", isSample: true },
          { input: "()[]{}", expectedOutput: "true", isSample: true },
          { input: "(]", expectedOutput: "false", isSample: true },
          { input: "([)]", expectedOutput: "false", isHidden: true },
          { input: "{[]}", expectedOutput: "true", isHidden: true }
        ]
      }
    }
  });

  // --- PROBLEM 3: CLIMBING STAIRS ---
  await prisma.problem.create({
    data: {
      title: "Climbing Stairs",
      description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      difficulty: "easy",
      topic: "Dynamic Programming",
      constraints: "1 <= n <= 45",
      metadata: {
        fnName: "climbStairs",
        params: [{ name: "n", type: "int" }],
        returnType: "int"
      },
      examples: [
        { input: "n = 2", output: "2", explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps" },
        { input: "n = 3", output: "3", explanation: "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step" }
      ],
      testCases: {
        create: [
          { input: "2", expectedOutput: "2", isSample: true },
          { input: "3", expectedOutput: "3", isSample: true },
          { input: "5", expectedOutput: "8", isHidden: true },
          { input: "10", expectedOutput: "89", isHidden: true }
        ]
      }
    }
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
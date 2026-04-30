import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/newdb";
import { generateWrappedCode } from "@/lib/generator";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code, language, problemId, runAll } = await request.json();

    const problem = await db.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    const testCasesToRun = runAll ? problem.testCases : problem.testCases.filter(tc => tc.isSample);
    const results: any[] = [];

    // --- HELPER: CONVERT ARRAYS / OBJECTS ---
    // FIXED: Removed the aggressive string-to-number check. 
    // Now it trusts JSON.parse to handle explicit strings vs numbers correctly.
    const deepConvert = (item: any): any => {
      if (Array.isArray(item)) return item.map(deepConvert);
      if (typeof item === 'object' && item !== null) {
        const obj: any = {};
        for (const key in item) obj[key] = deepConvert(item[key]);
        return obj;
      }
      return item; 
    };

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const wrappedCode = generateWrappedCode(code, language, problem.metadata);
      
      let actualOutput = "";
      let passed = false;
      let startTime = performance.now();

      try {
        let logs: string[] = [];
        const mockConsole = { 
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")) 
        };

        const rawInput = tc.input.trim();
        let inputArgs: any[] = [];

        // --- IMPROVED PARSER: SUDOKU vs TWO SUM ---
        const lines = rawInput.split(/\r?\n/).filter(l => l.trim() !== "");

        // Step 1: Try to see if the WHOLE input is one valid JSON (Sudoku Board)
        try {
          const cleanWhole = rawInput.includes('=') ? rawInput.split('=')[1].trim() : rawInput;
          const parsedWhole = JSON.parse(cleanWhole.replace(/'/g, '"'));
          
          // If it is a 2D array (Sudoku), we pass it as a single argument
          if (Array.isArray(parsedWhole) && Array.isArray(parsedWhole[0])) {
             inputArgs = [parsedWhole];
          } else {
             throw new Error("Not a board");
          }
        } catch (e) {
          // Step 2: Fallback to Line-by-Line (Two Sum / Median)
          inputArgs = lines.map(line => {
            const val = line.includes('=') ? line.split('=')[1].trim() : line;
            try {
              // Path A: JSON (like [2,7,11])
              return deepConvert(JSON.parse(val.replace(/'/g, '"')));
            } catch {
              // Path B: Fallback for comma-separated numbers without brackets (like 3,3)
              if (val.includes(',') && !val.includes('"')) {
                return val.split(',').map(item => isNaN(Number(item)) ? item.trim() : Number(item));
              }
              // Path C: Single Number or String
              return isNaN(Number(val)) ? val : Number(val);
            }
          });
        }

        const runner = new Function("inputArgs", "console", wrappedCode);
        const result = runner(inputArgs, mockConsole);
        
        if (result !== undefined && result !== null) {
          actualOutput = typeof result === 'string' ? result : JSON.stringify(result);
        } else {
          actualOutput = logs.length > 0 ? logs.join("\n") : "null";
        }
        
        const normalize = (val: any) => {
          if (val === null || val === undefined) return "";
          let str = val.toString().trim().replace(/[\[\]\s"']/g, "").replace(/,$/, "");
          const num = parseFloat(str);
          if (!isNaN(num) && !str.includes('.')) return num.toFixed(1);
          return str;
        };

        // --- MULTI-ANSWER DELIMITER LOGIC ---
        const normActual = normalize(actualOutput);
        
        // Split the expected output by '|||' to get an array of all valid answers.
        // If there is no '|||', this cleanly creates an array with just the single expected answer.
        const validExpectedAnswers = tc.expectedOutput.split('|||').map((ans: string) => normalize(ans));

        // Passed is true if their normalized output matches ANY of the acceptable answers
        passed = validExpectedAnswers.includes(normActual);
        // -----------------------------------

      } catch (err: any) {
        actualOutput = `Runtime Error: ${err.message}`;
      }

      results.push({
        testCaseIndex: i,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        executionTime: Math.floor(performance.now() - startTime),
      });
    }

    if (runAll) {
      await db.submission.create({
        data: {
          userId: clerkUserId,
          problemId,
          code,
          language,
          status: results.every(r => r.passed) ? "correct" : "wrong",
          passedCount: results.filter(r => r.passed).length,
          totalCount: results.length,
        },
      });
    }

    return NextResponse.json({
      success: results.every(r => r.passed),
      results,
      summary: { passed: results.filter(r => r.passed).length, total: results.length, allPassed: results.every(r => r.passed) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
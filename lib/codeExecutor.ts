import { TestCase } from "@/types";

interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime?: number;
}

// Map your internal language names to Piston's runtime keys
const PISTON_LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python3",
  java: "java",
  cpp: "cpp",
  c: "c",
  go: "go",
  rust: "rust",
};

/**
 * Wraps user code to bridge the gap between their function 
 * and standard input (stdin).
 */
function wrapCode(userCode: string, language: string): string {
  switch (language) {
    case "python":
      return `${userCode}\nimport sys\n# Reads stdin and calls solve\ntry:\n    print(solve(sys.stdin.read().strip()))\nexcept Exception as e:\n    print(e, file=sys.stderr)`;
    case "javascript":
    case "typescript":
      return `${userCode}\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    console.log(solve(input));\n} catch (e) {\n    console.error(e);\n}`;
    case "java":
      return `${userCode}\nimport java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    try {\n      Scanner sc = new Scanner(System.in);\n      if(sc.hasNextLine()) System.out.println(new Solution().solve(sc.nextLine()));\n    } catch (Exception e) { System.err.println(e); }\n  }\n}`;
    case "cpp":
      return `#include <iostream>\n#include <string>\nusing namespace std;\n${userCode}\nint main() {\n  string s;\n  if(getline(cin, s)) {\n    try { cout << solve(s); } catch (exception& e) { cerr << e.what(); }\n  }\n  return 0;\n}`;
    default:
      return userCode;
  }
}

export async function executeCode(
  code: string,
  language: string,
  testCase: TestCase
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const pistonLang = PISTON_LANG_MAP[language];

  if (!pistonLang) {
    return { success: false, output: null, error: `Language ${language} not supported` };
  }

  try {
    const wrappedCode = wrapCode(code, language);

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: "*", // Latest
        files: [{ content: wrappedCode }],
        stdin: typeof testCase.input === "string" ? testCase.input : JSON.stringify(testCase.input),
        run_timeout: 3000,
      }),
    });

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Check for compilation or runtime errors
    const error = data.run?.stderr || data.compile?.stderr || "";
    if (error) {
      return { success: false, output: null, error, executionTime };
    }

    const output = data.run.output.trim();

    return {
      success: true,
      output: output,
      executionTime,
    };
  } catch (err: any) {
    return {
      success: false,
      output: null,
      error: err.message || "Piston execution failed",
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Compares actual output with expected output.
 * Standardizes types since Piston returns everything as strings.
 */
export function compareOutput(output: any, expected: any): boolean {
  if (output === null || output === undefined) return expected === null || expected === undefined;

  // Since Piston returns string output, we try to parse it if expected is an object/array
  let parsedOutput = output;
  if (typeof expected === "object" && typeof output === "string") {
    try {
      parsedOutput = JSON.parse(output);
    } catch {
      // If it's not JSON, keep it as string
    }
  }

  // Deep comparison for arrays
  if (Array.isArray(parsedOutput) && Array.isArray(expected)) {
    if (parsedOutput.length !== expected.length) return false;
    
    // For Two Sum pattern (order agnostic indices)
    if (parsedOutput.length === 2 && typeof parsedOutput[0] === 'number') {
        const outSet = new Set(parsedOutput);
        const expSet = new Set(expected);
        return outSet.size === expSet.size && [...outSet].every(x => expSet.has(x));
    }

    return parsedOutput.every((val, idx) => compareOutput(val, expected[idx]));
  }

  // Primitive/String comparison (case insensitive and trimmed)
  return String(parsedOutput).trim() === String(expected).trim();
}
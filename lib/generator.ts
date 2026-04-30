type Param = { 
  name: string; 
  type: "int" | "string" | "int[]" | "string[]" | "boolean" | "double" | "vector<vector<int>>" | "vector<vector<char>>" | "TreeNode"
};

export function generateWrappedCode(userCode: string, language: string, metadata: any) {
  const { fnName } = metadata;

  // ================= JAVASCRIPT / TYPESCRIPT =================
  // ================= JAVASCRIPT / TYPESCRIPT =================
  if (language === "javascript" || language === "typescript") {
    return `
// --- USER CODE START ---
${userCode}
// --- USER CODE END ---

const runTest = (args) => {
    try {
        let result;

        // ✅ Handle Solution class (LeetCode style)
        if (typeof Solution !== 'undefined') {
            const sol = new Solution();
            if (typeof sol.${fnName} === 'function') {

                if (args.length === 1) {
                    result = sol.${fnName}(args[0]);
                } else {
                    result = sol.${fnName}(...args);
                }

                // FIX: If result is undefined (in-place modification), return the modified first argument!
                return JSON.stringify(result !== undefined ? result : args[0]);
            }
        }

        // ✅ Handle normal function
        if (typeof ${fnName} === 'function') {

            if (args.length === 1) {
                result = ${fnName}(args[0]);
            } else {
                result = ${fnName}(...args);
            }

            // FIX: If result is undefined (in-place modification), return the modified first argument!
            return JSON.stringify(result !== undefined ? result : args[0]);
        }

        throw new Error("Target function '${fnName}' not found. Ensure your function name matches metadata.");
    } catch (e) {
        throw new Error(e.message);
    }
};

// 'inputArgs' injected from route.ts
return runTest(inputArgs);
    `;
  }

  // ================= PYTHON =================
  if (language === "python" || language === "python3") {
    const { params } = metadata;

    const parsingLogic = params.map((p: Param, i: number) => {
      const baseLine = `lines[${i}].split('=')[-1].strip()`;

      if (p.type.includes("[]") || p.type.includes("vector") || p.type === "TreeNode") {
        return `${p.name} = eval(${baseLine}.replace('{','[').replace('}',']').replace('null','None'))`;
      }
      if (p.type === "int") return `${p.name} = int(${baseLine})`;
      if (p.type === "double") return `${p.name} = float(${baseLine})`;
      if (p.type === "boolean") return `${p.name} = ${baseLine}.lower() == "true"`;

      return `${p.name} = ${baseLine}.strip('"').strip("'")`;
    }).join("\\n        ");

    return `
import sys
import json
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

${userCode}

if __name__ == "__main__":
    try:
        data = sys.stdin.read()
        lines = [l.strip() for l in data.splitlines() if l.strip()]
        if not lines:
            sys.exit(0)

        ${parsingLogic}

        sol = Solution()
        result = sol.${fnName}(${params.map((p: Param) => p.name).join(", ")})

        if isinstance(result, float):
            print("{:.5f}".format(result))
        elif isinstance(result, bool):
            print(str(result).lower())
        else:
            print(json.dumps(result).replace(' ', ''))

    except Exception as e:
        print(f"Runtime Error: {e}", file=sys.stderr)
    `;
  }

  return userCode;
}
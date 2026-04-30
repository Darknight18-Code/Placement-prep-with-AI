"use client";

import { useEffect } from "react";

interface TestResult {
  testCaseIndex: number;
  input: any;
  expectedOutput: any;
  actualOutput: any;
  passed: boolean;
  error?: boolean; // Changed to boolean to match your API structure
  executionTime?: number;
  isHidden: boolean;
}

interface TestResultsModalProps {
  results: {
    success: boolean;
    results: TestResult[];
    summary: {
      passed: number;
      total: number;
      allPassed: boolean;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestResultsModal({ results, isOpen, onClose }: TestResultsModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !results) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "No Output";
    return typeof value === "string" ? value.trim() : JSON.stringify(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl bg-[#1e1e1e] border border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#252526]">
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${results.summary.allPassed ? "text-emerald-400" : "text-rose-400"}`}>
              {results.summary.allPassed ? "✓ Accepted" : "× Failed"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {results.summary.passed} of {results.summary.total} test cases passed
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {results.results.map((result, idx) => (
            <div key={idx} className={`rounded-xl overflow-hidden border ${result.passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-black/20">
                <span className={`text-sm font-bold ${result.passed ? "text-emerald-400" : "text-rose-400"}`}>
                  Case {idx + 1} {result.isHidden && "(Hidden)"}
                </span>
                {result.executionTime && <span className="text-[10px] uppercase tracking-widest text-gray-500">{result.executionTime}ms</span>}
              </div>

              <div className="p-4 space-y-4">
                {/* Input Section */}
                {!result.isHidden && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Input</label>
                    <pre className="bg-black/40 p-3 rounded-lg text-sm text-gray-300 font-mono whitespace-pre-wrap">{formatValue(result.input)}</pre>
                  </div>
                )}

                {/* Compare Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!result.isHidden && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Expected</label>
                      <pre className="bg-black/40 p-3 rounded-lg text-sm text-emerald-400 font-mono">{formatValue(result.expectedOutput)}</pre>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Actual Output</label>
                    <pre className={`p-3 rounded-lg text-sm font-mono ${result.passed ? "bg-black/40 text-gray-300" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"}`}>
                      {result.actualOutput === "" ? "NO OUTPUT" : formatValue(result.actualOutput)}
                    </pre>
                  </div>
                </div>

                {/* Error Console - THIS WILL SHOW COMPILATION ERRORS */}
                {result.error && (
                  <div className="mt-2">
                    <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Console Error / Stderr</label>
                    <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg">
                      <code className="text-xs text-rose-200 whitespace-pre-wrap font-mono leading-relaxed">
                        {result.actualOutput || "Unknown runtime error occurred."}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#252526] border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
          >
            Close Results
          </button>
        </div>
      </div>
    </div>
  );
}
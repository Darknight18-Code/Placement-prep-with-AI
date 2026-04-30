"use client";

import { useState, useEffect } from "react";

interface TestResultsDrawerProps {
  results: any | null;
  isRunning: boolean;
  onClose: () => void;
}

export default function TestResultsDrawer({ results, isRunning, onClose }: TestResultsDrawerProps) {
  const [selectedCase, setSelectedCase] = useState(0);

  useEffect(() => {
    if (results?.results) {
      const firstFailed = results.results.findIndex((r: any) => !r.passed);
      setSelectedCase(firstFailed !== -1 ? firstFailed : 0);
    }
  }, [results]);

  if (isRunning) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-3 bg-[#1e1e1e]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-emerald-500 font-mono tracking-wider animate-pulse uppercase font-bold">
          Evaluating Solution...
        </p>
      </div>
    );
  }

  if (!results || !results.results) {
    return (
      <div className="p-8 text-gray-500 font-mono text-xs">
        <p>Run your code to see sample test results, or Submit to check all cases.</p>
      </div>
    );
  }

  const isSubmission = results.type === "submission";
  const allPassed = results.summary?.allPassed ?? false;
  const currentResult = results.results[selectedCase];
  const currentPassed = currentResult?.passed;

  // --- SUCCESS VIEW (All Passed on Submission) ---
  if (isSubmission && allPassed) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-emerald-500 mb-2">Accepted</h2>
        <div className="flex gap-6 mt-4">
          <div className="text-left">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Runtime</p>
            <p className="text-xl text-white font-mono">{results.results[0]?.executionTime || 0} ms</p>
          </div>
          <div className="text-left border-l border-gray-800 pl-6">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
            <p className="text-xl text-emerald-500 font-mono font-bold">Passed</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className={`text-xl font-bold ${currentPassed ? "text-emerald-400" : "text-rose-500"}`}>
          {currentPassed 
            ? (isSubmission ? "Accepted" : "Finished") 
            : (currentResult?.error ? "Runtime Error" : "Wrong Answer")}
        </h3>
        <span className="text-xs text-gray-500 border-l border-gray-800 pl-3">
          {results.summary?.passed || 0} / {results.summary?.total || 0} test cases passed
        </span>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto custom-scrollbar">
        {results.results.map((r: any, i: number) => (
          <button
            key={i}
            onClick={() => setSelectedCase(i)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCase === i ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-400"
            }`}
          >
            <span className={`mr-2 ${r.passed ? "text-emerald-500" : "text-rose-500"}`}>●</span>
            Case {i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {currentResult ? (
          <>
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Input</p>
              <pre className="bg-black/30 p-3 rounded-lg text-sm text-gray-300 font-mono border border-white/5 whitespace-pre-wrap">{currentResult.input}</pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Output</p>
                <pre className={`p-3 rounded-lg text-sm font-mono border h-full ${currentPassed ? "bg-black/30 text-gray-300" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {currentResult.actualOutput || "null"}
                </pre>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Expected</p>
                <pre className="bg-black/30 p-3 rounded-lg text-sm text-emerald-400 font-mono border border-white/5 h-full">{currentResult.expectedOutput}</pre>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-xs italic">Hidden Test Case Details</p>
        )}
      </div>
    </div>
  );
}
"use client";

import { Problem } from "@/types";
import { Bookmark, ChevronDown, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

interface ProblemViewerProps {
  problem: Problem;
}

export default function ProblemViewer({ problem }: ProblemViewerProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "hard":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-white/5 text-gray-400 border border-white/10";
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!problem) return null;

  return (
    <div className="h-full p-6 md:p-8 font-sans bg-[#0B0F19] text-gray-300">
      <div className="max-w-3xl mx-auto space-y-10 pb-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {problem.title}
              </h1>
              
              {/* Tags & Difficulty */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest ${getDifficultyStyles(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                
                {problem.topic && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {problem.topic}
                  </span>
                )}
              </div>
            </div>
            
            {/* Bookmark Action */}
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95">
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        {/* --- DESCRIPTION SECTION --- */}
        <div className="space-y-4 border-t border-white/5 pt-8">
          <div className="flex items-center justify-between text-gray-500 cursor-default select-none">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Description</h3>
          </div>
          
          <div className="text-[15px] leading-loose whitespace-pre-wrap font-medium text-gray-300">
            {problem.description}
          </div>
        </div>

        {/* --- CONSTRAINTS SECTION --- */}
        {problem.constraints && (
          <div className="space-y-4 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between text-gray-500 cursor-default select-none">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Constraints</h3>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-xl p-5 shadow-inner">
              <ul className="space-y-2 text-[13px] font-mono text-indigo-300">
                {problem.constraints.split('\n').map((constraint: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                     <span className="text-gray-600 select-none">•</span>
                     <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/5 shadow-sm">
                       {constraint.trim()}
                     </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- EXAMPLES SECTION --- */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-6 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between text-gray-500 cursor-default select-none mb-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Examples</h3>
            </div>
            
            {problem.examples.map((example: any, idx: number) => (
              <div key={idx} className="group relative bg-[#111520] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10 shadow-lg">
                
                {/* Example Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Example {idx + 1}</span>
                   
                   {/* Copy Button */}
                   <button 
                     onClick={() => handleCopy(example.input, idx)}
                     className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all border border-gray-700 hover:border-gray-500 rounded-md px-2.5 py-1"
                   >
                     {copiedId === idx ? (
                       <><Check size={12} className="text-emerald-500" /> Copied</>
                     ) : (
                       <><Copy size={12} /> Copy Input</>
                     )}
                   </button>
                </div>
                
                {/* Example Body */}
                <div className="p-5 space-y-4 font-mono text-[13px]">
                  {/* Input Row */}
                  <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 items-start">
                    <span className="text-gray-600 text-xs mt-0.5 select-none">Input</span>
                    <div className="text-indigo-300 break-all bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 w-fit">
                      {example.input}
                    </div>
                  </div>
                  
                  {/* Output Row */}
                  <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 items-start">
                    <span className="text-gray-600 text-xs mt-0.5 select-none">Output</span>
                    <div className="text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 w-fit font-bold">
                      {example.output}
                    </div>
                  </div>
                  
                  {/* Explanation Row */}
                  {example.explanation && (
                    <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 items-start pt-4 border-t border-white/5 mt-4">
                      <span className="text-gray-600 text-xs mt-0.5 select-none">Explain</span>
                      <div className="text-gray-400 font-sans text-[14px] leading-relaxed">
                        {example.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- AI HINT CALLOUT NOTE --- */}
        <div className="mt-10 flex items-start sm:items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 shadow-lg">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 shadow-inner">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-amber-400/90 tracking-wide uppercase">Stuck on this problem?</h4>
            <p className="text-[14px] text-gray-400 mt-1 leading-snug">
              Click the <span className="text-amber-400 font-semibold px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">AI Hint</span> button in the editor toolbar. Our AI tutor will give you a gentle nudge without revealing the final solution!
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
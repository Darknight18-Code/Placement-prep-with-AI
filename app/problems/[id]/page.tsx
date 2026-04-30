"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import CodeEditor from "@/components/CodeEditor";
import ProblemViewer from "@/components/ProblemViewer";
import { AIAnalysis } from "@/types";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const problemId = params.id as string;

  // --- STATE MANAGEMENT ---
  const [problem, setProblem] = useState<any | null>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]); 
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript"); 
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [error, setError] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    if (problemId) {
      fetchProblem();
      fetchAllProblems(); 
    }
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const res = await fetch(`/api/problems/${problemId}`);
      const data = await res.json();
      if (res.ok) {
        setProblem(data.problem);
      } else {
        setError(data.error || "Failed to load problem");
      }
    } catch (error) {
      console.error("Error fetching problem:", error);
      setError("An unexpected error occurred.");
    }
  };

  const fetchAllProblems = async () => {
    try {
      const res = await fetch(`/api/problems`);
      const data = await res.json();
      if (res.ok) {
        setAllProblems(data.problems || data); 
      }
    } catch (error) {
      console.error("Error fetching problem list for navigation:", error);
    }
  };

  // --- NAVIGATION LOGIC ---
  const currentIndex = allProblems.findIndex(p => p.id === problemId || p._id === problemId || p.problemId === problemId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allProblems.length - 1;

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && hasPrev) {
      const prevProblem = allProblems[currentIndex - 1];
      router.push(`/problems/${prevProblem.id || prevProblem._id || prevProblem.problemId}`);
    } else if (direction === 'next' && hasNext) {
      const nextProblem = allProblems[currentIndex + 1];
      router.push(`/problems/${nextProblem.id || nextProblem._id || nextProblem.problemId}`);
    }
  };

  // --- ACTION HANDLERS ---
  const handleSubmissionSuccess = () => {
    console.log("Submission successful! Refreshing global state...");
    router.refresh(); 
  };

  const handleAnalyze = async (codeToAnalyze: string, codeLanguage: string) => {
    if (!problem) return;
    if (!isSignedIn) {
      setError("Please log in to get AI feedback on your code.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToAnalyze,
          language: codeLanguage,
          problemId: problem.problemId,
          hintLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please log in to get AI feedback.");
          router.push("/sign-in");
        } else {
          setError(data.error || "Failed to analyze code");
        }
        return;
      }

      setAnalysis(data.analysis);
      if (data.analysis.hintLevel > hintLevel) {
        setHintLevel(data.analysis.hintLevel);
      }
    } catch (error) {
      console.error("Error analyzing code:", error);
      setError("Failed to analyze code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOADING STATE ---
  if (!problem && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    // ADDED pt-20: This pushes the entire page down 80px so it perfectly clears your global Navbar!
    <div className="h-screen bg-[#0B0F19] text-gray-300 overflow-hidden flex flex-col font-sans pt-5">
      
      {/* --- TOP IDE NAVBAR --- */}
      {/* ADDED z-[60]: This mathematically forces the header above any invisible dangling elements */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#0B0F19] relative z-[60] shadow-md">
        
        {/* Left: Database Problem Info */}
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          {problem && (
            <div className="flex items-center gap-3 text-sm truncate">
              {/* Question Number */}
              {problem.questionNo && (
                <span className="text-gray-500 font-mono">#{problem.questionNo}</span>
              )}
              
              {/* Title */}
              <span className="font-bold text-gray-200 truncate max-w-[200px] xl:max-w-[400px]">{problem.title}</span>
              
              {/* Difficulty */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                problem.difficulty === 'easy' || problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                problem.difficulty === 'medium' || problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {problem.difficulty}
              </span>

              {/* Topics */}
              {problem.topic && (
                 <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                   {problem.topic}
                 </span>
              )}
            </div>
          )}
        </div>

        {/* Center/Right: Navigation & Controls */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Functional Prev / Next Pagination */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
             <button 
                onClick={() => handleNavigate('prev')}
                disabled={!hasPrev}
                className="relative z-[70] flex items-center gap-1 px-3 py-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
             >
                <ChevronLeft size={16}/> Prev
             </button>
             
             <span className="text-gray-500 font-mono text-xs px-2">
               {currentIndex !== -1 && allProblems.length > 0 ? `${currentIndex + 1}/${allProblems.length}` : '-/-'}
             </span>
             
             <button 
                onClick={() => handleNavigate('next')}
                disabled={!hasNext}
                className="relative z-[70] flex items-center gap-1 px-3 py-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
             >
                Next <ChevronRight size={16}/>
             </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden md:block mx-1" />

          {/* Problems List Button */}
          <Link href="/problems" className="relative z-[70] flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/5">
            <List size={14} /> Problems
          </Link>

        </div>
      </header>

      {/* --- ERROR / AUTH ALERTS --- */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center shrink-0 relative z-20">
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}
      {!isSignedIn && (
        <div className="bg-indigo-600/20 border-b border-indigo-500/30 p-2 text-center shrink-0 relative z-20">
          <p className="text-sm text-indigo-300">
             💡 <Link href="/sign-in" className="underline font-bold text-white hover:text-indigo-200">Sign in</Link> to save progress and get AI hints!
          </p>
        </div>
      )}

      {/* --- WORKSPACE SPLIT PANES --- */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Panel: Problem Viewer */}
        <div className="w-1/2 border-r border-white/10 overflow-y-auto bg-[#0B0F19] custom-scrollbar">
          <ProblemViewer problem={problem} />
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/2 flex flex-col bg-[#0D1117]">
          <CodeEditor
            initialCode={code}
            initialLanguage={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onAnalyze={handleAnalyze}
            onSuccess={handleSubmissionSuccess}
            analysis={analysis}
            isLoading={isLoading}
            problemId={problem?.problemId}
            metadata={problem?.metadata}
          />
        </div>
      </div>
    </div>
  );
}
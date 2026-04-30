"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, FileText, Sparkles, CheckCircle2, AlertTriangle, X, FileUp, Briefcase, Target } from "lucide-react";

// Import your existing PDF extraction action!
import { extractTextFromPDF } from "@/lib/actions/pdf.action";

export default function ResumeATSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a resume first.");
    if (!jobDescription.trim()) return alert("Please provide a job description.");

    setIsAnalyzing(true);
    setResults(null);

    try {
      // 1. Extract text using your existing server action
      const fileFormData = new FormData();
      fileFormData.append("file", file); // Must match what your action expects

      const extractResult = await extractTextFromPDF(fileFormData);
      
      if (!extractResult.success || !extractResult.text) {
        throw new Error("Failed to extract text from the uploaded PDF.");
      }

      const resumeText = extractResult.text;

      // 2. Send the purely extracted text & JD to your ATS API route as JSON
      const res = await fetch("/api/ats", { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: resumeText,
          jd: jobDescription
        }) 
      });

      // 3. Handle backend errors
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze resume.");
      }

      // 4. Set the real data returned from Gemini
      const data = await res.json();
      setResults(data);

    } catch (error: any) {
      console.error("Error analyzing resume:", error);
      alert(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // SVG Donut Math (Safely handles null results)
  const circumference = 2 * Math.PI * 40;
  const scoreOffset = results?.score ? circumference - (results.score / 100) * circumference : circumference;

  return (
    <div className="min-h-screen  text-gray-300 font-sans pt-15 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white tracking-tight">AI Resume Screener</h1>
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
                <Sparkles size={12} /> Gemini Powered
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
              Upload your PDF resume and paste the target job description. Our AI simulates an enterprise Applicant Tracking System (ATS) to score your match and suggest critical improvements.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: UPLOAD & INPUT (Spans 5) --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* File Uploader */}
            <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <FileUp size={16} className="text-indigo-400" /> Upload Resume
              </h2>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                  file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.02]'
                }`}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-xs font-bold text-gray-400 hover:text-red-400 flex items-center gap-1 mx-auto mt-2 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-500/20">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Click or drag & drop</p>
                      <p className="text-gray-500 text-xs mt-1">PDF format only (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-400" /> Target Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 bg-[#0D1117] border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all custom-scrollbar resize-none"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || !jobDescription.trim() || isAnalyzing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-indigo-600 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate ATS Report
                </>
              )}
            </button>

          </div>

          {/* --- RIGHT COLUMN: RESULTS DASHBOARD (Spans 7) --- */}
          <div className="lg:col-span-7">
            {!results && !isAnalyzing && (
              <div className="h-full min-h-[400px] border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-[#111520]/50">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-4">
                  <Target size={32} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Awaiting Document</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Upload your resume and paste a job description to see how well you match the role and discover missing keywords.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full min-h-[400px] border border-indigo-500/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-[#111520] relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Gemini is parsing...</h3>
                    <p className="text-indigo-400/80 text-sm mt-2 animate-pulse">Checking keyword density & formatting</p>
                  </div>
                </div>
              </div>
            )}

            {results && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Top Row: Score & Summary */}
                <div className="grid sm:grid-cols-[200px_1fr] gap-6">
                  {/* Score Donut */}
                  <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">ATS Match</p>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" 
                          stroke={(results.score || 0) >= 80 ? "#34d399" : (results.score || 0) >= 60 ? "#fbbf24" : "#ef4444"} 
                          strokeWidth="8" strokeLinecap="round" 
                          strokeDasharray={circumference} strokeDashoffset={scoreOffset} 
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-4xl font-black text-white">{results.score || 0}</span>
                        <span className="text-sm font-bold text-gray-500 block -mt-1">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-400" /> Executive Summary
                    </h3>
                    <p className="text-[14px] text-gray-300 leading-relaxed">
                      {results.summary || "No summary provided."}
                    </p>
                  </div>
                </div>

                {/* Keywords Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Missing Keywords */}
                  <div className="bg-[#111520] border border-red-500/10 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle size={14} /> Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.missingKeywords && results.missingKeywords.length > 0 ? (
                        results.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-md">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">None missing!</span>
                      )}
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="bg-[#111520] border border-emerald-500/10 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.matchedKeywords && results.matchedKeywords.length > 0 ? (
                        results.matchedKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No matched keywords found.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Target size={16} className="text-indigo-400" /> Actionable Fixes
                  </h3>
                  <div className="space-y-4">
                    {results.recommendations && results.recommendations.length > 0 ? (
                      results.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-[#161B22] p-4 rounded-2xl border border-white/5">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-gray-300 text-[13px] leading-relaxed">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Your resume is perfectly optimized!</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
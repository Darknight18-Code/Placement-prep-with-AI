"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, Plus, X, Sparkles, FileText, 
  Upload, CheckCircle2, Briefcase, Target, Zap 
} from "lucide-react";
import { extractTextFromPDF } from "@/lib/actions/pdf.action";
import { createInterview } from "@/app/actions/interview";

export default function AddNewInterview({ variant = "card" }: { variant?: "card" | "button" }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for Resume
  const [extractingResume, setExtractingResume] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // State for Job Description
  const [extractingJd, setExtractingJd] = useState(false);
  const [jobDescText, setJobDescText] = useState("");
  const jdInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  /**
   * Handles Resume PDF selection
   */
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingResume(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await extractTextFromPDF(formData);
      if (result.success) {
        setResumeText(result.text); 
      } else {
        alert("Failed to extract text from Resume PDF. Please try pasting manually.");
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      alert("An error occurred during file processing.");
    } finally {
      setExtractingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  /**
   * Handles JD PDF selection
   */
  const handleJdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingJd(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await extractTextFromPDF(formData);
      if (result.success) {
        setJobDescText(result.text); 
      } else {
        alert("Failed to extract text from JD PDF. Please try pasting manually.");
      }
    } catch (error) {
      console.error("JD Upload Error:", error);
      alert("An error occurred during file processing.");
    } finally {
      setExtractingJd(false);
      if (jdInputRef.current) jdInputRef.current.value = "";
    }
  };

  /**
   * Submits the form data to the server action
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createInterview({
        jobRole: formData.get("jobRole") as string,
        jobDesc: jobDescText, // Pulled directly from state now
        yearsOfExp: parseInt(formData.get("yearsOfExp") as string),
        type: formData.get("type") as string,
        resumeText: resumeText,
        questionCount: parseInt(formData.get("questionCount") as string),
      });

      if (result.success) {
        setOpenDialog(false);
        router.push(`/interview/${result.id}`); 
      } else {
        alert(result.error || "Failed to initialize AI.");
      }
    } catch (error) {
      console.error("Creation Error:", error);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "button" ? (
        <button 
          onClick={() => setOpenDialog(true)}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
          Start an Interview
        </button>
      ) : null}

      {openDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 p-8 md:p-10 rounded-[3rem] w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-300 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
            
            <button 
              onClick={() => setOpenDialog(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                <Sparkles className="text-indigo-500" /> New Mock Interview
              </h2>
              <p className="text-gray-400 mt-2 text-lg">Provide details to help Gemini generate custom questions for your session.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Metadata */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Briefcase size={14} className="text-indigo-400" /> Targeted Role
                    </label>
                    <input name="jobRole" required placeholder="e.g. Full Stack Developer" 
                      className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Experience (Years)</label>
                      <input name="yearsOfExp" type="number" required placeholder="Years" min="0" 
                        className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Question Count</label>
                      <input name="questionCount" type="number" required defaultValue={5} min="1" max="10" 
                        className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target size={14} className="text-indigo-400" /> Interview Type
                    </label>
                    <select name="type" required 
                      className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none">
                      <option value="Technical">Technical</option>
                      <option value="Mixed">Mixed (Default)</option>
                      <option value="Behavioural">Behavioural</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Resume & JD Extraction */}
                <div className="space-y-6">
                  
                  {/* RESUME INPUT */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" /> Resume Context
                      </label>
                      <button 
                        type="button" 
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={extractingResume}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {extractingResume ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />} 
                        {extractingResume ? "Extracting..." : "Upload PDF"}
                      </button>
                    </div>
                    
                    <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf" className="hidden" />
                    
                    <textarea 
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      required 
                      placeholder="Upload your PDF resume or paste text manually to personalize questions..." 
                      className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white h-[140px] outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar transition-all placeholder:text-gray-700" 
                    />
                    {resumeText && !extractingResume && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold px-1 uppercase tracking-wider animate-in slide-in-from-left-2">
                        <CheckCircle2 size={12} /> Data loaded successfully
                      </div>
                    )}
                  </div>

                  {/* JOB DESCRIPTION INPUT */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-indigo-400" /> Job Description
                      </label>
                      <button 
                        type="button" 
                        onClick={() => jdInputRef.current?.click()}
                        disabled={extractingJd}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {extractingJd ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />} 
                        {extractingJd ? "Extracting..." : "Upload PDF"}
                      </button>
                    </div>

                    <input type="file" ref={jdInputRef} onChange={handleJdUpload} accept=".pdf" className="hidden" />

                    <textarea 
                      value={jobDescText}
                      onChange={(e) => setJobDescText(e.target.value)}
                      required 
                      placeholder="Upload JD PDF or paste the required skills to focus the AI..." 
                      className="w-full bg-[#030712] border border-gray-800 rounded-2xl p-5 text-white h-[140px] outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar transition-all placeholder:text-gray-700" 
                    />
                    {jobDescText && !extractingJd && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold px-1 uppercase tracking-wider animate-in slide-in-from-left-2">
                        <CheckCircle2 size={12} /> Data loaded successfully
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row justify-end gap-6 pt-8 border-t border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setOpenDialog(false)} 
                  className="text-gray-400 font-black text-lg hover:text-white transition-colors py-4 px-6"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || extractingResume || extractingJd}
                  className="bg-indigo-600 px-12 py-5 rounded-3xl text-white font-black text-lg hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>Generating Questions <Loader2 className="animate-spin" /></>
                  ) : (
                    <>Initialize AI <Sparkles size={20} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
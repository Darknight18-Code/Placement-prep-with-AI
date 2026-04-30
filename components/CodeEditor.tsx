"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { AIAnalysis } from "@/types";
import TestResultsDrawer from "./TestResultDrawer";
import AIFeedbackModal from "./AIFeedbackModal";
import { Play, Send, ChevronRight, Sparkles } from "lucide-react";

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  onAnalyze?: (code: string, language: string) => Promise<void>;
  onSuccess?: () => void;
  analysis?: AIAnalysis | null;
  isLoading?: boolean; 
  problemId?: string;
  metadata?: any;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
];

const generateStarterCode = (language: string, metadata: any) => {
  if (!metadata) return "// Loading starter code...";
  const { fnName, params, returnType } = metadata;

  // Defaults strictly to JavaScript formatting
  const jsParams = params.map((p: any) => p.name).join(", ");
  return `/**\n * @param {${params.map((p: any) => p.type).join(", ")}}\n * @return {${returnType}}\n */\nvar ${fnName} = function(${jsParams}) {\n    // Write your solution here\n\n};`;
};

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  onSuccess,
  analysis,
  isLoading = false,
  problemId,
  metadata,
}: CodeEditorProps) {
  // --- STATE ---
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript"); // Forced to javascript
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (metadata) {
      const starter = generateStarterCode(language, metadata);
      if (!code || code.trim() === "" || code.includes("Loading starter code")) {
        setCode(starter);
      }
    }
  }, [metadata, language]);

  useEffect(() => {
    if (analysis) {
      setShowAIModal(true);
      setIsDrawerExpanded(false); 
    }
  }, [analysis]);

  // --- HANDLERS ---
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
    if (metadata) {
      const nextStarter = generateStarterCode(newLanguage, metadata);
      setCode(nextStarter);
      onCodeChange?.(nextStarter);
    }
  };

  const executeCode = async (isSubmission: boolean) => {
    if (!problemId) return;
    isSubmission ? setIsSubmitting(true) : setIsRunning(true);

    setTestResults(null);
    setIsDrawerExpanded(true); 

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId,
          runAll: isSubmission
        }),
      });

      const data = await res.json();
      setTestResults({ ...data, type: isSubmission ? "submission" : "run" });

      if (isSubmission && data.summary?.allPassed) {
        onSuccess?.();
      }

    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      isSubmission ? setIsSubmitting(false) : setIsRunning(false);
    }
  };

  // 🎨 --- CUSTOM PREMIUM EDITOR THEME ---
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('premium-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '546E7A', fontStyle: 'italic' }, // Teal comments
        { token: 'keyword', foreground: 'C792EA' }, // Purple keywords (var, function, return)
        { token: 'string', foreground: 'C3E88D' }, // Green strings
        { token: 'number', foreground: 'F78C6C' }, // Orange numbers
        { token: 'identifier', foreground: 'A6ACCD' }, // Soft white/gray for variables
        { token: 'type', foreground: 'FFCB6B' }, // Yellow types
        { token: 'function', foreground: '82AAFF' }, // Blue function names
      ],
      colors: {
        'editor.background': '#0D1117', // Perfectly matches your right-panel background
        'editor.foreground': '#A6ACCD',
        'editor.lineHighlightBackground': '#1A1E24',
        'editorLineNumber.foreground': '#4B5263',
        'editorIndentGuide.background': '#21262d',
        'editorSuggestWidget.background': '#161b22',
        'editorSuggestWidget.border': '#30363d',
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] overflow-hidden relative">

      {/* --- EDITOR HEADER (Tabs & Top Action Buttons) --- */}
      <div className="flex items-center justify-between bg-[#0B0E14] border-b border-white/5 h-14 shrink-0 pr-4">
        
        {/* Left: Language Dropdown & File Tab */}
        <div className="flex items-center h-full">
          {/* Language Selection (Restricted to JS) */}
          <div className="h-full flex items-center border-r border-white/5 px-2 relative group">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="pl-4 pr-10 py-1 bg-transparent text-gray-400 text-xs font-semibold focus:outline-none appearance-none cursor-pointer hover:text-white transition-colors z-10" 
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-[#0D1117] text-gray-300">
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
               <ChevronDownIcon />
            </div>
          </div>

          {/* Active File Tab */}
          <div className="h-full flex items-center gap-2 px-5 bg-[#0D1117] border-t-2 border-yellow-400 text-[13px] text-gray-300 font-mono shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
            <div className="w-2.5 h-2.5 rounded-sm bg-yellow-400"></div>
            solution.js
          </div>
        </div>

        {/* Right: Premium Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* AI Hint Button */}
          <button
            onClick={() => onAnalyze?.(code, language)}
            disabled={isLoading || !code}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            AI Hint
          </button>

          {/* Run Button */}
          <button
            onClick={() => executeCode(false)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-5 py-1.5 bg-[#161B22] hover:bg-[#1F242D] text-gray-300 rounded-lg text-xs font-bold border border-white/10 transition-all disabled:opacity-50"
          >
            <Play size={12} className="text-emerald-500" fill="currentColor" /> 
            {isRunning ? "Running..." : "Run"}
          </button>

          {/* Submit Button */}
          <button
            onClick={() => executeCode(true)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-6 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
          >
            <Send size={12} /> 
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>

      </div>

      {/* --- EDITOR CONTENT --- */}
      <div className="flex-1 min-h-0 pt-4">
        <Editor
          height="100%"
          language="javascript"
          value={code}
          beforeMount={handleEditorWillMount} // <-- INJECTS CUSTOM THEME HERE
          theme="premium-dark"                // <-- APPLIES CUSTOM THEME HERE
          onChange={(val) => { setCode(val || ""); onCodeChange?.(val || ""); }}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            lineHeight: 24,
            padding: { top: 8, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* --- BOTTOM CONSOLE DRAWER --- */}
      <div className={`transition-all duration-300 ease-in-out flex flex-col bg-[#0B0E14] border-t border-white/5 z-20 ${isDrawerExpanded ? 'h-[380px]' : 'h-10'}`}>
        
        {/* Sleek Console Toggle Bar */}
        <div 
          className="flex items-center justify-between px-4 h-10 shrink-0 cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
        >
          <div className="flex items-center gap-2 text-gray-400 group">
            <ChevronRight size={14} className={`transition-transform duration-300 ${isDrawerExpanded ? '-rotate-90 text-white' : 'group-hover:translate-x-0.5'}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] mt-0.5 group-hover:text-white transition-colors">Console</span>
            
            {/* Processing Indicator */}
            {(isRunning || isSubmitting) && (
              <div className="ml-3 flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wide">Processing</span>
              </div>
            )}
          </div>
          
          {/* Subtle Shortcut Hint */}
          <div className="text-[10px] text-gray-600 font-mono font-bold hidden md:block">
            Ctrl + Enter to Run
          </div>
        </div>

        {/* Drawer Content */}
        <div className={`flex-1 overflow-hidden transition-opacity duration-300 bg-[#0D1117] ${isDrawerExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <TestResultsDrawer
            results={testResults}
            isRunning={isRunning || isSubmitting}
            onClose={() => setIsDrawerExpanded(false)}
          />
        </div>
      </div>

      {/* AI Modal */}
      <AIFeedbackModal
        analysis={analysis}
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
}

// Minimal internal icon component for the language select dropdown
function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
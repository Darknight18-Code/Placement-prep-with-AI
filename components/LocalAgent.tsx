"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, Bot, User, Play, Loader2, AlertTriangle, XCircle,
  BrainCircuit, Zap, FileText, CheckCircle2, ShieldCheck // Added new UI icons
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { createFeedback } from "@/app/actions/interview"; 
import { cn } from "@/lib/utils";

export default function LocalAgent({ questions, interviewId, candidateName, jobRole }: any) {
  const router = useRouter();
  const vapiRef = useRef<any>(null);
  
  const [activeCall, setActiveCall] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const conversationTranscript = useRef<any[]>([]);

  // ==========================================
  // ⚠️ LOGIC UNTOUCHED - EXACTLY AS PROVIDED
  // ==========================================
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) {
      setError("Vapi Public Key missing.");
      return;
    }

    const vapi = new Vapi(key);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setActiveCall(true);
      setIsConnecting(false);
      setError(null);
      setSubtitles(""); // Clear previous state
    });

    vapi.on("call-end", () => {
      setActiveCall(false);
      handleFeedbackSubmission();
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("message", (message: any) => {
      // 1. Handle Real-time Transcripts (Both User and AI)
      if (message.type === "transcript") {
        setSubtitles(message.transcript);
      }

      // 2. Handle Assistant Messages (Backup for AI speech)
      if (message?.role === "assistant" && message?.content) {
        setSubtitles(message.content);
      }

      // 3. Update Conversation History for feedback
      if (message?.conversation) {
        conversationTranscript.current = message.conversation.filter(
          (msg: any) => msg.role !== "system"
        );
      }
    });

    vapi.on("error", (err) => {
      console.error("Vapi Error:", err);
      setIsConnecting(false);
      setActiveCall(false);
      setError("Connection lost. Please try again.");
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, []);

  const startVapiCall = async () => {
    if (!vapiRef.current) return;
    setIsConnecting(true);
    setError(null);

    const questionList = Array.isArray(questions) ? questions.join(". ") : "General technical questions";

    const assistantOptions: any = {
      name: "Gemini-Interviewer",
      firstMessage: `Hi ${candidateName || "Ravindra"}, I'm your AI interviewer. Ready for the ${jobRole} interview?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "vapi",
        voiceId: "Elliot", 
      },
      model: {
        provider: "google",
        model: "gemini-2.5-flash-lite", 
        messages: [
          {
            role: "system",
            content: `You are an AI Technical Interviewer. Ask these questions one by one: ${questionList}. Ask one question, wait for answer, then move to the next. Also ask relevant technical follow-up questions based on the user's responses to test their depth of knowledge.`,
          },
        ],
      },
    };

    try {
      await vapiRef.current.start(assistantOptions);
    } catch (err: any) {
      console.error("Vapi start failed:", err);
      setError("Start failed. Ensure your Google AI Studio key is linked in the Vapi dashboard.");
      setIsConnecting(false);
    }
  };

  const handleFeedbackSubmission = async () => {
    if (conversationTranscript.current.length < 2) return;
    setIsGeneratingFeedback(true);
    try {
      const formattedTranscript = conversationTranscript.current.map((msg: any) => ({
        question: msg.role === "assistant" ? msg.content : "AI Context",
        answer: msg.role === "user" ? msg.content : "User Response"
      }));

      const res = await createFeedback(interviewId, formattedTranscript);
      if (res.success) {
        router.push(`/interview/${interviewId}/feedback`);
      }
    } catch (error) {
      console.error("Feedback Save Error:", error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // ==========================================
  // 🎨 NEW UI RENDER (Logic perfectly intact)
  // ==========================================
  return (
    <div className="w-full max-w-4xl mx-auto p-6 relative">
      
      {/* Background glow effects matching the image */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 flex items-center gap-3 text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!activeCall ? (
        <div className="flex flex-col items-center animate-in fade-in duration-700">
          
          {/* Top Robot Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 border border-white/10">
            <Bot size={40} className="text-white" />
          </div>

          {/* Header Text */}
          <div className="text-center space-y-3 mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              AI Interview Lab
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium">
              Experience a real-world interview with advanced AI evaluation
            </p>
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold">
              Get instant feedback and actionable insights
            </p>
          </div>

          {/* 3-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10 text-left">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <BrainCircuit className="text-blue-400" size={20} />
              </div>
              <h4 className="font-bold text-sm mb-1.5 text-white/90">AI Evaluation</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Intelligent analysis of your responses</p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Zap className="text-purple-400" size={20} />
              </div>
              <h4 className="font-bold text-sm mb-1.5 text-white/90">Real-time Feedback</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Instant insights as you respond</p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <FileText className="text-indigo-400" size={20} />
              </div>
              <h4 className="font-bold text-sm mb-1.5 text-white/90">Detailed Report</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Comprehensive performance summary</p>
            </div>
          </div>

          {/* Checklist & Start Container */}
          <div className="w-full max-w-2xl bg-[#0f172a]/50 border border-gray-800/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-md">
            
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-purple-400" size={22} />
              <h3 className="text-lg font-bold text-gray-200">Pre-Interview Checklist</h3>
            </div>

            <div className="space-y-3 mb-8">
              {/* Checklist Items */}
              <div className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-sm font-bold text-gray-200">Microphone Connected</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ensure audio input is working</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-sm font-bold text-gray-200">Quiet Environment</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">Minimize background noise for better transcription</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-sm font-bold text-gray-200">Stable Connection</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">Test your internet connectivity</p>
                </div>
              </div>
            </div>

            {/* Pro Tip gradient box */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-8 text-xs text-purple-200/70 leading-relaxed">
              <span className="text-purple-400 font-bold uppercase mr-2 text-[10px] tracking-wider">Pro tip:</span>
              Take a moment to find a comfortable position and ensure you won't be interrupted. This interview will take approximately 15-20 minutes.
            </div>

            {/* Gradient Start Button calling your existing startVapiCall */}
            <button 
              onClick={startVapiCall}
              disabled={isConnecting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-70"
            >
              <div className="flex items-center justify-center gap-3 text-white uppercase tracking-widest text-sm">
                {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                {isConnecting ? "ESTABLISHING CONNECTION..." : "START INTERVIEW"}
                {!isConnecting && <Zap size={16} className="text-white/70" />}
              </div>
            </button>
          </div>

        </div>
      ) : (
        /* --- ACTIVE SESSION UI --- */
        <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
          <div className="flex justify-between items-center bg-[#0f172a]/80 p-4 rounded-2xl border border-gray-800 backdrop-blur-md">
             <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                Live: Voice Session Active
             </div>
             <button onClick={() => vapiRef.current.stop()} className="text-rose-500 font-black text-xs flex items-center gap-2 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-rose-500/30">
               <XCircle size={16} /> END SESSION
             </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className={cn("p-10 border rounded-[3rem] flex flex-col items-center transition-all duration-500 backdrop-blur-sm", isSpeaking ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]" : "border-gray-800 bg-[#0f172a]/50")}>
                <Bot size={48} className={cn("mb-4 transition-all duration-500", isSpeaking ? "text-indigo-400 scale-110" : "text-gray-600")} />
                <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Gemini AI</p>
             </div>
             <div className={cn("p-10 border rounded-[3rem] flex flex-col items-center transition-all duration-500 backdrop-blur-sm", !isSpeaking ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "border-gray-800 bg-[#0f172a]/50")}>
                <User size={48} className={cn("mb-4 transition-all duration-500", !isSpeaking ? "text-emerald-400 scale-110" : "text-gray-600")} />
                <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">{candidateName}</p>
             </div>
          </div>

          <div className="bg-[#0f172a]/80 border border-gray-800 rounded-[3rem] p-10 text-center min-h-[200px] flex items-center justify-center text-xl md:text-2xl font-medium text-gray-200 shadow-inner backdrop-blur-md">
            <span className="italic leading-relaxed">
              {subtitles ? subtitles : isSpeaking ? "AI is generating response..." : "I'm listening, please speak..."}
            </span>
          </div>
        </div>
      )}

      {/* Saving / Processing State Overlay */}
      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
          <Loader2 className="animate-spin text-purple-500 mb-6" size={60} />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">ANALYZING PERFORMANCE...</h2>
          <p className="text-gray-500 mt-3 tracking-[0.3em] uppercase text-[10px]">Generating detailed report</p>
        </div>
      )}
    </div>
  );
}
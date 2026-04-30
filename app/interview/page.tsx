import { db } from "@/lib/newdb";
import { auth } from "@clerk/nextjs/server";
import {
  Sparkles, Calendar, Briefcase, ChevronRight,
  Activity, History, Zap, Plus
} from "lucide-react";
import Link from "next/link";
import AddNewInterview from "@/components/AddNewInterview";

export default async function InterviewDashboard({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const { userId } = auth();
  if (!userId) return null;

  const currentFilter = searchParams.filter || "All";

  // 1. Fetch data directly using Prisma
  const allInterviews = await db.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { feedback: true }
  });

  // 2. Filter logic on the server side
  const filteredInterviews = allInterviews.filter((interview) => {
    if (currentFilter === "Completed") return !!interview.feedback;
    if (currentFilter === "Not Started") return !interview.feedback;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* --- HERO SECTION --- */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-center mb-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest">
              <Sparkles size={14} /> AI Interview Coach
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Get Interview-Ready <br />
              with <span className="text-indigo-500">AI-Powered <br /> Practice</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Create personalized mock interviews based on your role, resume, and job description.
            </p>
            <div className="flex items-center gap-4">
              <AddNewInterview variant="button" />
            </div>
          </div>

          {/* FLOATING UI MOCKUP */}
          {/* FLOATING UI MOCKUP - MATCHES IMAGE */}
          <div className="hidden lg:flex flex-1 justify-end">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-2xl space-y-6">

              {/* Voice Interview Active Card */}
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-3xl p-6 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Activity size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-purple-300/70 font-bold uppercase tracking-widest mb-1.5">Voice Interview Active</p>
                  <div className="flex items-end gap-1 h-6">
                    <div className="w-1.5 bg-purple-400 rounded-full animate-[pulse_1s_infinite_0s]" style={{ height: '60%' }}></div>
                    <div className="w-1.5 bg-purple-400 rounded-full animate-[pulse_1s_infinite_0.2s]" style={{ height: '100%' }}></div>
                    <div className="w-1.5 bg-purple-400 rounded-full animate-[pulse_1s_infinite_0.4s]" style={{ height: '40%' }}></div>
                    <div className="w-1.5 bg-purple-400 rounded-full animate-[pulse_1s_infinite_0.1s]" style={{ height: '80%' }}></div>
                    <div className="w-1.5 bg-purple-400 rounded-full animate-[pulse_1s_infinite_0.3s]" style={{ height: '50%' }}></div>
                  </div>
                </div>
              </div>

              {/* AI Question Card */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-3xl p-6 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-blue-300/70 font-bold uppercase tracking-widest mb-2">AI Question</p>
                  <p className="text-sm text-blue-100/80 leading-relaxed font-medium">
                    "Tell me about your experience with React hooks and state management..."
                  </p>
                </div>
              </div>

              {/* Live Feedback Card */}
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-emerald-300/70 font-bold uppercase tracking-widest mb-1">Live Feedback</p>
                  <p className="text-xs text-emerald-100/60">Analyzing your response...</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: SESSIONS LIST (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Your Interview Sessions</h2>
                <p className="text-xs text-gray-500 font-medium">{filteredInterviews.length} sessions found</p>
              </div>

              {/* FILTER TABS */}
              <div className="flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-gray-800">
                {["All", "Completed", "Not Started"].map((tab) => (
                  <Link
                    key={tab}
                    href={`?filter=${tab}`}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${currentFilter === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    {tab}
                  </Link>
                ))}
                <div className="w-px h-4 bg-gray-800 mx-1" />
                <Link href="/interview" className="p-2 text-gray-500 hover:text-white"><History size={16} /></Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}

              {filteredInterviews.length === 0 && (
                <div className="col-span-full py-20 border-2 border-dashed border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-gray-700">
                    <Plus size={32} />
                  </div>
                  <p className="text-gray-500 text-sm">No {currentFilter.toLowerCase()} sessions found.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DAILY CHALLENGE (4 Columns) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <DailyChallenge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---

function InterviewCard({ interview }: { interview: any }) {
  const isCompleted = !!interview.feedback;
  return (
    <div className="bg-[#0D0D0D] border border-gray-800 rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-gray-600'}`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {isCompleted ? "Completed" : "Not Started"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-6 flex-grow">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 shrink-0">
          <Briefcase className="text-indigo-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{interview.jobRole}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[9px] bg-gray-900 px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-800 uppercase italic">
              {interview.interviewType || 'Technical'}
            </span>
            <span className="text-[9px] bg-gray-900 px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-800 uppercase italic">Hard</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800/50">
        <div className="text-[10px] text-gray-600 font-mono">
          <p className="flex items-center gap-1"><Calendar size={12} /> {new Date(interview.createdAt).toLocaleDateString()}</p>
        </div>
        <Link
          href={isCompleted ? `/interview/${interview.id}/feedback` : `/interview/${interview.id}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          {isCompleted ? <History size={18} /> : <ChevronRight size={18} />}
        </Link>
      </div>
    </div>
  );
}

function DailyChallenge() {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-[#0D0D0D] border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
      <div className="bg-orange-500/20 text-orange-400 text-[8px] font-bold px-2 py-0.5 rounded-full inline-block border border-orange-500/20 uppercase mb-4 tracking-widest">
        AI Recommended
      </div>
      <h4 className="text-xl font-bold text-white mb-2 leading-tight">Daily Interview <br /> Challenge</h4>
      <p className="text-xs text-gray-500 mb-8 leading-relaxed">
        Full Stack Developer - System Design & Scalability Focus. New challenges every 24 hours.
      </p>
      <button
        disabled
        className="w-full py-3 bg-gray-800/50 text-gray-500 text-xs font-bold rounded-xl border border-gray-700 cursor-not-allowed hover:bg-gray-800 transition-all"
      >
        Coming Soon
      </button>
    </div>
  );
}
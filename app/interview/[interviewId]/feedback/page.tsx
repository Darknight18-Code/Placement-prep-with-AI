import { db } from "@/lib/newdb";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, BarChart2, Radar, TrendingUp, AlertTriangle, PlaySquare, Target, MessageSquare, ChevronRight, Sparkles } from "lucide-react";

export default async function FeedbackPage({ 
  params 
}: { 
  params: { interviewId: string } 
}) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  // Include any relation counts if needed (like how many questions were asked)
  const interview = await db.interview.findFirst({
    where: {
      id: params.interviewId,
      userId: userId,
    },
    include: {
      feedback: true,
      // _count: { select: { questions: true } } 
    }
  });

  if (!interview) return notFound();

  // If the interview exists but feedback isn't generated yet
  if (!interview.feedback) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold">Analysis in Progress</h1>
          <p className="text-gray-400">
            We are still processing your interview data with AI. 
            If you just finished, please wait a few seconds and refresh.
          </p>
          <Link
            href={`/interview/${params.interviewId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-2xl font-bold transition-all"
          >
            <ArrowLeft size={20} /> Back to Interview
          </Link>
        </div>
      </div>
    );
  }

  const { feedback } = interview;

  const categories = [
    { name: "Technical Knowledge", score: feedback.technicalScore || 0 },
    { name: "Problem Solving", score: feedback.problemSolvingScore || 0 },
    { name: "Communication", score: feedback.communicationScore || 0 },
    { name: "Confidence & Clarity", score: feedback.confidenceScore || 0 },
    { name: "Cultural & Role Fit", score: feedback.fitScore || 0 },
  ];

  // Helper to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500";
    if (score >= 60) return "text-amber-400 bg-amber-500";
    return "text-red-400 bg-red-500";
  };

  const getBadgeText = (score: number) => {
    if (score >= 80) return { text: "EXCELLENT", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 60) return { text: "GOOD", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { text: "NEEDS IMPROVEMENT", color: "text-red-400 border-red-500/30 bg-red-500/10" };
  };

  const badge = getBadgeText(feedback.totalScore);
  const totalScoreCircumference = 2 * Math.PI * 40; // Donut chart radius 40
  const totalScoreOffset = totalScoreCircumference - (feedback.totalScore / 100) * totalScoreCircumference;

  // Dynamic variables mapping to backend
  const interviewDuration = (interview as any).duration ? `${(interview as any).duration} min` : "N/A";
  const questionsAskedCount = (interview as any).questionCount || "N/A";
  const recommendedSteps: string[] = (feedback as any).nextSteps || [];

  // Render pure SVG Radar Chart
  const renderRadarChart = () => {
    const center = 150;
    const maxRadius = 100;
    const angleStep = (Math.PI * 2) / categories.length;
    
    const points = categories.map((cat, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start top center
      const radius = (cat.score / 100) * maxRadius;
      return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
    }).join(" ");

    return (
      <svg viewBox="0 0 300 300" className="w-full h-[250px] max-w-[300px] mx-auto overflow-visible">
        {/* Background Web */}
        {[20, 40, 60, 80, 100].map((r) => (
          <polygon
            key={r}
            points={categories.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(" ")}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {categories.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={center + maxRadius * Math.cos(angle)} y2={center + maxRadius * Math.sin(angle)}
              stroke="#1e293b" strokeWidth="1"
            />
          );
        })}
        {/* Labels */}
        {categories.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" dominantBaseline="middle">
              {cat.name.replace(" & ", "\n")}
            </text>
          );
        })}
        {/* Data Polygon */}
        <polygon points={points} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" />
        {/* Data Points */}
        {categories.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = (cat.score / 100) * maxRadius;
          return (
            <circle key={i} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="4" fill="#6366f1" />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pt-8">
          <div className="space-y-4">
            
            {/* Top Left: Go to Dashboard */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Go to Dashboard
            </Link>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white tracking-tight">Interview Report</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
                  <Sparkles size={12} /> AI Generated
                </span>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-xs">
                {interview.jobRole} • {interview.interviewType}
              </p>
            </div>

            {/* DYNAMIC METADATA FROM DB */}
            <div className="flex items-center gap-8 pt-2">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-white">{new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Duration</p>
                <p className="text-sm font-medium text-white">{interviewDuration}</p> 
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Questions</p>
                <p className="text-sm font-medium text-white">{questionsAskedCount} asked</p> 
              </div>
            </div>
          </div>

          {/* OVERALL SCORE DONUT */}
          <div className="bg-[#111520] border border-white/5 rounded-3xl p-6 w-full md:w-64 flex flex-col items-center justify-center shadow-lg shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500 mb-4">Overall Score</p>
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              {/* SVG Donut */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" 
                  stroke={feedback.totalScore >= 80 ? "#34d399" : feedback.totalScore >= 60 ? "#fbbf24" : "#ef4444"} 
                  strokeWidth="8" strokeLinecap="round" 
                  strokeDasharray={totalScoreCircumference} strokeDashoffset={totalScoreOffset} 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-black text-white">{feedback.totalScore}</span>
                <span className="text-sm font-bold text-gray-500 block -mt-1">/ 100</span>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${badge.color}`}>
              {badge.text}
            </span>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (Spans 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Executive Summary */}
            <div className="bg-[#111520] border border-white/5 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><BookOpen size={18} /></div>
                  Executive Summary
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 flex items-center gap-1.5">
                  <Sparkles size={12}/> AI Summary
                </span>
              </div>
              <p className="text-[14px] text-gray-300 leading-loose">
                {feedback.feedback}
              </p>
            </div>

            {/* Competency Breakdown */}
            <div className="bg-[#111520] border border-white/5 rounded-3xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><BarChart2 size={18} /></div>
                Competency Breakdown
              </h2>
              <div className="space-y-6">
                {categories.map((cat, i) => {
                  const colorClass = getScoreColor(cat.score);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400 font-medium">{cat.name}</span>
                        <span className={`font-bold ${colorClass.split(' ')[0]}`}>{cat.score}%</span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${colorClass.split(' ')[1]}`}
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Radar */}
            <div className="bg-[#111520] border border-white/5 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Radar size={18} /></div>
                  Performance Radar
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Skill Distribution</span>
              </div>
              
              {renderRadarChart()}

              {/* Radar Legend/Summary */}
              <div className="grid grid-cols-5 gap-2 mt-8 pt-6 border-t border-white/5">
                {categories.map((cat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[13px] font-bold text-white">{cat.score}%</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase mt-1 truncate">{cat.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Spans 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Top Strengths */}
            <div className="bg-[#111520] border border-white/5 p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={18} /></div>
                Top Strengths
              </h3>
              <div className="space-y-6">
                {feedback.strengths && feedback.strengths.length > 0 ? feedback.strengths.map((strength, i) => {
                  const splitText = strength.split(':');
                  const title = splitText.length > 1 ? splitText[0] : `Strength ${i+1}`;
                  const desc = splitText.length > 1 ? splitText[1].trim() : strength;
                  
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        0{i+1}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-200 mb-1">{title}</h4>
                        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-500 italic">No specific strengths recorded.</p>
                )}
              </div>
            </div>

            {/* Areas for Growth */}
            <div className="bg-[#111520] border border-white/5 p-8 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><AlertTriangle size={18} /></div>
                Areas for Growth
              </h3>
              <div className="space-y-6 relative z-10">
                {feedback.improvements && feedback.improvements.length > 0 ? feedback.improvements.map((improvement, i) => {
                  const splitText = improvement.split(':');
                  const title = splitText.length > 1 ? splitText[0] : `Improvement ${i+1}`;
                  const desc = splitText.length > 1 ? splitText[1].trim() : improvement;

                  return (
                    <div key={i} className="bg-[#161b22] border border-amber-500/10 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">0{i+1}</span>
                        <h4 className="text-[13px] font-bold text-gray-200">{title}</h4>
                      </div>
                      <p className="text-[12px] text-gray-400 leading-relaxed pl-[42px] flex items-start gap-2">
                        <Target size={12} className="text-amber-500/50 mt-0.5 shrink-0" />
                        {desc}
                      </p>
                    </div>
                  );
                }) : (
                   <p className="text-sm text-gray-500 italic">No specific areas for growth recorded.</p>
                )}
              </div>
            </div>

            {/* DYNAMIC Recommended Next Steps */}
            <div className="bg-[#111520] border border-white/5 p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-bold text-white mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><PlaySquare size={18} /></div>
                  Recommended Next Steps
                </div>
              </h3>
              <div className="space-y-3">
                {recommendedSteps && recommendedSteps.length > 0 ? (
                  recommendedSteps.map((step, i) => {
                    const splitText = step.split(':');
                    const title = splitText.length > 1 ? splitText[0] : `Action Item ${i+1}`;
                    const desc = splitText.length > 1 ? splitText[1].trim() : step;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-4">
                          <div className="text-indigo-400 mt-1"><BookOpen size={16} /></div>
                          <div>
                            <h4 className="text-[13px] font-bold text-gray-200 mb-1">{title}</h4>
                            <p className="text-[11px] text-gray-500">{desc}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    );
                  })
                ) : (
                  // Fallback in case your DB doesn't have a nextSteps array yet
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="text-indigo-400 mt-1"><MessageSquare size={16} /></div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-200 mb-1">Mock Interview Session</h4>
                        <p className="text-[11px] text-gray-500">Take another simulated technical interview.</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
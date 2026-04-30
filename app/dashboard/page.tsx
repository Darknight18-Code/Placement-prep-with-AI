"use client";

import { useState, useEffect } from "react";
import { useAuth as useCustomAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { 
  Trophy, Target, Flame, Code2, ChevronRight, Sparkles, Loader2
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const { user } = useCustomAuth();
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [interviewTrend, setInterviewTrend] = useState<any[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR DYNAMIC INSIGHTS ---
  const [dynamicInsights, setDynamicInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const calculateStreak = (activity: Record<string, number>) => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (offset * 60 * 1000));
    const todayStr = localNow.toISOString().split('T')[0];

    const yesterday = new Date(localNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!(activity[todayStr] > 0) && !(activity[yesterdayStr] > 0)) {
      return 0;
    }

    let streak = 0;
    let curr = new Date(localNow);
    if (!(activity[todayStr] > 0)) curr.setDate(curr.getDate() - 1);

    while (true) {
      const dateStr = curr.toISOString().split('T')[0];
      if (activity[dateStr] && activity[dateStr] > 0) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else { break; }
    }
    return streak;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [aRes, sRes, recentRes, intRes] = await Promise.all([
          fetch("/api/users/activity"),
          fetch("/api/users/submissions/solved"),
          fetch("/api/users/submissions/recent"),
          fetch("/api/users/interviews/recent")
        ]);
        
        const aData = await aRes.json();
        const sData = await sRes.json();
        const rData = await recentRes.json();
        const iData = await intRes.json();

        setActivityData(aData.activity || {});
        setSolvedProblemIds(new Set((sData.solvedIds || []).map((id: any) => String(id))));
        setRecentSubmissions(rData.submissions || []);
        
        const mockRadarData = [
          { subject: 'Arrays', A: 85 },
          { subject: 'DP', A: 65 },
          { subject: 'Strings', A: 45 },
          { subject: 'Trees', A: 90 },
          { subject: 'Graphs', A: 30 },
          { subject: 'Sorting', A: 75 }
        ];
        setTopicStats(mockRadarData);

        if (iData.feedbacks && iData.feedbacks.length > 0) {
            const trend = [...iData.feedbacks].reverse().map((f: any) => ({
              week: f.interview?.jobRole || "Session", 
              score: f.totalScore,
            }));
            setInterviewTrend(trend);
            setLatestFeedback(iData.feedbacks[0]);
        }

      } catch (error) {
        console.error("Dashboard Data Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const currentStreak = calculateStreak(activityData);
  const totalSolved = solvedProblemIds.size;
  const successRate = totalSolved > 0 ? Math.round((totalSolved / (totalSolved + recentSubmissions.filter(s => s.status !== 'correct').length)) * 100) : 0;

  // --- NEW EFFECT TO FETCH AI INSIGHTS ONCE STATS ARE CALCULATED ---
  useEffect(() => {
    if (loading) return; // Wait until base stats are loaded

    const generateRealtimeInsights = async () => {
      setLoadingInsights(true);
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalSolved,
            currentStreak,
            successRate,
            latestScore: latestFeedback?.totalScore || 0
          })
        });
        const data = await res.json();
        if (data.insights) {
          setDynamicInsights(data.insights);
        }
      } catch (error) {
        console.error("Failed to generate AI insights:", error);
        // Fallback insights if API fails
        setDynamicInsights([
          "Keep pushing! Consistency is key in mastering DSA.",
          "Review your recent incorrect submissions to identify weak points.",
          "Try a mock interview to test your skills under pressure."
        ]);
      } finally {
        setLoadingInsights(false);
      }
    };

    generateRealtimeInsights();
  }, [loading, totalSolved, currentStreak, successRate, latestFeedback]);


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-10">
            <h1 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Track your progress and improve your skill</h1>
            <h2 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'Developer'}!</h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Code2 className="text-indigo-400" />} label="Problems Solved" value={totalSolved.toString()} subValue="Live Data" color="indigo" />
            <StatCard icon={<Trophy className="text-orange-400" />} label="Interview Score" value={latestFeedback ? `${latestFeedback.totalScore}%` : "0%"} subValue={latestFeedback?.interview?.jobRole || "No data"} color="orange" />
            <StatCard icon={<Target className="text-emerald-400" />} label="Success Rate" value={`${successRate}%`} subValue="Correct vs Attempted" color="emerald" />
            <StatCard icon={<Flame className="text-purple-400" />} label="Current Streak" value={`${currentStreak} Days`} subValue={currentStreak > 0 ? "Keep it up!" : "Start a new streak today!"} color="purple" />
          </div>

          <section className="bg-[#0D0D0D] border border-gray-800 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 size={20} className="text-indigo-500" /> Problem Solving Activity
              </h3>
              <div className="text-xs text-gray-500 font-mono italic">
                {Object.values(activityData).reduce((a, b) => a + b, 0)} total submissions
              </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800/50 overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex gap-[3px] ml-8 mb-2">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (83 - (i * 7)));
                    return (
                      <div key={i} className="w-3 text-[10px] text-gray-600 font-medium text-center">
                        {date.getDate() <= 7 ? MONTHS[date.getMonth()] : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-[3px]">
                  <div className="flex flex-col gap-[3px] text-[9px] text-gray-600 pr-2 mt-1">
                    <div className="h-3">Mon</div> <div className="h-3"></div>
                    <div className="h-3">Wed</div> <div className="h-3"></div>
                    <div className="h-3">Fri</div>
                  </div>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 12 }).map((_, weekIdx) => (
                      <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (83 - (weekIdx * 7 + dayIdx)));
                          const dStr = date.toISOString().split('T')[0];
                          const count = activityData[dStr] || 0;
                          let color = "bg-[#1a1a1a]"; 
                          if (count > 0) color = "bg-emerald-900";
                          if (count >= 2) color = "bg-emerald-700";
                          if (count >= 4) color = "bg-emerald-500";
                          return (
                            <div 
                              key={dStr} 
                              title={`${count} solved on ${dStr}`} 
                              className={`w-3 h-3 rounded-[1px] transition-all duration-300 ${color} hover:ring-1 hover:ring-white cursor-pointer`} 
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end items-center gap-1.5 mt-4 text-[10px] text-gray-500">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-[1px]" />
                  <div className="w-2.5 h-2.5 bg-emerald-900 rounded-[1px]" />
                  <div className="w-2.5 h-2.5 bg-emerald-700 rounded-[1px]" />
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-[1px]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <ChartCard title="Skill Analysis">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicStats}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#9ca3af', fontSize: 11}} />
                  <Radar name="Skills" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Interview Performance Trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewTrend.length > 0 ? interviewTrend : defaultTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 10}} 
                    dy={10} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} 
                    labelStyle={{color: '#888'}}
                  />
                  <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill: '#818cf8'}} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0D0D0D] border border-gray-800 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-3">
                {recentSubmissions.slice(0, 4).map((sub: any) => (
                  <ProblemRow 
                    key={sub.id}
                    id={sub.problem.id}
                    title={sub.problem.title} 
                    time={new Date(sub.createdAt).toLocaleDateString()} 
                    difficulty={sub.problem.difficulty} 
                    status={sub.status === 'correct' ? 'Solved' : 'Attempted'} 
                  />
                ))}
                {recentSubmissions.length === 0 && (
                  <div className="text-sm text-gray-500 italic p-4 text-center border border-gray-800/50 rounded-2xl">
                    No recent activity found. Time to solve some problems!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0D0D0D] border border-gray-800 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" /> Real-time AI Insights
              </h3>
              
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3 text-gray-500">
                  <Loader2 className="animate-spin text-purple-500" size={24} />
                  <span className="text-xs font-medium animate-pulse">Gemini is analyzing your stats...</span>
                </div>
              ) : (
                <ul className="space-y-5">
                  {dynamicInsights.map((text, i) => (
                    <InsightItem key={i} text={text} />
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

// --- SUB-COMPONENTS (UNTOUCHED) ---

function StatCard({ icon, label, value, subValue, color }: any) {
  return (
    <div className="bg-[#0D0D0D] border border-gray-800 p-6 rounded-3xl shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-2xl bg-gray-800/50">{icon}</div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-white mb-1">{value}</span>
        <span className={`text-[10px] font-medium ${color === 'indigo' ? 'text-indigo-400' : color === 'orange' ? 'text-orange-400' : color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'}`}>
          {subValue}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-[#0D0D0D] border border-gray-800 rounded-3xl p-8 h-80">
      <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

function ProblemRow({ id, title, time, difficulty, status }: any) {
  return (
    <Link href={`/problems/${id}`} className="flex items-center justify-between p-4 bg-[#111111] rounded-2xl border border-gray-800/50 hover:border-indigo-500/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${status === 'Solved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div>
          <h4 className="text-white font-semibold text-sm">{title}</h4>
          <span className="text-[10px] text-gray-500">{time}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{difficulty}</span>
        <span className="text-xs text-gray-400">{status}</span>
        <ChevronRight size={14} className="text-gray-600" />
      </div>
    </Link>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-xs leading-relaxed text-gray-400">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
      {text}
    </li>
  );
}

const defaultRadarData = [
  { subject: 'Arrays', A: 40 }, { subject: 'Strings', A: 30 }, { subject: 'Sorting', A: 20 },
  { subject: 'DP', A: 10 }, { subject: 'Graphs', A: 5 }, { subject: 'Trees', A: 15 },
];

const defaultTrendData = [
  { week: 'W1', score: 40 }, { week: 'W2', score: 55 }, { week: 'W3', score: 70 }, { week: 'W4', score: 82 },
];
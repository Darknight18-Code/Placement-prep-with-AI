"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Problem } from "@prisma/client";

const DSA_TOPICS = [
  "Array", "String", "Hash Table", "Dynamic Programming", "Math",
  "Sorting", "Greedy", "DFS", "BFS", "Binary Search", "Tree",
  "Matrix", "Two Pointers", "Stack", "Queue", "Graph", "Recursion"
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ difficulty?: string; topic?: string; search?: string }>({});

  // 🚀 FIXED: Using the robust local timezone logic from the Dashboard
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
    
    // If no activity today, start counting back from yesterday
    if (!(activity[todayStr] > 0)) {
      curr.setDate(curr.getDate() - 1);
    }

    while (true) {
      const dateStr = curr.toISOString().split('T')[0];
      if (activity[dateStr] && activity[dateStr] > 0) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else { 
        break; 
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak(activityData);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.difficulty) params.append("difficulty", filter.difficulty);
        if (filter.topic) params.append("topic", filter.topic);
        if (filter.search) params.append("search", filter.search);

        const [pRes, aRes, sRes] = await Promise.all([
          fetch(`/api/problems?${params.toString()}`),
          fetch("/api/users/activity"),
          fetch("/api/users/submissions/solved")
        ]);

        const pData = await pRes.json();
        const aData = await aRes.json();
        const sData = await sRes.json();

        setProblems(pData.problems || []);
        setActivityData(aData.activity || {});
        setSolvedProblemIds(new Set((sData.solvedIds || []).map((id: any) => String(id))));
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* --- LEETCODE STYLE DASHBOARD --- */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 mb-10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Submission Activity
            </h2>
            <div className="text-xs text-gray-500">
              Current Streak: <span className="text-orange-500 font-bold">{currentStreak} Days</span>
            </div>
          </div>

          <div className="bg-[#161616] p-6 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="flex flex-col">
              <div className="flex gap-[3px] ml-8 mb-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (83 - (i * 7)));
                  const isNewMonth = date.getDate() <= 7;
                  return (
                    <div key={i} className="w-3 text-[10px] text-gray-600 font-medium">
                      {isNewMonth ? MONTHS[date.getMonth()] : ""}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-[3px]">
                <div className="flex flex-col gap-[3px] text-[9px] text-gray-600 pr-2 mt-1">
                  <div className="h-3 leading-3">Mon</div>
                  <div className="h-3 leading-3"></div>
                  <div className="h-3 leading-3">Wed</div>
                  <div className="h-3 leading-3"></div>
                  <div className="h-3 leading-3">Fri</div>
                </div>

                <div className="flex gap-[3px]">
                  {Array.from({ length: 12 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (83 - (weekIdx * 7 + dayIdx)));
                        const dateStr = date.toISOString().split('T')[0];
                        const count = activityData[dateStr] || 0;

                        let color = "bg-[#262626]"; 
                        if (count > 0) color = "bg-emerald-900";
                        if (count >= 2) color = "bg-emerald-700";
                        if (count >= 4) color = "bg-emerald-500";
                        if (count >= 6) color = "bg-emerald-400";

                        return (
                          <div
                            key={dateStr}
                            title={`${count} submissions on ${dateStr}`}
                            className={`w-3 h-3 rounded-[1px] transition-all duration-300 ${color} hover:ring-1 hover:ring-white cursor-pointer`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-1.5 mt-4 text-[10px] text-gray-500">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-[#262626] rounded-[1px]" />
              <div className="w-2.5 h-2.5 bg-emerald-900 rounded-[1px]" />
              <div className="w-2.5 h-2.5 bg-emerald-700 rounded-[1px]" />
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-[1px]" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatCard label="Solved" value={solvedProblemIds.size} total={problems.length} color="text-emerald-500" />
            <StatCard label="Daily Streak" value={currentStreak} total={30} color="text-amber-500" suffix=" Days" />
            <StatCard label="Total Problems" value={problems.length} total={problems.length} color="text-indigo-500" />
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or question number..."
              className="w-full bg-[#111111] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-white transition-all"
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex gap-3">
            <FilterSelect label="Difficulty" options={['Easy', 'Medium', 'Hard']} onChange={(val: string) => setFilter({ ...filter, difficulty: val })} />
            <FilterSelect label="Topics" options={DSA_TOPICS} onChange={(val: string) => setFilter({ ...filter, topic: val })} />
          </div>
        </div>

        {/* --- PROBLEMS TABLE --- */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-gray-800/50">
            {loading ? (
              <div className="p-20 text-center text-gray-500 animate-pulse font-mono uppercase text-xs tracking-widest">
                Syncing Progress...
              </div>
            ) : problems.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="text-gray-600 mb-2">
                  <svg className="w-12 h-12 mx-auto opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-bold">No problems found</p>
                  <p className="text-sm opacity-60">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              problems.map((problem: any) => {
                const isSolved = solvedProblemIds.has(String(problem.id));

                return (
                  <Link key={problem.id} href={`/problems/${problem.id}`} className="group flex items-center p-5 hover:bg-[#161616] transition-all">
                    <div className="mr-6">
                      {isSolved ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-700 group-hover:border-gray-500 transition-colors" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono text-sm w-8 shrink-0">
                          {problem.questionNo}.
                        </span>
                        
                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {problem.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          problem.difficulty.toLowerCase() === 'easy' ? 'text-emerald-500 bg-emerald-500/10' : 
                          problem.difficulty.toLowerCase() === 'medium' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1 ml-11 flex items-center gap-2">
                        <span className="bg-gray-800/40 px-2 py-0.5 rounded">#{problem.topic}</span>
                        <span>• Standard DSA Practice</span>
                      </div>
                    </div>

                    <div className="text-gray-600 group-hover:translate-x-1 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, total, color, suffix = "" }: any) {
  return (
    <div className="bg-[#161616] border border-gray-800/50 p-5 rounded-xl flex items-center justify-between group hover:border-gray-700 transition-all">
      <div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-sm text-gray-600 font-mono italic ml-1">{suffix}</p>
        </div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</p>
      </div>
      <div className={`text-sm font-bold ${color} bg-white/5 px-2 py-1 rounded`}>
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </div>
    </div>
  );
}

function FilterSelect({ label, options, onChange }: any) {
  return (
    <select
      onChange={(e) => onChange(e.target.value || undefined)}
      className="bg-[#111111] border border-gray-800 rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 focus:outline-none focus:ring-1 ring-indigo-500 transition-all cursor-pointer"
    >
      <option value="">{label}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt.toLowerCase()}>{opt}</option>
      ))}
    </select>
  );
}
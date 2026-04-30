"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Code2, AlertCircle, CheckCircle2, Settings, ListPlus, Hash, ChevronDown } from "lucide-react";
import { addProblem } from "@/app/actions/problems";
import { useRouter } from "next/navigation";

export default function AddProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 1. Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    questionNo: "", 
    title: "",
    topic: "",
    difficulty: "easy",
    description: "",
    constraints: "",
  });

  // 2. Metadata State (For Code Template Generation)
  const [metadata, setMetadata] = useState({
    fnName: "solve",
    returnType: "int", // Default
    params: [{ name: "nums", type: "int[]" }]
  });

  const SUPPORTED_TYPES = [
    "int", 
    "double", 
    "string", 
    "boolean", 
    "int[]", 
    "string[]", 
    "vector<string>",
    "vector<vector<int>>",
    "vector<vector<char>>",
    "TreeNode"
  ];

  // 3. Examples State (Updated with explanation)
  const [examples, setExamples] = useState([{ input: "", output: "", explanation: "" }]);
  
  // 4. Test Case State (with Toggles)
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", isSample: false, isHidden: false }
  ]);

  const handleSubmit = async () => {
    setLoading(true);
    setServerError(null);
    setSuccess(false);

    // Convert questionNo string to integer for Prisma
    const payload = { 
      ...basicInfo, 
      questionNo: parseInt(basicInfo.questionNo),
      metadata, 
      examples: examples.filter(ex => ex.input || ex.output),
      testCases: testCases.filter(tc => tc.input || tc.expectedOutput),
    };

    const res = await addProblem(payload);
    
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push("/problems"), 1500);
    } else {
      setServerError(res.error || "Failed to create problem");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 p-6 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Notifications */}
        {serverError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{serverError}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={20} />
            <p className="font-bold text-sm">Problem created successfully!</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
              <Code2 className="text-indigo-500" size={36} /> ADD PROBLEM
            </h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || !basicInfo.questionNo}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "SAVING..." : <><Save size={18} /> SAVE TO DB</>}
          </button>
        </header>

        <div className="space-y-10 pb-20">
          
          {/* Section 1: Core Details */}
          <section className="bg-[#0D0D0D] border border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
            <h3 className="text-white font-black mb-8 text-xl uppercase tracking-tight">1. Core Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Question Number Input */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em] flex items-center gap-1">
                  <Hash size={10} /> Question No.
                </label>
                <input 
                  type="number" 
                  className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-indigo-400 font-bold focus:ring-2 ring-indigo-500/20 outline-none" 
                  placeholder="e.g. 1" 
                  value={basicInfo.questionNo}
                  onChange={(e) => setBasicInfo({...basicInfo, questionNo: e.target.value})} 
                />
              </div>

              {/* Topic Input */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Topic</label>
                <input 
                  type="text" 
                  className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none" 
                  placeholder="Array" 
                  value={basicInfo.topic}
                  onChange={(e) => setBasicInfo({...basicInfo, topic: e.target.value})} 
                />
              </div>

              {/* Title Input */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Title</label>
                <input 
                  type="text" 
                  className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none" 
                  placeholder="e.g. Two Sum" 
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Difficulty</label>
                <select className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none cursor-pointer" value={basicInfo.difficulty} onChange={(e) => setBasicInfo({...basicInfo, difficulty: e.target.value})}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Description (Markdown)</label>
                <textarea rows={4} className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none resize-none font-mono text-sm" placeholder="Explain the problem..." value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Constraints</label>
                <textarea 
                  rows={3} 
                  className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none resize-none font-mono text-sm border-l-4 border-l-indigo-500" 
                  placeholder="e.g. 1 <= nums.length <= 10^4" 
                  value={basicInfo.constraints}
                  onChange={(e) => setBasicInfo({...basicInfo, constraints: e.target.value})} 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Metadata */}
          <section className="bg-[#0D0D0D] border border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full" />
            
            <h3 className="text-white font-black mb-8 text-xl uppercase tracking-tight flex items-center gap-2">
              <Settings size={20} className="text-indigo-400" /> 2. Function Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Function Name */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Function Name</label>
                <input 
                  className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-indigo-400 font-mono outline-none focus:border-indigo-500/50 transition-colors" 
                  value={metadata.fnName} 
                  onChange={(e) => setMetadata({...metadata, fnName: e.target.value})} 
                />
              </div>

              {/* Return Type Dropdown */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Return Type</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#161616] border border-gray-800 rounded-2xl px-5 py-4 text-emerald-400 font-mono outline-none appearance-none cursor-pointer focus:border-emerald-500/50"
                    value={metadata.returnType}
                    onChange={(e) => setMetadata({...metadata, returnType: e.target.value})}
                  >
                    {SUPPORTED_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Parameters List */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase block tracking-[0.2em] mb-2">Parameters</label>
              {metadata.params.map((param, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-center bg-[#161616]/50 p-4 rounded-2xl border border-gray-800/50 group hover:border-gray-700 transition-all">
                  <div className="flex-1 w-full">
                    <input 
                      placeholder="Param Name (e.g. nums)" 
                      className="w-full bg-transparent border-none text-sm font-mono text-gray-200 outline-none" 
                      value={param.name} 
                      onChange={(e) => {
                        const n = [...metadata.params]; n[idx].name = e.target.value; setMetadata({...metadata, params: n});
                      }} 
                    />
                  </div>

                  <div className="relative w-full md:w-48">
                    <select 
                      className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2 text-xs font-mono text-indigo-400 outline-none appearance-none cursor-pointer"
                      value={param.type}
                      onChange={(e) => {
                        const n = [...metadata.params]; n[idx].type = e.target.value; setMetadata({...metadata, params: n});
                      }}
                    >
                      {SUPPORTED_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>

                  <button 
                    onClick={() => setMetadata({...metadata, params: metadata.params.filter((_, i) => i !== idx)})} 
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => setMetadata({...metadata, params: [...metadata.params, { name: "", type: "int" }]})} 
                className="text-[10px] text-indigo-500 font-black uppercase mt-4 flex items-center gap-2 hover:text-indigo-400 transition-colors"
              >
                <Plus size={14} className="bg-indigo-500/10 p-0.5 rounded" /> Add Parameter
              </button>
            </div>
          </section>

          {/* Section 3: User Examples (UPDATED WITH EXPLANATION) */}
          <section className="bg-[#0D0D0D] border border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-white font-black text-xl uppercase tracking-tight">3. User Examples</h3>
              <button onClick={() => setExamples([...examples, { input: "", output: "", explanation: "" }])} className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-6">
              {examples.map((ex, idx) => (
                <div key={idx} className="p-6 bg-[#161616] border border-gray-800 rounded-[2rem] relative group hover:border-gray-700 transition-colors">
                  <button onClick={() => setExamples(examples.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <input 
                      placeholder="Input" 
                      className="bg-[#0D0D0D] border border-gray-800 rounded-xl px-4 py-3 text-sm text-indigo-400 font-mono outline-none focus:border-indigo-500/50" 
                      value={ex.input} 
                      onChange={(e) => { const n = [...examples]; n[idx].input = e.target.value; setExamples(n); }} 
                    />
                    <input 
                      placeholder="Output" 
                      className="bg-[#0D0D0D] border border-gray-800 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono outline-none focus:border-emerald-500/50" 
                      value={ex.output} 
                      onChange={(e) => { const n = [...examples]; n[idx].output = e.target.value; setExamples(n); }} 
                    />
                  </div>

                  {/* Added Explanation Field */}
                  <textarea 
                    placeholder="Explanation (Optional)" 
                    rows={2}
                    className="w-full bg-[#0D0D0D] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-400 font-mono outline-none focus:border-gray-600 resize-none" 
                    value={ex.explanation} 
                    onChange={(e) => { const n = [...examples]; n[idx].explanation = e.target.value; setExamples(n); }} 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Test Cases */}
          <section className="bg-[#0D0D0D] border border-gray-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
             <div className="flex justify-between items-center mb-8">
              <h3 className="text-white font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <ListPlus size={20} /> 4. Logic Test Cases
              </h3>
              <button onClick={() => setTestCases([...testCases, { input: "", expectedOutput: "", isSample: false, isHidden: false }])} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {testCases.map((tc, idx) => (
                <div key={idx} className="bg-[#161616] p-5 rounded-[2rem] border border-gray-800 transition-all hover:border-gray-600">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="flex-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase mb-1 block ml-2">Input (Multi-line Support)</label>
                      <textarea 
                        placeholder="nums1 = 1,3&#10;nums2 = 2" 
                        className="w-full bg-[#0D0D0D] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-300 outline-none focus:ring-1 ring-indigo-500 min-h-[80px] resize-none"
                        value={tc.input}
                        onChange={(e) => { const n = [...testCases]; n[idx].input = e.target.value; setTestCases(n); }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase mb-1 block ml-2">Expected Output</label>
                      <textarea 
                        placeholder="2.0" 
                        className="w-full bg-[#0D0D0D] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-500 outline-none focus:ring-1 ring-emerald-500 min-h-[80px] resize-none"
                        value={tc.expectedOutput}
                        onChange={(e) => { const n = [...testCases]; n[idx].expectedOutput = e.target.value; setTestCases(n); }}
                      />
                    </div>
                    <button onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))} className="text-gray-600 hover:text-red-500 transition-colors pt-6">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex gap-6 px-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="hidden" checked={tc.isSample} onChange={() => { const n = [...testCases]; n[idx].isSample = !n[idx].isSample; setTestCases(n); }} />
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${tc.isSample ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${tc.isSample ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${tc.isSample ? 'text-indigo-400' : 'text-gray-500'}`}>Sample</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="hidden" checked={tc.isHidden} onChange={() => { const n = [...testCases]; n[idx].isHidden = !n[idx].isHidden; setTestCases(n); }} />
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${tc.isHidden ? 'bg-amber-600' : 'bg-gray-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${tc.isHidden ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${tc.isHidden ? 'text-amber-400' : 'text-gray-500'}`}>Hidden</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
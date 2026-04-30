"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Sparkles, Code2, Mic, Lightbulb, UserRound, Rocket, ChevronRight, CheckCircle2, Target, BarChart3, Star } from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth(); 
  const router = useRouter();

  // --- THE BOUNCER (Auto-Redirect for logged-in users) ---
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleStartLearning = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  // Prevent the page from rendering while Clerk is figuring out if they are logged in
  if (!isLoaded || isSignedIn) {
    return <div className="min-h-screen bg-[#05050A]" />; 
  }

  return (
    // THE MAGIC HAPPENS HERE: The background color, and the linear-gradient grid pattern
    <main 
      className="min-h-screen bg-[#05050A] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      
      {/* --- INJECTED CUSTOM ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
      `}} />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 px-6">
        <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-xs font-bold border border-white/10 text-indigo-300 backdrop-blur-md">
              <Sparkles size={14} /> New: AI Mock Interviews available now
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Practice DSA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Smarter.</span><br />
              Crack Interviews <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Faster.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              The all-in-one platform to master data structures, algorithms, and system design with real-time AI guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={handleStartLearning} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                Start Learning Now <ChevronRight size={18} />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl border border-white/10 transition-all flex items-center justify-center backdrop-blur-sm">
                Explore Features
              </button>
            </div>
          </div>
          
          {/* Hero Mockup (Floating & Tilted) */}
          <div className="relative z-10 lg:ml-10 animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 blur-[80px] -z-10 rounded-full" />
            <div className="aspect-[4/3] bg-[#0A0A0F] border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.2)] flex items-center justify-center overflow-hidden transition-all duration-500 hover:rotate-0 hover:scale-105 backdrop-blur-xl">
               <img src="/hero_mockup.png" alt="Hero Mockup" className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>
      </section>

      {/* --- ALTERNATING FEATURES (ZIG-ZAG) --- */}
      <section className="py-24 px-6 space-y-32 max-w-7xl mx-auto relative z-10">
        
        {/* Feature 1 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm w-fit">Track Your Progress <br/> Like a Pro</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm">
              Visualize your problem-solving journey with detailed heatmaps, difficulty breakdowns, and topic-wise analytics to ensure you are always improving.
            </p>
            <ul className="space-y-3 text-gray-300 font-medium pt-4 bg-black/20 p-4 -ml-4 rounded-xl backdrop-blur-sm w-fit">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={20}/> Detailed Heatmaps</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={20}/> Topic-wise Mastery</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={20}/> AI Insights</li>
            </ul>
          </div>
          <div className="animate-float-reverse">
            <div className="aspect-[4/3] bg-[#0A0A0F]/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)] flex items-center justify-center hover:rotate-0 transition-transform duration-500">
               <img src="/progress.png" alt="Progress Mockup" className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>

        {/* Feature 2 (Reversed) */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 animate-float">
            <div className="aspect-[4/3] bg-[#0A0A0F]/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center justify-center hover:rotate-0 transition-transform duration-500">
               <img src="/code_editor.jpg" alt="Editor Mockup" className="w-full h-full object-cover object-center" />
            </div>
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase bg-black/20 px-3 py-1 -ml-3 rounded-lg backdrop-blur-sm w-fit">Smart Coding Environment</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm w-fit">Master DSA with Structured Practice</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm">
              Write, compile, and test your code against hundreds of hidden test cases instantly. Stuck? Get gentle nudges from our AI tutor.
            </p>
            <ul className="space-y-3 text-gray-300 font-medium pt-4 bg-black/20 p-4 -ml-4 rounded-xl backdrop-blur-sm w-fit">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> Real-time Code Execution</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> AI Contextual Hints</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> Optimal Solution Analysis</li>
            </ul>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="text-purple-400 font-bold tracking-widest text-sm uppercase bg-black/20 px-3 py-1 -ml-3 rounded-lg backdrop-blur-sm w-fit">Voice & Video AI</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm w-fit">Experience Real AI Interviews</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md bg-black/20 p-2 -ml-2 rounded-xl backdrop-blur-sm">
              Face the pressure of a real interview. Speak directly to our AI interviewer, explain your logic, and write code under timed conditions.
            </p>
            <ul className="space-y-3 text-gray-300 font-medium pt-4 bg-black/20 p-4 -ml-4 rounded-xl backdrop-blur-sm w-fit">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-purple-400" size={20}/> Conversational Voice AI</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-purple-400" size={20}/> Behavioral & Technical</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-purple-400" size={20}/> Post-Interview Feedback</li>
            </ul>
          </div>
          <div className="animate-float-reverse">
            <div className="aspect-[4/3] bg-[#0A0A0F]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] flex items-center justify-center hover:rotate-0 transition-transform duration-500">
               <img src="/interview.png" alt="Mock Interview Mockup" className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>

      </section>

      {/* --- BENTO GRID: FLOATING CARDS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-black/30 inline-block px-4 py-2 rounded-2xl backdrop-blur-md">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Get Hired</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto bg-black/30 px-4 py-2 rounded-xl backdrop-blur-md">A comprehensive toolkit designed specifically for modern software engineering interviews.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <BentoCard 
            icon={<Code2 />} color="text-blue-400" shadowColor="rgba(59,130,246,0.4)" 
            title="Curated DSA Lists" desc="Handpicked problem sets focusing on high-ROI patterns." 
            animation="animate-float" delay="0s" 
          />
          <BentoCard 
            icon={<Mic />} color="text-purple-400" shadowColor="rgba(168,85,247,0.4)" 
            title="Voice Mock Interviews" desc="Train your verbal communication while coding." 
            animation="animate-float-reverse" delay="1s" 
          />
          <BentoCard 
            icon={<BarChart3 />} color="text-orange-400" shadowColor="rgba(2fb,146,60,0.4)" 
            title="Space-Time Analysis" desc="AI instantly checks your Big O complexity." 
            animation="animate-float" delay="2s" 
          />
          <BentoCard 
            icon={<Target />} color="text-emerald-400" shadowColor="rgba(52,211,153,0.4)" 
            title="Company Specific Prep" desc="Practice questions recently asked at FAANG." 
            animation="animate-float-reverse" delay="0.5s" 
          />
          <BentoCard 
            icon={<Lightbulb />} color="text-yellow-400" shadowColor="rgba(250,204,21,0.4)" 
            title="Socratic Hints" desc="Get unstuck without seeing the final code." 
            animation="animate-float" delay="1.5s" 
          />
          <BentoCard 
            icon={<UserRound />} color="text-pink-400" shadowColor="rgba(244,114,182,0.4)" 
            title="Resume Roasting" desc="Upload your PDF and get instant ATS feedback." 
            animation="animate-float-reverse" delay="2.5s" 
          />
        </div>
      </section>

      {/* --- PATH TO SUCCESS TIMELINE --- */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-black/30 inline-block px-4 py-2 rounded-2xl backdrop-blur-md">Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Interview Success</span></h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-[2px] bg-white/10 -translate-y-1/2 z-0" />
          
          <StepCard num="01" title="Learn Patterns" desc="Understand core techniques rather than memorizing solutions." color="text-indigo-400" />
          <StepCard num="02" title="Practice Daily" desc="Solve targeted problems with our smart IDE." color="text-blue-400" />
          <StepCard num="03" title="Mock Interviews" desc="Simulate the pressure with our voice AI." color="text-purple-400" />
          <StepCard num="04" title="Get the Offer" desc="Walk into your real interview with total confidence." color="text-emerald-400" />
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="relative overflow-hidden rounded-[3rem] border border-indigo-500/20 bg-[#0A0A0F]/80 backdrop-blur-xl p-12 md:p-20 shadow-[0_0_80px_rgba(79,70,229,0.15)] animate-float">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight bg-black/20 p-4 rounded-2xl inline-block backdrop-blur-sm">
              Start Your Placement <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Preparation Today</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto bg-black/20 p-3 rounded-xl backdrop-blur-sm">
              Join the fastest-growing community of developers. Stop grinding aimlessly and start learning with intent.
            </p>
            <button onClick={handleStartLearning} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-1">
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-[#05050A]/90 backdrop-blur-xl pt-16 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
           <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                  <Code2 size={14} className="text-white" />
                </div>
                DSA.AI
              </div>
              <p className="text-sm text-gray-500">Empowering the next generation of software engineers with artificial intelligence.</p>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Platform</h4>
             <ul className="space-y-2 text-sm text-gray-500">
               <li><Link href="#" className="hover:text-white transition-colors">Problems</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Mock Interviews</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Leaderboard</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Resources</h4>
             <ul className="space-y-2 text-sm text-gray-500">
               <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">System Design</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Cheat Sheets</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Legal</h4>
             <ul className="space-y-2 text-sm text-gray-500">
               <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
             </ul>
           </div>
        </div>
        <div className="text-center text-gray-600 text-xs pt-8 border-t border-white/5">
          &copy; 2026 DSA.AI Platform. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

/* --- SUB COMPONENTS FOR CLEAN CODE --- */

function BentoCard({ icon, title, desc, color, shadowColor, animation, delay }: any) {
  return (
    <div 
      className={`${animation} group relative bg-white/5 border border-white/10 p-8 rounded-3xl transition-all duration-500 hover:bg-white/10 hover:rotate-0 hover:scale-105 z-10 backdrop-blur-xl`}
      style={{ animationDelay: delay }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px ${shadowColor}, inset 0 0 20px ${shadowColor.replace('0.4', '0.1')}`;
        e.currentTarget.style.borderColor = shadowColor.replace('rgba', 'rgb').replace(',0.4)', ')'); 
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-black/40 mb-6 group-hover:scale-110 transition-transform duration-500 ${color} border border-white/5 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
    </div>
  )
}

function StepCard({ num, title, desc, color }: any) {
  return (
    <div className="bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative z-10 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-500 group">
      <div className={`text-sm font-mono font-bold mb-4 bg-white/5 inline-block px-3 py-1 rounded-lg ${color} group-hover:scale-110 transition-transform`}>{num}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function StatBox({ value, label }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors hover:-translate-y-1 duration-300 backdrop-blur-md">
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function TestimonialCard({ text, name, role }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col justify-between hover:bg-white/10 transition-all hover:scale-105 duration-500 cursor-default backdrop-blur-xl">
      <div className="flex gap-1 mb-6 text-yellow-500">
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
      </div>
      <p className="text-gray-300 text-sm leading-relaxed mb-8">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600/30 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-white font-bold text-sm">{name}</div>
          <div className="text-gray-500 text-xs">{role}</div>
        </div>
      </div>
    </div>
  )
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuth as useCustomAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Code2, Mic, User, Zap, LogOut, FileText } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut, isSignedIn } = useAuth();
  const { user: dbUser, loading } = useCustomAuth();

  // State to track if the user has scrolled down
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const user = dbUser || (clerkUser ? {
    name: clerkUser.fullName || clerkUser.firstName || "User",
  } : null);

  // Dynamically build the links array: Show "Home" ONLY if not signed in.
  const navLinks = [
    ...(!isSignedIn ? [{ name: "Home", href: "/", icon: null }] : []),
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
    { name: "DSA Practice", href: "/problems", icon: <Code2 size={16} /> },
    { name: "Mock Interview", href: "/interview", icon: <Mic size={16} /> },
    { name: "Resume ATS", href: "/resume", icon: <FileText size={16} /> }, 
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-500 ${
        isScrolled 
          ? "h-16 bg-[#05050A]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" 
          : "h-24 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between transition-all duration-500">
        
        {/* --- LOGO (Left) --- */}
        <Link href="/" className="flex items-center gap-3 font-black tracking-tighter group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] group-hover:scale-105 transition-all duration-500">
            <Zap size={20} className="text-white fill-white" />
            {/* Inner glow ring */}
            <div className="absolute inset-0 rounded-xl border border-white/20" />
          </div>
          <span className="text-white text-2xl tracking-normal">
            DSA<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">.AI</span>
          </span>
        </Link>

        {/* --- NAV LINKS (Center) --- */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative group flex items-center gap-2 px-4 py-2 text-[15px] font-medium transition-all duration-300 rounded-full ${
                isActive(link.href) ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {/* Icon & Text */}
              <span className="relative z-10 flex items-center gap-2">
                {link.icon}
                {link.name}
              </span>

              {/* Animated Background Highlight */}
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-full transition-colors duration-300 z-0" />
              
              {/* Premium Glowing Underline */}
              <span 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full blur-[1px] ${
                  isActive(link.href) ? "w-3/4 opacity-100" : "w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-100"
                }`} 
              />
              <span 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-white/50 to-white/50 transition-all duration-300 rounded-full ${
                  isActive(link.href) ? "w-3/4 opacity-100" : "w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-100"
                }`} 
              />
            </Link>
          ))}
        </nav>

        {/* --- USER ACTIONS (Right) --- */}
        <div className="flex items-center gap-5">
          {!clerkLoaded || loading ? (
            <div className="w-32 h-10 bg-white/5 animate-pulse rounded-full" />
          ) : isSignedIn && user ? (
            <div className="flex items-center gap-4">
              
              {/* Profile Icon */}
              <Link href="/profile" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300">
                <User size={20} />
              </Link>

              {/* Status Pill (Pulsing Green Dot + Name) */}
              <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-full cursor-default backdrop-blur-md shadow-inner">
                <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <span className="text-sm text-gray-300 font-medium tracking-wide">
                  {user.name}
                </span>
              </div>

              {/* Premium Logout Button */}
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-5 py-2 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="relative px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] z-0" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
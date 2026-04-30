import { db } from "@/lib/newdb";
import { auth, currentUser } from "@clerk/nextjs/server"; // Import currentUser
import { notFound, redirect } from "next/navigation";
import LocalAgent from "@/components/LocalAgent";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface InterviewPageProps {
  params: {
    interviewId: string;
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { userId } = auth();
  
  // 1. Ensure User is Authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Fetch Detailed User Data from Clerk for the Name
  const clerkUser = await currentUser();
  const candidateName = clerkUser?.firstName || "Candidate";

  // 3. Fetch Interview from MongoDB
  const interview = await db.interview.findUnique({
    where: {
      id: params.interviewId,
      userId: userId, 
    },
  });

  // 4. Handle 404 if no interview found
  if (!interview || !interview.questions || interview.questions.length === 0) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="p-6 border-b border-gray-800 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            <ChevronLeft size={20} /> Exit to Dashboard
          </Link>
          
          <div className="text-right">
            <h1 className="text-sm font-black uppercase tracking-tighter text-indigo-500">
              {interview.jobRole}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
              {interview.interviewType} Session
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        {/* ADDED candidateName and jobRole props here */}
        <LocalAgent 
          questions={interview.questions} 
          interviewId={interview.id} 
          candidateName={candidateName}
          jobRole={interview.jobRole}
        />
      </main>
      
      <footer className="p-8 text-center border-t border-gray-800">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
          Ensure your microphone is connected and you are in a quiet environment.
        </p>
      </footer>
    </div>
  );
}
"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteInterview } from "@/app/actions/interview";
import { cn } from "@/lib/utils";

export default function DeleteInterview({ interviewId }: { interviewId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure? This will permanently delete this session and all associated feedback.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteInterview(interviewId);
      if (!res.success) {
        alert("Failed to delete interview. Please try again.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={cn(
        "p-2 rounded-xl transition-all duration-200",
        "bg-gray-800/50 hover:bg-red-500/10 text-gray-500 hover:text-red-500 border border-gray-700 hover:border-red-500/50",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      title="Delete Session"
    >
      {isDeleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
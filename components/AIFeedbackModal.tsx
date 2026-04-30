"use client";

import { useEffect } from "react";
import { AIAnalysis } from "@/types";

interface AIFeedbackModalProps {
  analysis: AIAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIFeedbackModal({
  analysis,
  isOpen,
  onClose,
}: AIFeedbackModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !analysis) return null;

  // Inside AIFeedbackModal component
const getAnalysisIcon = () => {
  // Add a check for starter code or empty input
  if (!analysis.feedback || analysis.feedback.length < 5) return "💭";
  
  switch (analysis.approach) {
    case "correct": return "✅";
    case "incorrect": return "❌";
    case "partial": return "⚠️";
    case "starter": return "🌱"; // New: specifically for beginning/hints
    case "hint": return "💡";    // New: for general guidance
    default: return "💭";
  }
};

  const getAnalysisColor = () => {
    switch (analysis.approach) {
      case "correct":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "incorrect":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "partial":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getTitleColor = () => {
    switch (analysis.approach) {
      case "correct":
        return "text-green-700 dark:text-green-300";
      case "incorrect":
        return "text-red-700 dark:text-red-300";
      case "partial":
        return "text-yellow-700 dark:text-yellow-300";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-4 ${getAnalysisColor()} bg-white dark:bg-gray-800`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getAnalysisIcon()}</span>
            <h2 className={`text-2xl font-bold ${getTitleColor()}`}>
              AI Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Feedback */}
          <div>
            <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
              {analysis.feedback}
            </p>
          </div>

          {/* Complexity */}
          {analysis.complexity && (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Complexity Analysis:
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Time: </span>
                  <strong className="text-gray-900 dark:text-white">
                    {analysis.complexity.time}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Space: </span>
                  <strong className="text-gray-900 dark:text-white">
                    {analysis.complexity.space}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Edge Cases */}
          {analysis.edgeCases && analysis.edgeCases.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Consider these edge cases:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {analysis.edgeCases.map((edgeCase, idx) => (
                  <li key={idx}>{edgeCase}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Suggestions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hint Level */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hint Level: {analysis.hintLevel}/4
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}


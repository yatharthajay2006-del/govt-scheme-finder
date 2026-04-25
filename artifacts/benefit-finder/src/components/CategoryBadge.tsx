import React from "react";
import { Badge } from "@/components/ui/badge";
import { SchemeCategory } from "@workspace/api-client-react";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  [SchemeCategory.scholarship]: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/50", label: "Scholarship" },
  [SchemeCategory.healthcare]: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", border: "border-green-200 dark:border-green-800/50", label: "Healthcare" },
  [SchemeCategory.ration]: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/50", label: "Ration & Food" },
  [SchemeCategory.pension]: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800/50", label: "Pension" },
  [SchemeCategory.employment]: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-800 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800/50", label: "Employment" },
  [SchemeCategory.housing]: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/50", label: "Housing" },
  [SchemeCategory.agriculture]: { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-800 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800/50", label: "Agriculture" },
  [SchemeCategory.women]: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-800 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800/50", label: "Women & Child" },
  [SchemeCategory.disability]: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-800 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800/50", label: "Disability" },
  [SchemeCategory.other]: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-800 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700", label: "Other" },
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const style = categoryStyles[category] || categoryStyles[SchemeCategory.other];
  
  return (
    <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} hover:${style.bg} font-medium border ${className}`}>
      {style.label}
    </Badge>
  );
}
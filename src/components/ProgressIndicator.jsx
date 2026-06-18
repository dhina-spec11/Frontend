import React from 'react';

export default function ProgressIndicator({ percentage, completedCount, totalRequired }) {
  return (
    <div className="sticky top-[58px] md:top-[68px] z-20 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4 text-xs md:text-sm font-semibold select-none">
        <span className="text-slate-600 dark:text-slate-400">
          Form Progress: <span className="text-brand dark:text-sky-400 font-extrabold">{percentage}%</span>
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {completedCount} of {totalRequired} required fields completed
        </span>
      </div>
      
      {/* Progress bar line */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand to-sky-400 dark:from-sky-500 dark:to-sky-300 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

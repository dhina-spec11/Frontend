import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FormField({ label, required, error, description, children }) {
  return (
    <div 
      className={`bg-white dark:bg-brand-dark rounded-lg p-6 border transition-all duration-200 flex flex-col gap-3 ${
        error 
          ? 'border-red-400 dark:border-red-500 border-l-6 border-l-red-500 shadow-sm' 
          : 'border-slate-200 dark:border-slate-800 shadow-gform focus-within:border-l-6 focus-within:border-l-brand focus-within:shadow-gform-active'
      }`}
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 select-none">
          <span>{label}</span>
          {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed select-none">
            {description}
          </p>
        )}
      </div>

      <div className="mt-1">
        {children}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-semibold mt-1 animate-pulse" role="alert">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

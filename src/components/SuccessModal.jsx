import React from 'react';
import { Check } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, formTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-brand-dark rounded-xl max-w-sm w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all duration-300 scale-100 flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Check Container */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 flex items-center justify-center text-emerald-500 success-scale-up">
          <Check size={32} strokeWidth={3} />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Submission Successful!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Thank you! Your registration details for <strong>{formTitle || 'Student Registration Form'}</strong> have been recorded in the Firestore database.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold text-xs rounded hover:shadow-md transition duration-200 cursor-pointer"
        >
          Dismiss
        </button>

      </div>
    </div>
  );
}

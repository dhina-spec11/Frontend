import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export default function ConfirmationDialog({ isOpen, onConfirm, onCancel, data }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-brand-dark rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all duration-300 scale-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Confirm Registration</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Please review your entries below before submitting.</p>
          </div>
        </div>

        {/* Dynamic Summary Review Grid */}
        <div className="max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Full Name:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.fullName || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Email Address:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.email || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Phone Number:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.phone || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Gender:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.gender || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Date of Birth:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.dob || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-800/50 pb-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">City Location:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.city || '-'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Skills Selected:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={data.skills}>
              {data.skills || 'None'}
            </span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white font-semibold text-xs rounded hover:bg-brand-hover transition shadow-sm cursor-pointer"
          >
            <Check size={13} />
            <span>Confirm Submit</span>
          </button>
        </div>

      </div>
    </div>
  );
}

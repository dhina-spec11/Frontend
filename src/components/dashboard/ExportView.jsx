import React, { useState } from 'react';
import { 
  Download, FileJson, Info, ShieldCheck, Check, Sparkles 
} from 'lucide-react';
import { getResponses } from '../../firebase';

export default function ExportView({ allForms, user }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleExportJSON = async () => {
    setLoading(true);
    setCompleted(false);
    try {
      const filteredForms = allForms.filter(f => f.ownerUid === user?.uid || f.sharedWith?.includes(user?.email));
      
      const hydratedData = await Promise.all(filteredForms.map(async (form) => {
        try {
          const resList = await getResponses(form.id);
          return {
            ...form,
            submissions: resList
          };
        } catch (e) {
          return {
            ...form,
            submissions: []
          };
        }
      }));

      const backup = {
        exportVersion: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email,
        formsCount: hydratedData.length,
        forms: hydratedData
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `formstudio_workspace_backup_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCompleted(true);
      setTimeout(() => setCompleted(false), 3000);
    } catch (e) {
      console.error("Failed to export database schema:", e);
      alert("Failed to compile workspace backup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Export Workspace</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Create complete offline archives of all your forms, layouts, settings, and response ledgers.
        </p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <FileJson size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Complete Workspace Archive (.json)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
              This package consolidates your custom form builders, fields structure, settings presets, theme metadata, and all submission records ever registered in your workspace directory into a single backup.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-xl flex items-start gap-3">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            <strong>Security Warning:</strong> This archive holds private form details and user response data. Store this file securely and do not share it with unauthorized users.
          </div>
        </div>

        <button
          onClick={handleExportJSON}
          disabled={loading}
          className="w-full sm:w-auto self-start mt-2 bg-gradient-to-r from-sky-500 to-brand hover:from-sky-600 hover:to-brand-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : completed ? (
            <Check size={13} />
          ) : (
            <Download size={13} />
          )}
          <span>{loading ? 'Compiling Archive...' : completed ? 'Export Completed!' : 'Download JSON Archive'}</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, AlertTriangle, Info, Check, ShieldCheck 
} from 'lucide-react';
import { saveForm } from '../../firebase';

export default function TrashView({ user, onReloadCatalog }) {
  const [trashForms, setTrashForms] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const getTrashKey = () => `formstudio_trash_forms_${user?.uid || 'guest'}`;

  const loadTrash = () => {
    const raw = localStorage.getItem(getTrashKey());
    setTrashForms(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => {
    loadTrash();
  }, [user]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleRestore = async (form, e) => {
    e.stopPropagation();
    try {
      // Re-save form into backend database
      await saveForm(form.id, form.fields, form.title, form.description, form.status || 'draft', form.ownerUid);
      
      // Remove from localStorage trash
      const updatedTrash = trashForms.filter(t => t.id !== form.id);
      localStorage.setItem(getTrashKey(), JSON.stringify(updatedTrash));
      setTrashForms(updatedTrash);
      
      triggerToast(`Restored "${form.title}" back to active forms.`);
      onReloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Failed to restore form.");
    }
  };

  const handlePermanentDelete = (formId, title, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      const updatedTrash = trashForms.filter(t => t.id !== formId);
      localStorage.setItem(getTrashKey(), JSON.stringify(updatedTrash));
      setTrashForms(updatedTrash);
      triggerToast(`Permanently deleted "${title}".`);
    }
  };

  const handleEmptyTrash = () => {
    if (confirm("Are you sure you want to empty the trash? All forms in trash will be permanently lost.")) {
      localStorage.removeItem(getTrashKey());
      setTrashForms([]);
      triggerToast("Trash emptied.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Trash / Deleted Forms</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Restore soft-deleted form schemas or delete them permanently from your offline storage.
          </p>
        </div>
        {trashForms.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-2 border border-red-200 dark:border-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Empty Trash
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col">
        <h3 className="text-xs font-black text-slate-700 dark:text-slate-355 uppercase tracking-wider mb-4">Soft Deleted Directory</h3>
        
        {trashForms.length === 0 ? (
          <div className="text-center py-16 text-slate-450 font-medium flex flex-col items-center justify-center gap-3">
            <Trash2 size={36} className="text-slate-300 dark:text-slate-800" />
            <span>Your Trash directory is currently empty.</span>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/30">
            {trashForms.map(form => (
              <div key={form.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs font-medium">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-250">{form.title}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Deleted Draft ID: {form.id}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleRestore(form, e)}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 rounded-lg hover:scale-102 transition flex items-center gap-1 cursor-pointer font-bold"
                    title="Restore Form"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                  <button
                    onClick={(e) => handlePermanentDelete(form.id, form.title, e)}
                    className="p-2 border border-red-200 dark:border-red-950/20 bg-white dark:bg-brand-dark text-red-650 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-lg transition cursor-pointer"
                    title="Delete Permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

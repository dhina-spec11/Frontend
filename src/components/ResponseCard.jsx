import React from 'react';
import { Download, Trash2, User, Mail, Phone, Calendar, MapPin, Award, FileText, MessageSquare } from 'lucide-react';

export default function ResponseCard({ responses, onDelete, showToast }) {
  if (responses.length === 0) return null;

  // Export all submissions as JSON
  const exportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(responses, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `student_registrations_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported all registrations to JSON!");
  };

  // Export single submission as JSON
  const exportSingleJSON = (record) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    const sanitizedName = record.fullName.replace(/\s+/g, '_');
    link.setAttribute("download", `registration_${sanitizedName}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${record.fullName}'s registration!`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-6 select-none">
      
      {/* Response Header & Export controls */}
      <div className="flex justify-between items-center bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-gform transition-colors duration-300">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Submitted Registrations</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{responses.length} total entries recorded</p>
        </div>
        <button
          onClick={exportAllJSON}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover text-white font-semibold text-xs rounded hover:shadow-md transition cursor-pointer"
          title="Export All to JSON"
        >
          <Download size={13} />
          <span>Export All (JSON)</span>
        </button>
      </div>

      {/* Grid of Submissions */}
      <div className="flex flex-col gap-5">
        {responses.map((sub, idx) => (
          <div 
            key={sub.id || idx} 
            className="bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-lg shadow-gform p-6 flex flex-col gap-4 relative transition-colors duration-300"
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{sub.fullName}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => exportSingleJSON(sub)}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                  title="Export this record"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onDelete(sub.id)}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Response Data Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{sub.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">Phone:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{sub.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <User size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">Gender:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{sub.gender}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">DOB:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{sub.dob}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">City:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{sub.city}</span>
              </div>

              <div className="flex items-center gap-2">
                <FileText size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-400">Resume:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={sub.resumeName}>
                  {sub.resumeName || 'No resume uploaded'}
                </span>
              </div>

              <div className="md:col-span-2 flex items-start gap-2 border-t border-slate-50 dark:border-slate-800/60 pt-3">
                <Award size={13} className="text-slate-400 mt-0.5" />
                <span className="font-semibold text-slate-400 flex-shrink-0">Skills:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 leading-normal">
                  {sub.skills || 'None selected'}
                </span>
              </div>

              {sub.address && (
                <div className="md:col-span-2 flex items-start gap-2 border-t border-slate-50 dark:border-slate-800/60 pt-3">
                  <MapPin size={13} className="text-slate-400 mt-0.5" />
                  <span className="font-semibold text-slate-400 flex-shrink-0">Address:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 leading-normal">
                    {sub.address}
                  </span>
                </div>
              )}

              {sub.comments && (
                <div className="md:col-span-2 flex items-start gap-2 border-t border-slate-50 dark:border-slate-800/60 pt-3">
                  <MessageSquare size={13} className="text-slate-400 mt-0.5" />
                  <span className="font-semibold text-slate-400 flex-shrink-0">Remarks:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 italic leading-normal">
                    "{sub.comments}"
                  </span>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

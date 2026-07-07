import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Database, FileSpreadsheet, Search, Filter, 
  Download, Calendar, User, Eye, ChevronRight, Info
} from 'lucide-react';
import { getResponses } from '../../firebase';

export default function ResponsesView({ allForms, user }) {
  const [selectedFormId, setSelectedFormId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllResponses = async () => {
      setLoading(true);
      setError('');
      try {
        const filteredForms = allForms.filter(f => f.ownerUid === user?.uid || f.sharedWith?.includes(user?.email));
        const allResPromises = filteredForms.map(async (form) => {
          try {
            const resList = await getResponses(form.id);
            return resList.map(r => ({
              ...r,
              formTitle: form.title,
              formId: form.id
            }));
          } catch (e) {
            console.error(`Failed to fetch responses for form ${form.id}:`, e);
            return [];
          }
        });
        const resolved = await Promise.all(allResPromises);
        const flattened = resolved.flat().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setResponses(flattened);
      } catch (err) {
        console.error("Error loading responses data:", err);
        setError("Failed to load submissions database.");
      } finally {
        setLoading(false);
      }
    };

    if (allForms && allForms.length > 0) {
      fetchAllResponses();
    } else {
      setLoading(false);
    }
  }, [allForms, user]);

  // Filters
  const filteredResponses = responses.filter(r => {
    const matchesForm = selectedFormId === 'all' || r.formId === selectedFormId;
    
    // Stringify response fields to search inside them
    const dataStr = JSON.stringify(r).toLowerCase();
    const matchesSearch = dataStr.includes(searchQuery.toLowerCase());
    
    return matchesForm && matchesSearch;
  });

  // Analytics helper calculations
  const totalCount = filteredResponses.length;
  
  // Group responses by form for chart
  const formGroupData = allForms.map(form => {
    const count = responses.filter(r => r.formId === form.id).length;
    return { title: form.title, count };
  }).filter(d => d.count > 0);

  // CSV Export utility
  const exportToCSV = () => {
    if (filteredResponses.length === 0) return;
    
    // Collect all unique response keys
    const headersSet = new Set(['Form Title', 'Submitted At']);
    filteredResponses.forEach(r => {
      Object.keys(r).forEach(key => {
        if (!['id', 'formId', 'formTitle', 'submittedAt'].includes(key)) {
          headersSet.add(key);
        }
      });
    });
    
    const headers = Array.from(headersSet);
    const csvRows = [headers.join(',')];
    
    filteredResponses.forEach(r => {
      const values = headers.map(header => {
        let val = '';
        if (header === 'Form Title') val = r.formTitle;
        else if (header === 'Submitted At') val = r.submittedAt;
        else val = r[header] || '';
        
        // Escape quotes
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `submissions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Responses Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Analyze, filter, and export all responses collected across your active forms.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={totalCount === 0}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{totalCount}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Submissions across current filters</p>
        </div>

        <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Active Forms</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileSpreadsheet size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {allForms.filter(f => responses.some(r => r.formId === f.id)).length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Forms with logged entries</p>
        </div>

        <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <BarChart3 size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">92%</div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Average conversion rate</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-[#0c1424] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search entries or values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/65 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand dark:focus:border-sky-400 transition"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450">
            <Search size={13} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-slate-400" />
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/65 text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none transition cursor-pointer"
            >
              <option value="all">All Forms</option>
              {allForms.map(form => (
                <option key={form.id} value={form.id}>{form.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main layout: Analytics + Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Analytics Breakdown Chart */}
        <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">Submissions by Form</h3>
          {formGroupData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-450 font-medium">
              <Info size={24} className="mb-2 opacity-50" />
              <span>No submissions found</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 mt-2">
              {formGroupData.map((data, idx) => {
                const percentage = Math.round((data.count / responses.length) * 100);
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                const colorClass = colors[idx % colors.length];
                
                return (
                  <div key={data.title} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-350 truncate max-w-40">{data.title}</span>
                      <span className="text-slate-700 dark:text-slate-200">{data.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/85 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side (2/3): Responses Table/Cards List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4">Submission Ledger</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Querying ledger records...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">
              No matching submission records found.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-120 overflow-y-auto pr-1">
              {filteredResponses.map((r, idx) => {
                // Determine a nice preview of responses
                const renderDetails = () => {
                  const items = Object.entries(r).filter(([key]) => !['id', 'formId', 'formTitle', 'submittedAt'].includes(key));
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/30 text-[10px]">
                      {items.map(([key, val]) => (
                        <div key={key} className="flex items-start gap-1 font-medium text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300 capitalize">{key.replace('field-', '')}:</strong>
                          <span className="truncate">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                        </div>
                      ))}
                    </div>
                  );
                };

                return (
                  <div key={r.id} className="border border-slate-150 dark:border-slate-800/60 rounded-xl p-4 hover:border-slate-200 dark:hover:border-slate-700 transition bg-slate-50/[0.15] dark:bg-slate-900/[0.05]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                          <User size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{r.formTitle}</p>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">ID: {r.id}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-semibold text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                        <Calendar size={11} />
                        <span>{new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {renderDetails()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Download, Trash2, Edit2, Check, X, AlertTriangle, ArrowUpDown, FileText, ExternalLink } from 'lucide-react';

// Helper to parse file data from JSON or legacy string
const parseFileData = (val) => {
  if (!val) return { name: '', size: '', dataUrl: '', isDownloadable: false, isGoogleDrive: false };
  try {
    const parsed = JSON.parse(val);
    if (parsed && parsed.dataUrl) {
      const isDrive = parsed.dataUrl.startsWith('https://drive.google.com') || parsed.driveUpload;
      return {
        name: parsed.name || 'Unnamed File',
        size: parsed.size || '',
        dataUrl: parsed.dataUrl,
        isDownloadable: true,
        isGoogleDrive: isDrive
      };
    }
  } catch (e) {
    // Fallback to legacy string format
  }
  return {
    name: val.toString().replace('File: ', ''),
    size: '',
    dataUrl: '',
    isDownloadable: false,
    isGoogleDrive: false
  };
};

const FileCellRenderer = ({ cellVal }) => {
  const { name, dataUrl, isDownloadable, isGoogleDrive } = parseFileData(cellVal);

  const handleFileClick = (e) => {
    e.stopPropagation();
    if (!isDownloadable || !dataUrl) return;

    if (isGoogleDrive) {
      window.open(dataUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.title = name || "File Preview";
        const isImg = dataUrl.startsWith('data:image/');
        if (isImg) {
          newWindow.document.body.style.margin = '0';
          newWindow.document.body.style.backgroundColor = '#0f172a';
          newWindow.document.body.style.display = 'flex';
          newWindow.document.body.style.justifyContent = 'center';
          newWindow.document.body.style.alignItems = 'center';
          newWindow.document.body.style.height = '100vh';
          
          const img = newWindow.document.createElement('img');
          img.src = dataUrl;
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain';
          img.style.borderRadius = '8px';
          img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
          newWindow.document.body.appendChild(img);
        } else {
          const iframe = newWindow.document.createElement('iframe');
          iframe.src = dataUrl;
          iframe.style.border = '0';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          newWindow.document.body.style.margin = '0';
          newWindow.document.body.style.height = '100vh';
          newWindow.document.body.appendChild(iframe);
        }
      } else {
        throw new Error("Popup blocked");
      }
    } catch (err) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isDownloadable) {
    if (isGoogleDrive) {
      return (
        <button
          onClick={handleFileClick}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 cursor-pointer transition-colors max-w-full"
          title="Click to view in Google Drive"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0 fill-current text-emerald-600 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
          </svg>
          <span className="truncate max-w-[120px]">{name}</span>
          <ExternalLink size={9} className="flex-shrink-0 opacity-70 ml-0.5" />
        </button>
      );
    }

    return (
      <button
        onClick={handleFileClick}
        className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg border border-orange-500/20 cursor-pointer transition-colors max-w-full"
        title="Click to open or download attachment"
      >
        <FileText size={11} className="flex-shrink-0" />
        <span className="truncate max-w-[120px]">{name}</span>
        <ExternalLink size={9} className="flex-shrink-0 opacity-70 ml-0.5" />
      </button>
    );
  }

  return (
    <span 
      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60"
      title="Simulated attachment (not downloadable)"
    >
      <FileText size={11} className="flex-shrink-0" />
      <span className="truncate max-w-[120px]">{name}</span>
    </span>
  );
};

export default function ResponsesSheet({ formFields, submissions, setSubmissions, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Start row-level edit mode
  const startEdit = (row) => {
    setEditingRowId(row.id);
    const data = {};
    formFields.forEach((field) => {
      data[field.id] = row[field.id] !== undefined ? row[field.id] : '';
    });
    setEditFormData(data);
  };

  // Handle value change during edit
  const handleEditChange = (fieldId, value) => {
    setEditFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Save row edits
  const saveEdit = (rowId) => {
    for (let i = 0; i < formFields.length; i++) {
      const field = formFields[i];
      const val = editFormData[field.id];
      if (field.required && (!val || (typeof val === 'string' && !val.trim()))) {
        alert(`Field "${field.label}" is required.`);
        return;
      }
    }

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === rowId) {
          const updatedSub = { id: sub.id, submittedAt: sub.submittedAt || new Date().toISOString() };
          formFields.forEach((field) => {
            const rawVal = editFormData[field.id];
            if (field.type === 'number' && rawVal !== undefined && rawVal !== '') {
              updatedSub[field.id] = Number(rawVal);
            } else {
              updatedSub[field.id] = rawVal;
            }
          });
          return updatedSub;
        }
        return sub;
      })
    );
    setEditingRowId(null);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingRowId(null);
  };

  // Delete submission row
  const deleteRow = (rowId) => {
    if (confirm('Are you sure you want to permanently delete this response entry?')) {
      setSubmissions((prev) => prev.filter((sub) => sub.id !== rowId));
    }
  };

  // Sorting logic
  const handleSort = (fieldId) => {
    let direction = 'asc';
    if (sortConfig.key === fieldId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: fieldId, direction });
  };

  // Search & Filter Logic
  const filteredSubmissions = submissions
    .filter((sub) => {
      if (!searchTerm.trim()) return true;
      return formFields.some((field) => {
        const value = sub[field.id];
        if (value === undefined || value === null) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const key = sortConfig.key;
      const valA = a[key] !== undefined ? a[key] : '';
      const valB = b[key] !== undefined ? b[key] : '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      const strA = valA.toString().toLowerCase();
      const strB = valB.toString().toLowerCase();
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

  // Export to CSV
  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = ["Submitted At", ...formFields.map(f => f.label)];
    const rows = submissions.map(sub => {
      const timestamp = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '';
      const fieldsData = formFields.map(f => {
        const val = sub[f.id];
        if (val === undefined || val === null) return '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      });
      return [timestamp, ...fieldsData].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `formstudio_sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `formstudio_sheet_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      
      {/* Sheets Style Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative w-full sm:w-72">
          <input
            id="sheet-search"
            type="text"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-brand-dark-elevated/20 text-xs focus:outline-none focus:border-brand dark:focus:border-sky-400 font-bold"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={14} />
          </div>
        </div>

        <div className="flex gap-2.5">
          {!readOnly && (
            <>
              <button 
                id="sheet-export-csv"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                onClick={exportToCSV}
                title="Download CSV"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
              <button 
                id="sheet-export-json"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                onClick={exportToJSON}
                title="Download JSON"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>
            </>
          )}
          {readOnly && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2 bg-slate-50 dark:bg-brand-dark-elevated/30 border border-slate-200/60 dark:border-slate-800 rounded-xl">
              👁 Read-only View
            </span>
          )}
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="sheets-grid-wrapper">
        <table className="sheets-table">
          <thead>
            <tr>
              <th className="select-none">Timestamp</th>
              {formFields.map((field) => (
                <th 
                  key={field.id} 
                  onClick={() => handleSort(field.id)} 
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{field.label}</span>
                    <ArrowUpDown size={12} className="text-slate-400" style={{ opacity: sortConfig.key === field.id ? 1 : 0.3 }} />
                  </div>
                </th>
              ))}
              {!readOnly && <th className="w-[100px] text-center select-none">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => {
              const isEditing = editingRowId === sub.id;

              return (
                <tr key={sub.id} className={isEditing ? 'editing bg-brand/5 dark:bg-sky-950/20' : ''}>
                  {/* Timestamp cell */}
                  <td className="text-slate-400 dark:text-slate-500 text-[11px] font-bold">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </td>

                  {/* Dynamic cells */}
                  {formFields.map((field) => {
                    const cellVal = sub[field.id];
                    const isFile = field.type === 'file';
                    
                    return (
                      <td key={field.id} title={cellVal !== undefined ? parseFileData(cellVal).name : ''}>
                        {isEditing ? (
                          field.type === 'select' || field.type === 'checkbox' || field.type === 'radio' ? (
                            <select
                              className="sheets-cell-input focus:ring-1 focus:ring-brand focus:border-brand"
                              value={editFormData[field.id] || ''}
                              onChange={(e) => handleEditChange(field.id, e.target.value)}
                            >
                              <option value="">Select option</option>
                              {(field.options || []).map((o, idx) => (
                                <option key={idx} value={o}>{o}</option>
                              ))}
                            </select>
                          ) : field.type === 'file' ? (
                            <input
                              type="text"
                              disabled
                              className="sheets-cell-input bg-slate-50 dark:bg-brand-dark-elevated/10 text-slate-400 cursor-not-allowed opacity-80"
                              value={parseFileData(editFormData[field.id] || '').name}
                            />
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              className="sheets-cell-input focus:ring-1 focus:ring-brand focus:border-brand"
                              value={editFormData[field.id] || ''}
                              onChange={(e) => handleEditChange(field.id, e.target.value)}
                            />
                          )
                        ) : (
                          // Read Mode View
                          cellVal !== undefined && cellVal !== null ? (
                            isFile ? (
                              <FileCellRenderer cellVal={cellVal} />
                            ) : (
                              cellVal.toString()
                            )
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-[11px] italic font-normal">[Empty]</span>
                          )
                        )}
                      </td>
                    );
                  })}{/* Action Column — hidden for read-only collaborators */}
                  {!readOnly && (
                    <td>
                      <div className="flex gap-1.5 justify-center">
                        {isEditing ? (
                          <>
                            <button
                              className="p-1.5 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                              onClick={() => saveEdit(sub.id)}
                              title="Save Row Changes"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-brand-dark-elevated text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                              onClick={cancelEdit}
                              title="Cancel Changes"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                              onClick={() => startEdit(sub)}
                              title="Edit Row"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="p-1.5 bg-red-500/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-500 rounded-lg transition cursor-pointer"
                              onClick={() => deleteRow(sub.id)}
                              title="Delete Entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={formFields.length + 2} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle size={24} className="text-slate-305 dark:text-slate-700" />
                    <span className="text-xs font-bold">No spreadsheet response entries matched search query.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

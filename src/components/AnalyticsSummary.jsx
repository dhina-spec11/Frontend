import React, { useState } from 'react';
import { BarChart3, Database, AlertCircle, Calendar, Mail, Phone, FileText, ExternalLink } from 'lucide-react';

const colors = [
  '#3B82F6', // Brand Blue
  '#EC4899', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F43F5E', // Rose-Red
];

const DonutChart = ({ shares }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const totalCount = shares.reduce((acc, s) => acc + s.count, 0);
  
  if (totalCount === 0) {
    return <span className="text-xs text-slate-400 italic">No option entries logged.</span>;
  }

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
      {/* SVG Donut */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full transform transition-transform duration-300">
          {/* Base background circle */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="transparent"
            stroke="var(--color-border-chart, #e2e8f0)"
            className="stroke-slate-100 dark:stroke-slate-800/60"
            strokeWidth="10"
          />
          {/* Dynamic segments */}
          {shares.map((share, idx) => {
            const percentage = share.percentage;
            if (percentage === 0) return null;
            
            const strokeDasharray = `${(percentage / 100) * 251.327} 251.327`;
            const strokeDashoffset = - (accumulatedPercent / 100) * 251.327;
            accumulatedPercent += percentage;

            const isHovered = hoveredIdx === idx;
            const color = colors[idx % colors.length];

            return (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r="40"
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? "14" : "10"}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  opacity: hoveredIdx === null || isHovered ? 1 : 0.6,
                  filter: isHovered ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' : 'none'
                }}
              />
            );
          })}
        </svg>
        {/* Central Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Total</span>
          <span className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">{totalCount}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 flex flex-col gap-2 w-full">
        {shares.map((share, idx) => {
          const color = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs transition-all duration-200 p-1.5 rounded-xl border border-transparent"
              style={{
                backgroundColor: isHovered ? 'rgba(0,0,0,0.03)' : 'transparent',
                borderColor: isHovered ? 'rgba(0,0,0,0.05)' : 'transparent',
                opacity: hoveredIdx === null || isHovered ? 1 : 0.6
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={share.label}>
                  {share.label}
                </span>
              </div>
              <span className="font-bold text-slate-400 dark:text-slate-500 text-[11px] whitespace-nowrap">
                {share.count} ({share.percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};export default function AnalyticsSummary({ formFields, submissions }) {
  const totalSubmissions = submissions.length;

  // Numerical Stats Calculator
  const getNumericStats = (fieldId) => {
    const values = submissions
      .map((sub) => Number(sub[fieldId]))
      .filter((val) => !isNaN(val) && val !== null && val !== undefined);

    if (values.length === 0) return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { sum, avg, min, max, count: values.length };
  };

  // Option Distribution Calculator (Select, Radio, Checkbox)
  const getOptionStats = (field) => {
    const options = field.options || [];
    const counts = {};
    options.forEach((opt) => {
      counts[opt] = 0;
    });

    let totalAnswers = 0;

    submissions.forEach((sub) => {
      const val = sub[field.id];
      if (!val) return;

      if (field.type === 'checkbox') {
        const selectedOptions = val.split(', ');
        selectedOptions.forEach((opt) => {
          if (counts[opt] !== undefined) {
            counts[opt] += 1;
            totalAnswers += 1;
          }
        });
      } else {
        if (counts[val] !== undefined) {
          counts[val] += 1;
          totalAnswers += 1;
        }
      }
    });

    return options.map((opt) => {
      const count = counts[opt];
      const percentage = totalAnswers > 0 ? (count / totalSubmissions) * 100 : 0;
      return { label: opt, count, percentage };
    }).sort((a, b) => b.count - a.count);
  };

  // Text / Input list getter
  const getTextResponses = (fieldId) => {
    return submissions
      .map((sub) => sub[fieldId])
      .filter((val) => val && val.toString().trim() !== '');
  };

  const formatCurrency = (val, fieldLabel) => {
    const labelLower = fieldLabel.toLowerCase();
    if (labelLower.includes('price') || labelLower.includes('cost') || labelLower.includes('value') || labelLower.includes('valuation')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col gap-6 font-medium animate-fade-in">
      
      {/* Top Summary Card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 bg-brand/10 dark:bg-brand/20 text-brand rounded-xl flex items-center justify-center">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-none text-slate-800 dark:text-white">{totalSubmissions}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1.5 font-bold">
            Total recorded response entries
          </p>
        </div>
      </div>

      {totalSubmissions === 0 ? (
        <div className="bg-white/40 dark:bg-brand-dark/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
          <AlertCircle size={32} className="text-slate-305 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No responses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
            Open the live intake page, submit a response, and return here to analyze the dataset.
          </p>
        </div>
      ) : (
        /* Analytics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formFields.map((field) => {
            const isNumeric = field.type === 'number';
            const isOption = ['select', 'radio', 'checkbox'].includes(field.type);
            const isText = ['text', 'paragraph'].includes(field.type);
            const isDate = field.type === 'date';
            const isContact = ['email', 'phone'].includes(field.type);
            const isFile = field.type === 'file';

            return (
              <div key={field.id} className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col gap-4">
                
                {/* Field Label */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={field.label}>{field.label}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-brand-dark-elevated/30 px-2 py-0.5 rounded-lg border border-slate-200/30">
                    {field.type}
                  </span>
                </div>

                {/* NUMERIC STATS */}
                {isNumeric && (() => {
                  const stats = getNumericStats(field.id);
                  return (
                    <div className="grid grid-cols-2 gap-3.5 mt-1">
                      <div className="bg-slate-50/50 dark:bg-brand-dark-elevated/15 p-3 rounded-xl border border-slate-100/40 dark:border-slate-800/50">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Total Sum</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-1">{formatCurrency(stats.sum, field.label)}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-brand-dark-elevated/15 p-3 rounded-xl border border-slate-100/40 dark:border-slate-800/50">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Average</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-1">{formatCurrency(stats.avg, field.label)}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-brand-dark-elevated/15 p-3 rounded-xl border border-slate-100/40 dark:border-slate-800/50">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Minimum</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 block mt-1">{formatCurrency(stats.min, field.label)}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-brand-dark-elevated/15 p-3 rounded-xl border border-slate-100/40 dark:border-slate-800/50">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Maximum</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 block mt-1">{formatCurrency(stats.max, field.label)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* OPTION SHARES DONUT CHART */}
                {isOption && (() => {
                  const shares = getOptionStats(field);
                  return <DonutChart shares={shares} />;
                })()}

                {/* TEXT LISTINGS */}
                {isText && (() => {
                  const texts = getTextResponses(field.id);
                  return (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mt-1 pr-1">
                      {texts.map((txt, idx) => (
                        <div key={idx} className="text-xs bg-slate-50 dark:bg-brand-dark-elevated/25 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed break-words font-semibold">
                          {txt}
                        </div>
                      ))}
                      {texts.length === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">No entries logged.</span>
                      )}
                    </div>
                  );
                })()}

                {/* CONTACT DETAILS LISTING (Email & Phone) */}
                {isContact && (() => {
                  const contacts = getTextResponses(field.id);
                  return (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mt-1 pr-1">
                      {contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs bg-slate-50/70 dark:bg-brand-dark-elevated/20 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 font-semibold">
                          {field.type === 'email' ? (
                            <Mail size={13} className="text-teal-500 flex-shrink-0" />
                          ) : (
                            <Phone size={13} className="text-green-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{contact}</span>
                        </div>
                      ))}
                      {contacts.length === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">No contact details logged.</span>
                      )}
                    </div>
                  );
                })()}

                {/* DATE DETAILS LISTING */}
                {isDate && (() => {
                  const dates = getTextResponses(field.id);
                  return (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mt-1 pr-1">
                      {dates.map((dt, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs bg-slate-50/70 dark:bg-brand-dark-elevated/20 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 font-bold">
                          <Calendar size={13} className="text-brand flex-shrink-0" />
                          <span>{new Date(dt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      ))}
                      {dates.length === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">No date entries recorded.</span>
                      )}
                    </div>
                  );
                })()}
                {/* FILE ATTACHMENTS DIRECTORY */}
                {isFile && (() => {
                  const files = getTextResponses(field.id);
                  return (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mt-1 pr-1">
                      {files.map((fileStr, idx) => {
                        let fileUrl = '';
                        let fileName = fileStr;
                        let isDownloadable = false;
                        let isGoogleDrive = false;

                        try {
                          const parsed = JSON.parse(fileStr);
                          if (parsed && parsed.dataUrl) {
                            fileUrl = parsed.dataUrl;
                            fileName = parsed.name;
                            isDownloadable = true;
                            isGoogleDrive = parsed.dataUrl.startsWith('https://drive.google.com') || parsed.driveUpload;
                          }
                        } catch (e) {
                          fileName = fileStr.replace('File: ', '');
                        }

                        const handleFileClick = () => {
                          if (!isDownloadable || !fileUrl) return;
                          
                          if (isGoogleDrive) {
                            window.open(fileUrl, '_blank', 'noopener,noreferrer');
                            return;
                          }

                          try {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.title = fileName || "File Preview";
                              const isImg = fileUrl.startsWith('data:image/');
                              if (isImg) {
                                newWindow.document.body.style.margin = '0';
                                newWindow.document.body.style.backgroundColor = '#0f172a';
                                newWindow.document.body.style.display = 'flex';
                                newWindow.document.body.style.justifyContent = 'center';
                                newWindow.document.body.style.alignItems = 'center';
                                newWindow.document.body.style.height = '100vh';
                                
                                const img = newWindow.document.createElement('img');
                                img.src = fileUrl;
                                img.style.maxWidth = '100%';
                                img.style.maxHeight = '100%';
                                img.style.objectFit = 'contain';
                                img.style.borderRadius = '8px';
                                img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                                newWindow.document.body.appendChild(img);
                              } else {
                                const iframe = newWindow.document.createElement('iframe');
                                iframe.src = fileUrl;
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
                            link.href = fileUrl;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        };

                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between text-xs p-3 rounded-xl border ${
                              isGoogleDrive 
                                ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/15 text-slate-700 dark:text-slate-300' 
                                : 'bg-orange-500/5 dark:bg-orange-950/10 border-orange-500/15 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isGoogleDrive ? (
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0 fill-current text-emerald-600 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
                                </svg>
                              ) : (
                                <FileText size={13} className="text-orange-500 flex-shrink-0" />
                              )}
                              {isDownloadable ? (
                                <button
                                  onClick={handleFileClick}
                                  className={`font-bold truncate max-w-[150px] hover:underline text-left cursor-pointer transition-colors ${
                                    isGoogleDrive ? 'hover:text-emerald-500' : 'hover:text-orange-500'
                                  }`}
                                  title={isGoogleDrive ? "Click to view in Google Drive" : "Click to open or download attachment"}
                                >
                                  {fileName}
                                </button>
                              ) : (
                                <span className="font-bold truncate max-w-[150px]">{fileName}</span>
                              )}
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-lg select-none ${
                              isGoogleDrive 
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/10' 
                                : 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/10'
                            }`}>
                              {isGoogleDrive ? 'Google Drive' : 'Attachment'}
                            </span>
                          </div>
                        );
                      })}
                      {files.length === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">No attachments submitted.</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

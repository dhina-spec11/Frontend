import React from 'react';
import { BarChart3, Database, AlertCircle, Calendar, Mail, Phone, FileText } from 'lucide-react';

export default function AnalyticsSummary({ formFields, submissions }) {
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
        <div className="w-12 h-12 bg-brand/10 dark:bg-sky-950/20 text-brand dark:text-sky-400 rounded-xl flex items-center justify-center">
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

                {/* OPTION SHARES PROGRESS BAR */}
                {isOption && (() => {
                  const shares = getOptionStats(field);
                  return (
                    <div className="flex flex-col gap-3 mt-1 text-xs">
                      {shares.map((share, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                            <span className="truncate max-w-[200px]">{share.label}</span>
                            <span className="text-slate-400">{share.count} reps ({share.percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-350"
                              style={{ 
                                width: `${share.percentage}%`,
                                background: idx === 0 ? 'var(--color-brand)' : idx === 1 ? 'var(--color-accent-rose)' : idx === 2 ? '#f59e0b' : 'var(--color-accent-emerald)'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
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
                          <Calendar size={13} className="text-brand dark:text-sky-400 flex-shrink-0" />
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
                        const displayStr = fileStr.replace('File: ', '');
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs bg-orange-500/5 dark:bg-orange-950/10 border border-orange-500/15 p-3 rounded-xl text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={13} className="text-orange-500 flex-shrink-0" />
                              <span className="font-bold truncate max-w-[150px]">{displayStr}</span>
                            </div>
                            <span className="text-[9px] text-orange-600 dark:text-orange-400 font-extrabold uppercase bg-orange-500/10 border border-orange-500/10 px-2 py-0.5 rounded-lg select-none">
                              Attachment
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

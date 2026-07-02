import React, { useState, useRef } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  AlertCircle, 
  UploadCloud, 
  FileText, 
  X, 
  Check, 
  Phone, 
  Mail, 
  Calendar 
} from 'lucide-react';
import FormBanner from './FormBanner';

const themeStyles = {
  glassmorphism: {
    container: "relative w-full overflow-hidden p-8 rounded-3xl min-h-[500px] z-10 transition-colors duration-300",
    card: "backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-800/40 shadow-xl rounded-2xl p-7 transition-all duration-300",
    headerCard: "backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-white/25 dark:border-slate-800/50 border-t-[8px] border-t-[var(--accent-color)] shadow-xl rounded-2xl p-7 transition-all duration-300",
    input: "w-full text-xs bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all font-semibold",
    button: "px-6 py-3 bg-[var(--accent-color)] hover:opacity-90 active:scale-95 text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer",
    clearButton: "px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition hover:bg-slate-100",
    text: "text-slate-800 dark:text-slate-100",
    textSecondary: "text-slate-500 dark:text-slate-400",
    label: "text-xs font-bold text-slate-800 dark:text-slate-200"
  },
  'elegant-dark': {
    container: "relative w-full bg-[#0a0f1d] p-8 rounded-3xl min-h-[500px] text-slate-100 z-10 transition-colors duration-300",
    card: "bg-[#111a2e]/90 border border-slate-800/80 shadow-2xl rounded-2xl p-7 transition-all duration-300",
    headerCard: "bg-[#111a2e] border border-slate-800 border-t-[8px] border-t-[var(--accent-color)] shadow-2xl rounded-2xl p-7 transition-all duration-300",
    input: "w-full text-xs bg-[#090d17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all font-semibold",
    button: "px-6 py-3 bg-[var(--accent-color)] hover:opacity-90 active:scale-95 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-blue-500/10 cursor-pointer",
    clearButton: "px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-355 text-xs font-bold rounded-xl cursor-pointer transition",
    text: "text-slate-100",
    textSecondary: "text-slate-400",
    label: "text-xs font-bold text-slate-200"
  },
  minimalist: {
    container: "w-full bg-[#fafafa] dark:bg-[#121212] p-8 rounded-none min-h-[500px] z-10 transition-colors duration-300",
    card: "bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-none p-7 shadow-none transition-all duration-300",
    headerCard: "bg-white dark:bg-black border border-slate-300 dark:border-slate-750 border-t-2 border-t-[var(--accent-color)] rounded-none p-7 shadow-none transition-all duration-300",
    input: "w-full text-xs bg-transparent border border-slate-300 dark:border-slate-700 rounded-none px-3 py-2.5 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[var(--accent-color)] focus:ring-0 transition-all font-semibold",
    button: "px-6 py-3 bg-[var(--accent-color)] hover:opacity-95 active:scale-100 text-white font-bold rounded-none text-xs transition shadow-none cursor-pointer",
    clearButton: "px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-none cursor-pointer transition hover:bg-slate-50",
    text: "text-slate-900 dark:text-slate-50",
    textSecondary: "text-slate-500 dark:text-slate-400",
    label: "text-xs font-bold text-slate-900 dark:text-slate-100"
  },
  cyberpunk: {
    container: "relative w-full bg-[#05010d] p-8 rounded-2xl min-h-[500px] border border-pink-500/20 z-10 transition-colors duration-300",
    card: "bg-[#0b0318] border border-cyan-500/30 dark:border-[#00ffcc]/30 shadow-[0_0_15px_rgba(0,255,204,0.03)] rounded-lg p-7 transition-all duration-300",
    headerCard: "bg-[#0b0318] border-2 border-cyan-400 dark:border-[#00ffcc] border-t-[8px] border-t-[var(--accent-color)] shadow-[0_0_20px_rgba(0,255,204,0.1)] rounded-lg p-7 transition-all duration-300",
    input: "w-full text-xs bg-black border border-cyan-500/60 rounded-md px-3.5 py-2.5 text-cyan-400 placeholder-cyan-700 font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-semibold",
    button: "px-6 py-3 bg-cyan-500 dark:bg-[#00ffcc] text-black font-mono font-black rounded-md text-xs tracking-wider transition uppercase hover:bg-pink-550 hover:text-white shadow-[0_0_10px_rgba(0,255,204,0.2)] cursor-pointer",
    clearButton: "px-4 py-2 border border-cyan-500/30 text-cyan-550 hover:text-cyan-400 font-mono text-xs font-bold rounded-md cursor-pointer transition",
    text: "text-cyan-400 font-mono",
    textSecondary: "text-cyan-650 font-mono",
    label: "text-xs font-black text-cyan-300 uppercase font-mono"
  },
  'warm-sunset': {
    container: "w-full bg-gradient-to-tr from-amber-50/70 to-rose-50/70 dark:from-[#1d1212] dark:to-[#2b1723] p-8 rounded-3xl min-h-[500px] z-10 transition-colors duration-300",
    card: "bg-white/95 dark:bg-[#20171a]/95 border border-amber-200/50 dark:border-rose-950/50 shadow-md rounded-2xl p-7 transition-all duration-300",
    headerCard: "bg-white/95 dark:bg-[#20171a]/95 border border-amber-250 dark:border-rose-950 border-t-8 border-t-[var(--accent-color)] shadow-md rounded-2xl p-7 transition-all duration-300",
    input: "w-full text-xs bg-amber-50/30 dark:bg-[#181113] border border-amber-200/80 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all font-semibold",
    button: "px-6 py-3 bg-[var(--accent-color)] hover:opacity-90 active:scale-95 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-amber-500/10 cursor-pointer",
    clearButton: "px-4 py-2 border border-amber-200 dark:border-rose-950 bg-amber-100/30 hover:bg-amber-100/50 text-slate-700 dark:text-rose-200 text-xs font-bold rounded-xl cursor-pointer transition",
    text: "text-slate-800 dark:text-slate-100",
    textSecondary: "text-slate-550 dark:text-rose-300/80",
    label: "text-xs font-bold text-amber-900 dark:text-rose-200"
  }
};

const getFontFamily = (font) => {
  switch (font) {
    case 'Outfit': return "'Outfit', sans-serif";
    case 'Inter': return "'Inter', sans-serif";
    case 'Space Grotesk': return "'Space Grotesk', sans-serif";
    case 'Playfair Display': return "'Playfair Display', serif";
    case 'Plus Jakarta Sans': return "'Plus Jakarta Sans', sans-serif";
    default: return "'Inter', sans-serif";
  }
};

const accentColors = {
  brand: '#2563EB',
  emerald: '#10B981',
  violet: '#8B5CF6',
  rose: '#F43F5E',
  sky: '#0EA5E9',
  amber: '#F59E0B'
};

export default function FormIntake({ 
  formTitle, 
  formDescription, 
  formFields, 
  onSubmit, 
  isSubmitting,
  isPreview = false,
  themeConfig = { theme: 'glassmorphism', font: 'Outfit', accent: 'brand' }
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // File Upload states for each field: { [fieldId]: { progress: 0, status: 'idle', fileName: '', fileSize: '' } }
  const [fileStates, setFileStates] = useState({});
  const fileInputRefs = useRef({});

  const themeStyle = themeStyles[themeConfig?.theme] || themeStyles.glassmorphism;
  const selectedAccent = accentColors[themeConfig?.accent] || '#2563EB';

  // Handle value inputs
  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  // Handle checkboxes multi-select
  const handleCheckboxChange = (fieldId, option, isChecked) => {
    const currentList = formData[fieldId] || [];
    let updated;
    if (isChecked) {
      updated = [...currentList, option];
    } else {
      updated = currentList.filter((item) => item !== option);
    }
    handleInputChange(fieldId, updated);
  };

  // Simulated File Upload handler
  const handleFileChange = (fieldId, file) => {
    if (!file) return;
    
    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [fieldId]: "File exceeds 10MB size limit." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const fileData = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        dataUrl: base64Data
      };

      // Initialize file states
      setFileStates(prev => ({
        ...prev,
        [fieldId]: {
          progress: 0,
          status: 'uploading',
          fileName: file.name,
          fileSize: fileData.size,
          previewUrl: file.type.startsWith('image/') ? base64Data : null
        }
      }));
      setErrors(prev => ({ ...prev, [fieldId]: null }));

      // Simulate upload progress over 2 seconds
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setFileStates(prev => {
          const fieldState = prev[fieldId] || {};
          if (currentProgress >= 100) {
            clearInterval(interval);
            // Set form value to file description string
            handleInputChange(fieldId, JSON.stringify(fileData));
            return {
              ...prev,
              [fieldId]: {
                ...fieldState,
                progress: 100,
                status: 'completed'
              }
            };
          }
          return {
            ...prev,
            [fieldId]: {
              ...fieldState,
              progress: currentProgress
            }
          };
        });
      }, 150);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (fieldId) => {
    setFileStates(prev => ({
      ...prev,
      [fieldId]: {
        progress: 0,
        status: 'idle',
        fileName: '',
        fileSize: ''
      }
    }));
    handleInputChange(fieldId, null);
    if (fileInputRefs.current[fieldId]) {
      fileInputRefs.current[fieldId].value = '';
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    formFields.forEach((field) => {
      const val = formData[field.id];

      // Required verification
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!val || val.length === 0) {
            newErrors[field.id] = 'This is a required question';
            return;
          }
        } else if (field.type === 'file') {
          const fileState = fileStates[field.id];
          if (!fileState || fileState.status !== 'completed') {
            newErrors[field.id] = 'Please upload the required file attachment';
            return;
          }
        } else if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
          newErrors[field.id] = 'This is a required question';
          return;
        }
      }

      // Check number correctness
      if (field.type === 'number' && val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (isNaN(num)) {
          newErrors[field.id] = 'Must be a valid number';
        }
      }

      // Email address syntax check
      if (field.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          newErrors[field.id] = 'Must be a valid email address';
        }
      }

      // Phone number syntax check
      if (field.type === 'phone' && val) {
        const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
        if (!phoneRegex.test(val)) {
          newErrors[field.id] = 'Must be a valid phone number (min 7 digits)';
        }
      }

      // Date limits check
      if (field.type === 'date' && val) {
        if (field.minDate && val < field.minDate) {
          newErrors[field.id] = `Date must be on or after ${field.minDate}`;
        }
        if (field.maxDate && val > field.maxDate) {
          newErrors[field.id] = `Date must be on or before ${field.maxDate}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Find first error and scroll to it
      const firstErrKey = Object.keys(errors)[0] || formFields.find(f => !formData[f.id] && f.required)?.id;
      if (firstErrKey) {
        const el = document.getElementById(`intake-card-${firstErrKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Convert arrays of checkboxes to comma-separated string
    const finalPayload = {};
    formFields.forEach((field) => {
      const val = formData[field.id];
      if (field.type === 'checkbox') {
        finalPayload[field.id] = val ? val.join(', ') : '';
      } else if (field.type === 'number') {
        finalPayload[field.id] = val !== '' && val !== undefined ? Number(val) : '';
      } else {
        finalPayload[field.id] = val || '';
      }
    });

    if (isPreview) {
      alert("Sandbox Preview Mode: Response verified but not saved to the database. To submit real entries, click 'Live Form' in the top right of your builder header.");
      return;
    }

    try {
      await onSubmit(finalPayload);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
    setFileStates({});
    setIsSubmitted(false);
  };

  // Post Submission Screen
  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-10 border-t-8 border-t-brand dark:border-t-sky-600 shadow-lg flex flex-col gap-4 text-center items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 animate-bounce">
            <ClipboardCheck size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{formTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            Thank you! Your intake responses have been successfully logged in our systems database.
          </p>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/80 my-3" />
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition active:scale-98"
          >
            <Sparkles size={13} />
            <span>Submit Another Entry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ fontFamily: getFontFamily(themeConfig?.font), '--accent-color': selectedAccent }} 
      className={`${themeStyle.container}`}
    >
      {/* Background blobs for Glassmorphism theme */}
      {themeConfig?.theme === 'glassmorphism' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <div className="absolute top-12 left-10 w-48 h-48 rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-12 right-10 w-64 h-64 rounded-full bg-purple-400/20 dark:bg-purple-500/10 blur-3xl" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-medium animate-fade-in relative z-10">
        
        {/* Header Banner Image (Google Forms style) */}
        <FormBanner imageUrl={themeConfig?.bannerImage} themeConfig={themeConfig} />

        {/* Header Info Card */}
        <div className={themeStyle.headerCard}>
          <h1 className={`text-2xl font-black leading-tight ${themeStyle.text}`}>{formTitle}</h1>
          {formDescription && (
            <p className={`text-xs leading-relaxed mt-2.5 font-medium ${themeStyle.textSecondary}`}>
              {formDescription}
            </p>
          )}
          <div className="text-[9px] text-red-505 font-extrabold mt-3.5 border-t border-slate-200/50 dark:border-slate-800/80 pt-4 uppercase tracking-widest">
            * Required Field
          </div>
        </div>

        {/* Dynamic Fields Grid */}
        {formFields.map((field) => {
          const error = errors[field.id];
          const val = formData[field.id];
          const fileState = fileStates[field.id] || { progress: 0, status: 'idle', fileName: '', fileSize: '' };

          return (
            <div 
              key={field.id}
              id={`intake-card-${field.id}`}
              className={`${themeStyle.card} ${
                error 
                  ? 'border-red-400 dark:border-red-550 border-l-6 border-l-red-500 shadow-md' 
                  : 'focus-within:border-l-6 focus-within:border-l-[var(--accent-color)] focus-within:shadow-md'
              }`}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor={`input-${field.id}`} className={`${themeStyle.label} flex items-center gap-1 leading-tight`}>
                  <span>{field.label}</span>
                  {field.required && <span className="text-red-500" aria-hidden="true">*</span>}
                </label>
              </div>

              {/* Inputs logic */}
              <div className="mt-1">
                
                {/* Short Answer */}
                {field.type === 'text' && (
                  <input
                    id={`input-${field.id}`}
                    type="text"
                    placeholder="Your answer"
                    value={val || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={themeStyle.input}
                  />
                )}

                {/* Paragraph Textarea */}
                {field.type === 'paragraph' && (
                  <textarea
                    id={`input-${field.id}`}
                    placeholder="Your answer"
                    value={val || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    rows={3}
                    className={themeStyle.input}
                  />
                )}

                {/* Number Input */}
                {field.type === 'number' && (
                  <input
                    id={`input-${field.id}`}
                    type="number"
                    placeholder="0"
                    value={val !== undefined ? val : ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={themeStyle.input}
                  />
                )}

                {/* Email Input */}
                {field.type === 'email' && (
                  <div className="relative">
                    <input
                      id={`input-${field.id}`}
                      type="email"
                      placeholder="name@domain.com"
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`${themeStyle.input} pl-9`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={13} />
                    </div>
                  </div>
                )}

                {/* Phone Input */}
                {field.type === 'phone' && (
                  <div className="relative">
                    <input
                      id={`input-${field.id}`}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`${themeStyle.input} pl-9`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={13} />
                    </div>
                  </div>
                )}

                {/* Date Input */}
                {field.type === 'date' && (
                  <div className="relative w-full max-w-xs">
                    <input
                      id={`input-${field.id}`}
                      type="date"
                      min={field.minDate}
                      max={field.maxDate}
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`${themeStyle.input} pl-9`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={13} />
                    </div>
                  </div>
                )}

                {/* Select Dropdown */}
                {field.type === 'select' && (
                  <select
                    id={`input-${field.id}`}
                    value={val || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={themeStyle.input}
                  >
                    <option value="">Select option</option>
                    {(field.options || []).map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* Radio choices */}
                {field.type === 'radio' && (
                  <div className="flex flex-col gap-3 mt-1.5">
                    {(field.options || []).map((opt, oIdx) => {
                      const isChecked = val === opt;
                      return (
                        <label key={oIdx} className={`flex items-center gap-3 cursor-pointer text-xs select-none ${themeStyle.text}`}>
                          <input
                             type="radio"
                             name={`radio-${field.id}`}
                             checked={isChecked}
                             onChange={() => handleInputChange(field.id, opt)}
                             style={{ accentColor: 'var(--accent-color)' }}
                             className="w-4.5 h-4.5 cursor-pointer focus:outline-none"
                           />
                          <span className="font-semibold">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Checkboxes */}
                {field.type === 'checkbox' && (
                  <div className="flex flex-col gap-3 mt-1.5">
                    {(field.options || []).map((opt, oIdx) => {
                      const isChecked = (val || []).includes(opt);
                      return (
                        <label key={oIdx} className={`flex items-center gap-3 cursor-pointer text-xs select-none ${themeStyle.text}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                            style={{ accentColor: 'var(--accent-color)' }}
                            className="w-4.5 h-4.5 cursor-pointer rounded-lg focus:outline-none"
                          />
                          <span className="font-semibold">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* File Upload Attachment */}
                {field.type === 'file' && (
                  <div className="flex flex-col gap-3 mt-1">
                    {fileState.status === 'idle' && (
                      <div 
                        onClick={() => fileInputRefs.current[field.id]?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[var(--accent-color)] dark:hover:border-[var(--accent-color)] rounded-2xl p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
                      >
                        <UploadCloud size={28} className="text-slate-400 group-hover:text-[var(--accent-color)] transition-colors" />
                        <span className={`text-xs font-bold ${themeStyle.text}`}>Click or Drag file to upload</span>
                        <span className="text-[10px] text-slate-400">Maximum allowed file size: 10MB</span>
                        <input 
                          ref={el => fileInputRefs.current[field.id] = el}
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                        />
                      </div>
                    )}

                    {/* Uploading progress tracker */}
                    {fileState.status === 'uploading' && (
                      <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1.5 truncate max-w-[250px]">
                            <FileText size={13} style={{ color: 'var(--accent-color)' }} />
                            <span className="truncate">{fileState.fileName}</span>
                          </span>
                          <span>{fileState.progress}%</span>
                        </div>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-150"
                            style={{ width: `${fileState.progress}%`, backgroundColor: 'var(--accent-color)' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload completed screen */}
                    {fileState.status === 'completed' && (
                      <div className="border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {fileState.previewUrl ? (
                            <img 
                              src={fileState.previewUrl} 
                              alt="Uploaded file preview" 
                              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20 bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <Check size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{fileState.fileName}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{fileState.fileSize} · Upload Complete</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(field.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                          title="Remove file attachment"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Error alerts */}
              {error && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-450 font-bold mt-1.5 animate-pulse" role="alert">
                  <AlertCircle size={13} />
                  <span>{error}</span>
                </div>
              )}

            </div>
          );
        })}

        {/* Buttons bar */}
        <div className="flex justify-between items-center mt-5 border-t border-slate-200/50 dark:border-slate-800/80 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={themeStyle.button}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting responses...</span>
              </>
            ) : (
              <span>Submit Entry</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={themeStyle.clearButton}
          >
            Clear Fields
          </button>
        </div>

      </form>
    </div>
  );;
}

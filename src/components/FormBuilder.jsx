import React, { useState } from 'react';
import { 
  Trash2, 
  PlusCircle, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  GripHorizontal,
  Settings,
  FolderSync,
  Mail,
  Phone,
  UploadCloud,
  FileText,
  Calendar,
  List,
  CheckSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function FormBuilder({ 
  formFields, 
  setFormFields, 
  formTitle, 
  setFormTitle, 
  formDescription, 
  setFormDescription, 
  formTheme,
  setFormTheme,
  onSave, 
  isSaving,
  loadTemplate 
}) {
  const [activeFieldId, setActiveFieldId] = useState('header');
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Field type helper to render nice icons in config
  const getFieldIcon = (type) => {
    switch (type) {
      case 'text': return <FileText size={14} className="text-blue-500" />;
      case 'paragraph': return <FileText size={14} className="text-sky-500" />;
      case 'number': return <HelpCircle size={14} className="text-yellow-500" />;
      case 'email': return <Mail size={14} className="text-teal-500" />;
      case 'phone': return <Phone size={14} className="text-green-500" />;
      case 'select': return <List size={14} className="text-sky-500" />;
      case 'radio': return <List size={14} className="text-rose-500" />;
      case 'checkbox': return <CheckSquare size={14} className="text-emerald-500" />;
      case 'date': return <Calendar size={14} className="text-cyan-500" />;
      case 'file': return <UploadCloud size={14} className="text-orange-500" />;
      default: return <HelpCircle size={14} className="text-slate-500" />;
    }
  };

  // Add a new question field
  const addField = () => {
    const newFieldId = `field-${Date.now()}`;
    const newField = {
      id: newFieldId,
      label: 'Untitled Question',
      type: 'text',
      required: false,
      placeholder: 'Your answer...',
      options: ['Option 1']
    };
    setFormFields((prev) => [...prev, newField]);
    setActiveFieldId(newFieldId);
    
    // Smooth scroll to the newly created field's active canvas editor
    setTimeout(() => {
      const el = document.getElementById('active-editor-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Duplicate a field
  const duplicateField = (index, e) => {
    e.stopPropagation();
    const original = formFields[index];
    const newFieldId = `field-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const duplicated = {
      ...original,
      id: newFieldId,
      label: `${original.label} (Copy)`,
      options: original.options ? [...original.options] : undefined
    };
    
    const copy = [...formFields];
    copy.splice(index + 1, 0, duplicated);
    setFormFields(copy);
    setActiveFieldId(newFieldId);
  };

  // Delete a question field
  const deleteField = (id, e) => {
    e.stopPropagation();
    if (formFields.length <= 1) {
      alert("Your form must have at least one field.");
      return;
    }
    setFormFields((prev) => prev.filter((field) => field.id !== id));
    if (activeFieldId === id) {
      setActiveFieldId('header');
    }
  };

  // Edit field properties
  const updateField = (id, updates) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  // Option additions/removals
  const addOption = (fieldId, options) => {
    const nextIdx = (options || []).length + 1;
    const updatedOptions = [...(options || []), `Option ${nextIdx}`];
    updateField(fieldId, { options: updatedOptions });
  };

  const updateOptionValue = (fieldId, options, optionIndex, newValue) => {
    const updatedOptions = [...options];
    updatedOptions[optionIndex] = newValue;
    updateField(fieldId, { options: updatedOptions });
  };

  const removeOption = (fieldId, options, optionIndex) => {
    if (options.length <= 1) {
      alert("At least one option is required.");
      return;
    }
    const updatedOptions = options.filter((_, idx) => idx !== optionIndex);
    updateField(fieldId, { options: updatedOptions });
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e, index) => {
    const isGrip = e.target.closest('.drag-handle-grip');
    if (!isGrip) {
      e.preventDefault();
      return;
    }
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...formFields];
    const [movedField] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedField);
    
    setFormFields(reordered);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative animate-fade-in items-start w-full">
      
      {/* ── LEFT SIDEBAR (COLLAPSED STATE) ── */}
      {isSidebarCollapsed ? (
        <div className="md:col-span-1 flex flex-col items-center gap-4 p-3 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-brand-dark transition-all duration-300 w-full md:w-14 self-stretch">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer animate-pulse"
            title="Expand Navigator"
          >
            <ChevronRight size={14} />
          </button>
          
          <div className="w-full h-px bg-slate-150 dark:bg-slate-800" />
          
          <button
            type="button"
            onClick={() => { setActiveFieldId('header'); }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeFieldId === 'header' ? 'bg-brand-light dark:bg-brand-light/10 text-brand' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Form Title & Info"
          >
            <FileText size={15} />
          </button>

          <button
            type="button"
            onClick={() => { setActiveFieldId('theme'); }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeFieldId === 'theme' ? 'bg-brand-light dark:bg-brand-light/10 text-brand' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Themes & Styling"
          >
            <Sparkles size={15} />
          </button>

          <div className="w-full h-px bg-slate-150 dark:bg-slate-850" />

          <div className="flex flex-col gap-2 items-center w-full max-h-[320px] overflow-y-auto pr-0.5">
            {formFields.map((field) => (
              <button
                key={field.id}
                type="button"
                onClick={() => { setActiveFieldId(field.id); }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  activeFieldId === field.id ? 'bg-brand-light dark:bg-brand-light/10 text-brand' : 'text-slate-400 hover:text-slate-650'
                }`}
                title={field.label || 'Untitled Question'}
              >
                {getFieldIcon(field.type)}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-slate-150 dark:bg-slate-850" />

          <button
            type="button"
            onClick={addField}
            className="p-2 rounded-xl bg-slate-900 dark:bg-brand-dark-elevated text-white hover:bg-slate-800 transition cursor-pointer"
            title="Add Custom Field"
          >
            <Plus size={15} />
          </button>
        </div>
      ) : (
        /* ── LEFT SIDEBAR: EXPANDED STATE (4 cols) ── */
        <div className="md:col-span-4 flex flex-col gap-4 w-full">
          
          {/* Template presets */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 mb-2.5">
              <Sparkles size={13} className="text-brand" />
              <span>Load Template Preset</span>
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {['contact', 'feedback', 'inventory'].map(type => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => loadTemplate(type)}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition capitalize text-center"
                >
                  {type === 'inventory' ? 'Job Intake' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Structure Navigator Wrapper */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Form Navigator</span>
                <span className="text-[9px] font-bold bg-slate-100 dark:bg-brand-dark-elevated text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {formFields.length + 2} Nodes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 transition cursor-pointer"
                title="Collapse Navigator"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {/* Form title node */}
              <div
                onClick={() => setActiveFieldId('header')}
                className={`p-3 border transition-all rounded-xl cursor-pointer flex items-center gap-2.5 ${
                  activeFieldId === 'header'
                    ? 'border-brand bg-brand-light dark:bg-brand-light/10 text-brand font-black shadow-xs'
                    : 'border-slate-200/40 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-medium'
                }`}
              >
                <FileText size={13} className={activeFieldId === 'header' ? 'text-brand' : 'text-slate-400'} />
                <span className="text-xs truncate">Form Title & Info</span>
              </div>

              {/* Themes selection node */}
              <div
                onClick={() => setActiveFieldId('theme')}
                className={`p-3 border transition-all rounded-xl cursor-pointer flex items-center gap-2.5 ${
                  activeFieldId === 'theme'
                    ? 'border-brand bg-brand-light dark:bg-brand-light/10 text-brand font-black shadow-xs'
                    : 'border-slate-200/40 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-medium'
                }`}
              >
                <Sparkles size={13} className={activeFieldId === 'theme' ? 'text-brand' : 'text-slate-400'} />
                <span className="text-xs truncate">Themes & Styling</span>
              </div>

              {/* Reorderable questions list */}
              {formFields.map((field, index) => {
                const isActive = activeFieldId === field.id;
                const isDragging = draggingIndex === index;
                const isOver = dragOverIndex === index;

                return (
                  <div
                    key={field.id}
                    id={`nav-card-${field.id}`}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setActiveFieldId(field.id)}
                    className={`p-3 border transition-all rounded-xl cursor-pointer relative flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'border-brand bg-brand-light dark:bg-brand-light/10 text-brand font-black shadow-xs' 
                        : 'border-slate-200/40 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-medium'
                    } ${isDragging ? 'opacity-40' : ''} ${isOver ? 'border-dashed border-brand scale-[1.01]' : ''}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {/* Grip Handle */}
                      <div className="drag-handle-grip cursor-grab p-0.5 text-slate-300 dark:text-slate-700 hover:text-slate-400 transition">
                        <GripHorizontal size={13} />
                      </div>
                      
                      <span className="flex-shrink-0">{getFieldIcon(field.type)}</span>
                      
                      <span className="text-xs truncate">
                        {field.label || 'Untitled Question'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {field.required && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Required field" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              type="button"
              onClick={addField}
              className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 dark:bg-brand-dark-elevated hover:bg-slate-800 dark:hover:bg-brand-dark-elevated/70 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              <PlusCircle size={13} />
              <span>Add Custom Field</span>
            </button>
          </div>

        </div>
      )}

      {/* ── RIGHT EDITOR CANVAS: ACTIVE CONFIG AREA ── */}
      <div className={`flex flex-col gap-4 w-full md:sticky md:top-24 ${
        isSidebarCollapsed ? 'md:col-span-11' : 'md:col-span-8'
      }`}>
        
        {/* Render Theme Customizer config */}
        {activeFieldId === 'theme' && (
          <div className="glass-card rounded-2xl p-7 border-t-6 border-t-brand flex flex-col gap-6 shadow-sm animate-fade-in w-full">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <Sparkles size={12} className="text-brand" />
              <span>Theme Customizer & UX Settings</span>
            </div>

            {/* 1. THEME PRESETS */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Visual Vibe Theme</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Floating blurred pastel blobs', style: 'bg-white/40 border border-white/20 shadow-sm backdrop-blur-xs text-slate-800 dark:text-slate-200' },
                  { id: 'elegant-dark', name: 'Elegant Dark', desc: 'Midnight charcoal carbon glow', style: 'bg-[#111a2e] border border-slate-850 text-slate-100' },
                  { id: 'minimalist', name: 'Minimalist', desc: 'Clean square monochrome styling', style: 'bg-white border border-slate-200 text-slate-900 rounded-none' },
                  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon matrix cyber grid style', style: 'bg-[#0a0515] border border-cyan-400/80 text-cyan-400' },
                  { id: 'warm-sunset', name: 'Warm Sunset', desc: 'Cozy peach and amber gradient', style: 'bg-gradient-to-tr from-amber-100 to-rose-100 text-slate-900' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormTheme(prev => ({ ...prev, theme: item.id }))}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ${item.style} ${
                      formTheme?.theme === item.id 
                        ? 'ring-2 ring-brand border-transparent font-black' 
                        : 'border-slate-200/50 dark:border-slate-800/80 font-medium'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black block leading-none">{item.name}</span>
                      <span className="text-[9px] opacity-75 mt-1.5 block font-medium leading-tight">{item.desc}</span>
                    </div>
                    {formTheme?.theme === item.id && (
                      <span className="self-end bg-brand text-white rounded-full p-0.5 text-[8px] font-bold">
                        <Check size={8} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. ACCENT COLOR PRESETS */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Brand Accent Color</label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'brand', hex: '#2563EB', name: 'Brand Blue' },
                  { id: 'emerald', hex: '#10B981', name: 'Emerald Green' },
                  { id: 'violet', hex: '#8B5CF6', name: 'Violet Purple' },
                  { id: 'rose', hex: '#F43F5E', name: 'Rose Pink' },
                  { id: 'sky', hex: '#0EA5E9', name: 'Electric Cyan' },
                  { id: 'amber', hex: '#F59E0B', name: 'Warm Amber' }
                ].map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormTheme(prev => ({ ...prev, accent: color.id }))}
                    style={{ backgroundColor: color.hex }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer hover:scale-110 flex items-center justify-center border border-white/20`}
                    title={color.name}
                  >
                    {formTheme?.accent === color.id && (
                      <Check size={12} className="text-white drop-shadow-md font-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. TYPOGRAPHY FONTS SELECTOR */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Typography Font</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { id: 'Outfit', style: { fontFamily: "'Outfit', sans-serif" } },
                  { id: 'Inter', style: { fontFamily: "'Inter', sans-serif" } },
                  { id: 'Space Grotesk', style: { fontFamily: "'Space Grotesk', sans-serif" } },
                  { id: 'Playfair Display', style: { fontFamily: "'Playfair Display', serif" } },
                  { id: 'Plus Jakarta Sans', style: { fontFamily: "'Plus Jakarta Sans', sans-serif" } }
                ].map(font => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setFormTheme(prev => ({ ...prev, font: font.id }))}
                    style={font.style}
                    className={`p-2.5 border rounded-xl text-center text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer truncate ${
                      formTheme?.font === font.id
                        ? 'border-brand bg-brand-light/35 dark:bg-brand-light/10 text-brand font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    {font.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render Title/Desc Meta config */}
        {activeFieldId === 'header' && (
          <div className="glass-card rounded-2xl p-7 border-t-6 border-t-brand flex flex-col gap-5 shadow-sm animate-fade-in w-full">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <FileText size={12} className="text-brand" />
              <span>Form Info & Meta Details</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand dark:focus:border-sky-400 transition"
                placeholder="Enter Form Title..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-brand dark:focus:border-sky-400 transition resize-y"
                placeholder="Describe the purpose of this form..."
              />
            </div>
          </div>
        )}

        {/* Render question card config */}
        {activeFieldId !== 'header' && activeFieldId !== null && (() => {
          const field = formFields.find(f => f.id === activeFieldId);
          if (!field) {
            return (
              <div className="glass-card rounded-2xl p-6 text-center text-xs text-slate-400 font-semibold">
                Select an item from the navigator list to start editing.
              </div>
            );
          }
          const index = formFields.findIndex(f => f.id === activeFieldId);
          const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

          return (
            <div 
              id="active-editor-card"
              className="glass-card rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md p-6 border-l-6 border-l-brand flex flex-col gap-5 animate-fade-in w-full"
            >
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800/80">
                <Settings size={12} className="text-brand" />
                <span>Field Configurations</span>
              </div>

              {/* Label & Type Select */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Question Label</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand dark:focus:border-sky-400 transition-all"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Enter Question Label..."
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Input Format</label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-brand-dark-elevated rounded-xl">
                      {getFieldIcon(field.type)}
                    </div>
                    <select
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-brand dark:focus:border-sky-400 cursor-pointer flex-1"
                      value={field.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const updates = {
                          type: newType,
                          options: field.options || ['Option 1'],
                          placeholder: newType === 'number' ? '0' : newType === 'email' ? 'name@domain.com' : newType === 'phone' ? '+1 (555) 000-0000' : 'Your answer...'
                        };
                        updateField(field.id, updates);
                      }}
                      aria-label="Field input formatting type"
                    >
                      <option value="text">Short Answer</option>
                      <option value="paragraph">Paragraph Block</option>
                      <option value="number">Numeric Input</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Phone Number</option>
                      <option value="select">Dropdown Select</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                      <option value="checkbox">Checkboxes (Multi)</option>
                      <option value="date">Calendar Date</option>
                      <option value="file">File Upload Attachment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Option values (Dropdown / Radio / Checkbox) */}
              {hasOptions ? (
                <div className="flex flex-col gap-2.5 ml-2 mt-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Options Choices</span>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {(field.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 border border-slate-300 dark:border-slate-700 flex-shrink-0 ${
                          field.type === 'checkbox' ? 'rounded-xs' : 'rounded-full'
                        }`} />
                        
                        <input
                          type="text"
                          className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-brand dark:focus:border-sky-400 focus:outline-none py-1 transition-all font-medium"
                          value={opt}
                          onChange={(e) =>
                            updateOptionValue(field.id, field.options, optIdx, e.target.value)
                          }
                          placeholder={`Option ${optIdx + 1}`}
                        />
                        
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer"
                          onClick={() => removeOption(field.id, field.options, optIdx)}
                          title="Delete option"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="self-start mt-2 flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover bg-brand-light px-3 py-1.5 rounded-lg transition cursor-pointer"
                    onClick={() => addOption(field.id, field.options)}
                  >
                    <Plus size={12} />
                    <span>Add Choice Option</span>
                  </button>
                </div>
              ) : (
                /* Specific placeholder/limits configuration for other field types */
                <div className="text-xs text-slate-500 dark:text-slate-400 ml-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-2.5 max-w-[280px] font-medium">
                  {field.type === 'date' && (
                    <div className="flex flex-col gap-2 mt-2 not-italic">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase text-slate-400">Min Date Limit</span>
                        <input
                          type="date"
                          value={field.minDate || ''}
                          onChange={(e) => updateField(field.id, { minDate: e.target.value })}
                          className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase text-slate-400">Max Date Limit</span>
                        <input
                          type="date"
                          value={field.maxDate || ''}
                          onChange={(e) => updateField(field.id, { maxDate: e.target.value })}
                          className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {field.type === 'number' && 'Numerical response entry validation'}
                  {field.type === 'email' && 'Valid email address formatting check'}
                  {field.type === 'phone' && 'Telephone number pattern check'}
                  {field.type === 'file' && 'File attachment panel (up to 10MB)'}
                  {field.type === 'paragraph' && 'Multi-line text editor workspace'}
                  {field.type === 'text' && 'Short single-line text input'}
                </div>
              )}

              {/* Card Action Controls */}
              <div className="flex justify-end items-center gap-4 mt-2 pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  onClick={(e) => duplicateField(index, e)}
                  title="Duplicate Question"
                >
                  <Copy size={14} />
                </button>
                
                <button
                  type="button"
                  className="p-2 text-slate-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                  onClick={(e) => deleteField(field.id, e)}
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Required</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      aria-label="Mark field as required toggle"
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Global Save Form block */}
        <div className="flex justify-end items-center mt-2">
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-3 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer hover:scale-102"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Sync...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Save Workspace</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

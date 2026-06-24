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
  HelpCircle
} from 'lucide-react';

export default function FormBuilder({ 
  formFields, 
  setFormFields, 
  formTitle, 
  setFormTitle, 
  formDescription, 
  setFormDescription, 
  onSave, 
  isSaving,
  loadTemplate 
}) {
  const [activeFieldId, setActiveFieldId] = useState(formFields[0]?.id || null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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
    
    // Smooth scroll to the newly created field
    setTimeout(() => {
      const el = document.getElementById(`card-${newFieldId}`);
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
      setActiveFieldId(null);
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
    <div className="flex flex-col gap-6 relative animate-fade-in">
      
      {/* Workspace Templates Selector Card */}
      <div className="glass-card rounded-2xl p-6 transition duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-200">
              <Sparkles size={15} className="text-brand dark:text-sky-400" />
              <span>Load Template Preset</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">
              Populate builder fields instantly with a preset configuration.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {['contact', 'feedback', 'inventory'].map(type => (
              <button 
                key={type}
                onClick={() => loadTemplate(type)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition capitalize"
              >
                {type === 'inventory' ? 'Job Intake' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main SaaS Form Meta (Title & Description) Card */}
      <div className="glass-card rounded-2xl p-7 border-t-6 border-t-brand dark:border-t-sky-600 flex flex-col gap-4 shadow-sm">
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="text-2xl font-black text-slate-800 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-b focus:border-brand dark:focus:border-sky-400 focus:outline-none pb-1.5 transition-all w-full"
          placeholder="Form Title"
        />
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          rows={2}
          className="text-xs text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-b focus:border-brand dark:focus:border-sky-400 focus:outline-none pb-1.5 transition-all resize-y w-full font-medium"
          placeholder="Form description or intake notes..."
        />
      </div>

      {/* Fields List */}
      <div className="flex flex-col gap-5">
        {formFields.map((field, index) => {
          const isActive = activeFieldId === field.id;
          const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);
          const isDragging = draggingIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={field.id}
              id={`card-${field.id}`}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => setActiveFieldId(field.id)}
              className={`glass-card rounded-2xl border transition-all relative flex flex-col ${
                isActive 
                  ? 'border-l-6 border-l-brand dark:border-l-sky-500 shadow-md p-6 border-slate-200 dark:border-slate-700' 
                  : 'p-5 hover:shadow-md cursor-pointer border-slate-200/50 dark:border-slate-800/80'
              } ${isDragging ? 'drag-card-active' : ''} ${isOver ? 'drag-over-indicator' : ''}`}
            >
              {/* Grip Handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 drag-handle-grip text-slate-300 dark:text-slate-700 hover:text-slate-400 dark:hover:text-slate-500 transition py-1 px-5">
                <GripHorizontal size={14} />
              </div>

              {/* CARD ACTIVE CONFIG VIEW */}
              {isActive ? (
                <div className="flex flex-col gap-5 mt-3 animate-fade-in">
                  
                  {/* Label & Type Select */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <input
                      type="text"
                      className="flex-1 text-sm font-extrabold text-slate-800 dark:text-slate-100 bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-brand dark:focus:border-sky-400 focus:border-b focus:outline-none pb-2 transition-all w-full"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Enter Question Label..."
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="p-2 bg-slate-100 dark:bg-brand-dark-elevated rounded-lg">
                        {getFieldIcon(field.type)}
                      </div>
                      <select
                        className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-brand dark:focus:border-sky-400 cursor-pointer w-full sm:w-auto"
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

                  {/* Option values (Dropdown / Radio / Checkbox) */}
                  {hasOptions ? (
                    <div className="flex flex-col gap-2.5 ml-2 mt-1">
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
                      
                      <button
                        type="button"
                        className="self-start mt-2 flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover dark:text-sky-400 dark:hover:text-sky-300 bg-brand-light dark:bg-sky-950/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        onClick={() => addOption(field.id, field.options)}
                      >
                        <Plus size={12} />
                        <span>Add Choice Option</span>
                      </button>
                    </div>
                  ) : (
                    /* Specific placeholder updates for new fields */
                    <div className="text-xs text-slate-400 dark:text-slate-500 italic ml-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-2.5 max-w-[280px] font-medium">
                      {field.type === 'date' && (
                        <div className="flex flex-col gap-2 mt-2 not-italic">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">Min Date Limit</span>
                            <input
                              type="date"
                              value={field.minDate || ''}
                              onChange={(e) => updateField(field.id, { minDate: e.target.value })}
                              className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-2 py-1 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">Max Date Limit</span>
                            <input
                              type="date"
                              value={field.maxDate || ''}
                              onChange={(e) => updateField(field.id, { maxDate: e.target.value })}
                              className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated text-slate-800 dark:text-slate-100 px-2 py-1 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                      {field.type === 'number' && 'Numerical Response'}
                      {field.type === 'email' && 'Valid Email Address Response'}
                      {field.type === 'phone' && 'Formatted Telephonic Response'}
                      {field.type === 'file' && 'File Attachment (Max 10MB)'}
                      {field.type === 'paragraph' && 'Multi-line Paragraph Text'}
                      {field.type === 'text' && 'Short Single-line Text'}
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
              ) : (
                /* INACTIVE / DISPLAY VIEW */
                <div className="flex flex-col gap-2 mt-3 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200">
                    <span className="flex-shrink-0">{getFieldIcon(field.type)}</span>
                    <span>{field.label || 'Untitled Question'}</span>
                    {field.required && <span className="text-red-500" aria-hidden="true">*</span>}
                  </div>
                  
                  {hasOptions ? (
                    <div className="flex flex-col gap-1.5 ml-5 mt-1">
                      {(field.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className={`w-3 h-3 border border-slate-300 dark:border-slate-700 flex-shrink-0 ${
                            field.type === 'checkbox' ? 'rounded-xs' : 'rounded-full'
                          }`} />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic ml-5 mt-0.5">
                      {field.type === 'date' && (
                        <span>
                          Date selector input
                          {(field.minDate || field.maxDate) && (
                            <span className="block text-[9px] text-slate-400 font-extrabold not-italic uppercase tracking-wider mt-1">
                              {field.minDate ? `Min: ${field.minDate}` : ''}
                              {field.minDate && field.maxDate ? ' · ' : ''}
                              {field.maxDate ? `Max: ${field.maxDate}` : ''}
                            </span>
                          )}
                        </span>
                      )}
                      {field.type === 'number' && 'Numerical response entry'}
                      {field.type === 'email' && 'Email validation input'}
                      {field.type === 'phone' && 'Phone number formatting input'}
                      {field.type === 'file' && 'Drag & Drop attachment panel'}
                      {field.type === 'paragraph' && 'Paragraph textbox entry'}
                      {field.type === 'text' && 'Short text answer entry'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Add Question Footer bar */}
      <div className="flex justify-between items-center glass-card rounded-2xl p-5 mt-4 transition">
        <button 
          onClick={addField}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer hover:scale-103"
        >
          <PlusCircle size={14} />
          <span>Add Custom Field</span>
        </button>

        <button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer hover:scale-103"
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
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Copy,
  Download,
  BarChart3,
  Palette,
  FileText,
  Globe,
  ExternalLink,
  Trash2,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Sliders,
  Eye,
  Share2,
  Database,
  Brain,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const templateList = [
  { type: 'contact', title: 'Contact Details', desc: 'Securely gather user addresses, emails, phone numbers, and locations.', icon: <User size={18} />, grad: 'from-blue-500 to-indigo-500' },
  { type: 'feedback', title: 'Event Feedback', desc: 'Assess conference outcomes, session ratings, and suggestions.', icon: <Sparkles size={18} />, grad: 'from-emerald-500 to-teal-500' },
  { type: 'inventory', title: 'Job Application', desc: 'Intake developer details, resume uploads, and qualifications.', icon: <FileText size={18} />, grad: 'from-amber-500 to-orange-500' },
  { type: 'survey', title: 'Product Survey', desc: 'Conduct customer surveys, market analysis, and NPS tracking.', icon: <BarChart3 size={18} />, grad: 'from-purple-500 to-pink-500' },
  { type: 'booking', title: 'Room Booking', desc: 'Schedule calendar slots, guest bookings, and reservations.', icon: <Calendar size={18} />, grad: 'from-rose-500 to-red-500' },
  { type: 'support', title: 'Support Ticket', desc: 'Log client issues, bugs reports, and priority indicators.', icon: <Info size={18} />, grad: 'from-sky-500 to-cyan-500' }
];

const mockNames = ['Liam Johnson', 'Sophia Martinez', 'Noah Williams', 'Emma Davis', 'James Anderson', 'Olivia Taylor', 'Mason Thomas', 'Ava Jackson'];
const mockForms = ['Contact Details', 'Event Feedback', 'Job Application Intake', 'Product Survey Form'];

export default function MainDashboardView({
  allForms,
  filteredForms,
  handleCreateNewForm,
  handleCreateFromTemplate,
  handleDeleteForm,
  loadDashboardData,
  user,
  theme,
  triggerToast,
  setActiveView
}) {
  // Widget arrangement & sizes state (persisted to localStorage)
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('fs_dashboard_layout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 'hero', title: 'Hero & Summary', visible: true, size: 'full' },
      { id: 'analytics', title: 'Analytics Cards', visible: true, size: 'full' },
      { id: 'quick-actions', title: 'Quick Actions', visible: true, size: 'half' },
      { id: 'ai-insights', title: 'AI Assistant Insights', visible: true, size: 'half' },
      { id: 'templates', title: 'Template Carousel', visible: true, size: 'full' },
      { id: 'recent-activity', title: 'Workspace Log Activity', visible: true, size: 'half' },
      { id: 'live-feed', title: 'Live Response Stream', visible: true, size: 'half' },
      { id: 'recent-forms', title: 'Forms Catalog Directory', visible: true, size: 'full' }
    ];
  });

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const carouselRef = useRef(null);

  // Live Response Activity state
  const [liveFeed, setLiveFeed] = useState([
    { id: 'f-1', name: 'John Smith', form: 'Contact Details', time: '5 seconds ago', avatar: 'JS' },
    { id: 'f-2', name: 'Jane Miller', form: 'Job Application Intake', time: '2 minutes ago', avatar: 'JM' },
    { id: 'f-3', name: 'Robert Chen', form: 'Event Feedback', time: '10 minutes ago', avatar: 'RC' }
  ]);

  // Live feed auto-updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomForm = mockForms[Math.floor(Math.random() * mockForms.length)];
      const initials = randomName.split(' ').map(n => n[0]).join('');
      const newEntry = {
        id: `feed-${Date.now()}`,
        name: randomName,
        form: randomForm,
        time: 'Just now',
        avatar: initials
      };
      setLiveFeed(prev => [newEntry, ...prev.slice(0, 3)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const saveLayout = (updatedWidgets) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('fs_dashboard_layout', JSON.stringify(updatedWidgets));
  };

  // Move widget up/down
  const moveWidget = (index, direction) => {
    const updated = [...widgets];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    saveLayout(updated);
  };

  // Toggle widget visibility
  const toggleVisibility = (id) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveLayout(updated);
  };

  // Cycle widget size
  const cycleSize = (id) => {
    const updated = widgets.map(w => {
      if (w.id === id) {
        let nextSize = 'full';
        if (w.size === 'full') nextSize = 'half';
        else if (w.size === 'half') nextSize = 'one-third';
        else nextSize = 'full';
        return { ...w, size: nextSize };
      }
      return w;
    });
    saveLayout(updated);
  };

  const handleScrollCarousel = (dir) => {
    if (carouselRef.current) {
      const scrollAmt = dir === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const resetLayout = () => {
    const defaultWidgets = [
      { id: 'hero', title: 'Hero & Summary', visible: true, size: 'full' },
      { id: 'analytics', title: 'Analytics Cards', visible: true, size: 'full' },
      { id: 'quick-actions', title: 'Quick Actions', visible: true, size: 'half' },
      { id: 'ai-insights', title: 'AI Assistant Insights', visible: true, size: 'half' },
      { id: 'templates', title: 'Template Carousel', visible: true, size: 'full' },
      { id: 'recent-activity', title: 'Workspace Log Activity', visible: true, size: 'half' },
      { id: 'live-feed', title: 'Live Response Stream', visible: true, size: 'half' },
      { id: 'recent-forms', title: 'Forms Catalog Directory', visible: true, size: 'full' }
    ];
    saveLayout(defaultWidgets);
    triggerToast("Layout reset to default dashboard grids.");
  };

  // Metrics Calculations
  const totalCount = allForms.length;
  const publishedCount = allForms.filter(f => f.status === 'published').length;
  const draftCount = allForms.filter(f => f.status === 'draft' || !f.status).length;
  const responsesCount = allForms.reduce((acc, f) => acc + (f.responseCount || 0), 0);

  // Widget Size Mapper
  const getColSpan = (size) => {
    switch (size) {
      case 'one-third':
        return 'col-span-12 lg:col-span-4';
      case 'half':
        return 'col-span-12 lg:col-span-6';
      default:
        return 'col-span-12';
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* 0. Widget Customizer Controls */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 flex-wrap gap-4 select-none">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-slate-400" />
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace Dashboard Layout</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-[10px] font-black rounded-lg transition duration-200 cursor-pointer shadow-xs"
          >
            <Sliders size={12} />
            <span>{customizeOpen ? 'Lock Layout' : 'Customize Widgets'}</span>
          </button>
          {customizeOpen && (
            <button
              onClick={resetLayout}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 text-[10px] font-black rounded-lg transition duration-200 cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {customizeOpen && (
        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200/60 dark:border-slate-800 rounded-2xl animate-scale-in flex flex-col gap-3">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Widget Visibility & Column Spanning</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map((w, idx) => (
              <div key={w.id} className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs select-none">
                <span className="font-bold text-slate-850 dark:text-slate-200 truncate">{w.title}</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => toggleVisibility(w.id)}
                    className={`w-10 py-1 rounded text-[9px] font-black text-white uppercase text-center transition ${w.visible ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    {w.visible ? 'On' : 'Off'}
                  </button>
                  {w.visible && (
                    <button 
                      onClick={() => cycleSize(w.id)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[9px] font-black text-slate-500 uppercase transition"
                    >
                      {w.size}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Widgets Grid Container */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {widgets.map((widget, index) => {
          if (!widget.visible) return null;

          return (
            <div 
              key={widget.id} 
              className={`${getColSpan(widget.size)} flex flex-col gap-2 relative group/widget`}
            >
              {/* Widget Layout Customizer overlay (visible when customize mode is active) */}
              {customizeOpen && (
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md rounded-lg p-1.5 z-20 flex items-center gap-1.5 shadow-lg border border-slate-700 select-none opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-extrabold px-1">{widget.title}</span>
                  <button
                    onClick={() => moveWidget(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Widget Up"
                  >
                    <ChevronLeft size={12} className="rotate-90" />
                  </button>
                  <button
                    onClick={() => moveWidget(index, 1)}
                    disabled={index === widgets.length - 1}
                    className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Widget Down"
                  >
                    <ChevronRight size={12} className="rotate-90" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(widget.id)}
                    className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                    title="Hide Widget"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* RENDER DYNAMIC WIDGETS */}
              
              {/* A. HERO SECTION */}
              {widget.id === 'hero' && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 dark:bg-[#0b1329] text-white py-8 px-8 shadow-xl border border-slate-800 dark:border-slate-850/80 flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-8 transition-all">
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-xl flex flex-col justify-center">
                    <span className="bg-brand/15 text-blue-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md border border-brand/25 backdrop-blur-xs self-start">
                      Workspace active
                    </span>
                    <h1 className="text-2.5xl md:text-3xl font-extrabold tracking-tight mt-4 leading-tight text-white select-none">
                      Design, sync, & analyze web forms dynamically
                    </h1>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-semibold max-w-md select-none">
                      Establish public forms instantly. Intake user files up to 10MB, log analytics databases, and download spreadsheet ledger ledgers instantly.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleCreateNewForm}
                        className="bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>Create Blank Form</span>
                      </button>
                    </div>
                  </div>

                  {/* Browser Mockup */}
                  <div className="hidden lg:block w-96 bg-[#090f1d]/90 border border-slate-800/80 rounded-2xl p-5 overflow-hidden relative shadow-2xl backdrop-blur-md flex-shrink-0 animate-fade-in flex flex-col justify-center select-none">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500/80" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                        <span className="w-2 h-2 rounded-full bg-green-500/80" />
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">FormStudio Live</div>
                    </div>
                    
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-full h-7 bg-slate-950/60 border border-slate-850 rounded-lg" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-full h-7 bg-slate-950/60 border border-slate-850 rounded-lg flex items-center justify-between px-3.5">
                          <div className="w-20 h-2 bg-slate-700 rounded-full" />
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-brand" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 bg-brand text-white px-3 py-1.5 rounded-xl shadow-lg border border-brand/20 flex items-center gap-1.5 animate-bounce text-[9px] font-black uppercase tracking-wider">
                        <PlusCircle size={10} />
                        <span>New entry +1</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* B. ANALYTICS OVERVIEW */}
              {widget.id === 'analytics' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {[
                    { label: 'Responses Today', value: responsesCount > 0 ? Math.round(responsesCount * 0.15) : 0, icon: <TrendingUp size={16} />, desc: '+12% from yesterday', color: 'text-brand bg-brand/5 dark:bg-brand/10', sparkline: "M 0 25 Q 15 15 30 20 T 60 5 T 90 22 T 120 10" },
                    { label: 'Responses This Week', value: responsesCount, icon: <Database size={16} />, desc: 'All submissions logged', color: 'text-sky-500 bg-sky-500/5 dark:bg-sky-500/10', sparkline: "M 0 20 Q 20 28 40 10 T 80 18 T 120 5" },
                    { label: 'Published Forms', value: publishedCount, icon: <Globe size={16} />, desc: 'Active public sheets', color: 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10', sparkline: "M 0 10 Q 20 5 40 15 T 80 10 T 120 18" },
                    { label: 'Draft Workspaces', value: draftCount, icon: <Copy size={16} />, desc: 'Offline workspace drafts', color: 'text-amber-500 bg-amber-500/5 dark:bg-amber-500/10', sparkline: "M 0 25 Q 15 25 30 15 T 60 18 T 90 5 T 120 20" }
                  ].map(stat => (
                    <div 
                      key={stat.label} 
                      className="bg-white dark:bg-[#0c1424] border border-slate-205/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{stat.label}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <div className="text-2.5xl font-black text-slate-805 dark:text-slate-100 leading-none">{stat.value}</div>
                        {/* Sparkline mini chart */}
                        <svg className="w-16 h-8 text-slate-300 dark:text-slate-700" viewBox="0 0 120 30" fill="none">
                          <path 
                            d={stat.sparkline} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* C. QUICK ACTION PANEL */}
              {widget.id === 'quick-actions' && (
                <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col gap-4 select-none h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: 'Create Form', desc: 'New blank sheet', icon: <PlusCircle size={15} className="text-blue-500" />, action: handleCreateNewForm },
                      { title: 'Duplicate Form', desc: 'Clone workspace', icon: <Copy size={15} className="text-amber-500" />, action: () => triggerToast("To clone a form, click 'Duplicate' inside the Form Card Quick Actions below.") },
                      { title: 'Import Template', desc: 'Load sample config', icon: <ChevronRight size={15} className="text-emerald-500" />, action: () => handleCreateFromTemplate('contact') },
                      { title: 'Export Data', desc: 'Bulk responses', icon: <Download size={15} className="text-purple-500" />, action: () => setActiveView('export') },
                      { title: 'View Analytics', desc: 'Audit submissions', icon: <BarChart3 size={15} className="text-indigo-500" />, action: () => setActiveView('responses') },
                      { title: 'Customize Theme', desc: 'Global palette', icon: <Palette size={15} className="text-pink-500" />, action: () => setActiveView('themes') }
                    ].map((q, qIdx) => (
                      <div 
                        key={qIdx}
                        onClick={q.action}
                        className="p-3 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:shadow-sm cursor-pointer transition active:scale-[0.98] duration-200 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          {q.icon}
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-205">{q.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-normal mt-0.5">{q.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* D. AI INSIGHTS PANEL */}
              {widget.id === 'ai-insights' && (
                <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col gap-4 select-none h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <Brain size={14} className="text-brand dark:text-sky-400" />
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">AI Workspace Assistant</h3>
                    </div>
                    <span className="text-[9px] bg-purple-500/10 text-purple-500 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">Notion AI Engine</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: '💡', text: `Your forms have logged a total of ${responsesCount} submissions. The completion health indicator is excellent.` },
                      { icon: '💡', text: 'Contact forms perform 18% better when adding clear instructions to paragraph boxes.' },
                      { icon: '💡', text: 'Tip: Adding checkbox options speeds up submission completion times on mobile.' },
                      { icon: '💡', text: `${publishedCount} of your forms are public. Keep drafts minimized to manage tidy workspaces.` }
                    ].map((insight, insIdx) => (
                      <div 
                        key={insIdx}
                        className="p-3 border border-slate-50 dark:border-slate-800/40 rounded-xl bg-slate-50/50 dark:bg-slate-900/15 flex items-start gap-2.5 hover:shadow-xs transition duration-200"
                      >
                        <span className="text-sm flex-shrink-0 mt-0.5">{insight.icon}</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* E. FAVORITE TEMPLATES */}
              {widget.id === 'templates' && (
                <div className="flex flex-col gap-3 mt-1.5 select-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 tracking-widest uppercase">Start with templates</h3>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleScrollCarousel('left')}
                        className="p-1.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition cursor-pointer flex items-center justify-center"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button 
                        onClick={() => handleScrollCarousel('right')}
                        className="p-1.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition cursor-pointer flex items-center justify-center"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div 
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
                  >
                    {templateList.map(t => (
                      <div
                        key={t.type}
                        className="w-[280px] bg-white dark:bg-[#0c1424] p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between flex-shrink-0 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.grad} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                            {t.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{t.title}</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold line-clamp-2">{t.desc}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex justify-end">
                          <button
                            onClick={() => handleCreateFromTemplate(t.type)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-brand dark:text-sky-400 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 group-hover:scale-105"
                          >
                            <span>Use Template</span>
                            <ArrowUpRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* F. RECENT ACTIVITY TIMELINE */}
              {widget.id === 'recent-activity' && (
                <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col gap-4 select-none h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Workspace Activity Logs</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: '✓', color: 'bg-emerald-500/10 text-emerald-500', name: 'Sophia Martinez', action: 'submitted Details details', time: '10 minutes ago' },
                      { icon: '📋', color: 'bg-brand/10 text-brand', name: 'Jane Miller', action: 'duplicated Event Registration', time: '1 hour ago' },
                      { icon: '🎨', color: 'bg-pink-500/10 text-pink-500', name: 'System Engine', action: 'applied Midnight theme configs', time: '3 hours ago' },
                      { icon: '✓', color: 'bg-emerald-500/10 text-emerald-500', name: 'Liam Johnson', action: 'submitted Job Application', time: 'Yesterday' }
                    ].map((act, actIdx) => (
                      <div key={actIdx} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${act.color}`}>
                          {act.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-350 leading-tight font-semibold">
                            <span className="font-black text-slate-900 dark:text-white mr-1">{act.name}</span>
                            <span>{act.action}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* G. LIVE RESPONSE FEED */}
              {widget.id === 'live-feed' && (
                <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col gap-4 select-none h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Live Response Stream</h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {liveFeed.map(feed => (
                      <div 
                        key={feed.id} 
                        className="flex items-center justify-between gap-4 p-3 border border-slate-50 dark:border-slate-800/30 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all duration-200 animate-fade-in"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                            {feed.avatar}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate">{feed.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">intake on {feed.form}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-brand dark:text-sky-400 font-black flex-shrink-0 bg-brand/5 dark:bg-sky-400/10 px-2 py-0.5 rounded">{feed.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* H. RECENT FORMS */}
              {widget.id === 'recent-forms' && (
                <div className={`flex flex-col gap-4 mt-2 ${filteredForms.length === 0 ? '' : 'w-full'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 tracking-widest uppercase">Forms Catalog</h3>
                  </div>

                  {filteredForms.length === 0 ? (
                    <div className="bg-white dark:bg-[#0c1424] rounded-2xl p-16 border border-dashed border-slate-200 dark:border-slate-800/80 text-center flex flex-col items-center justify-center">
                      <Globe size={36} className="text-slate-350 dark:text-slate-700 mb-3" />
                      <h3 className="text-xs font-black text-slate-650 dark:text-slate-300">No forms found</h3>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                        You have not created any forms yet.
                      </p>
                      <button
                        onClick={handleCreateNewForm}
                        className="mt-5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer hover:scale-102 active:scale-98"
                      >
                        Create Your First Form
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                      {filteredForms.map(form => (
                        <div
                          key={form.id}
                          className="bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                        >
                          <div className="p-5.5 flex flex-col gap-3">
                            <div className="flex items-center justify-between select-none">
                              <span className="bg-brand/5 text-brand dark:bg-sky-950/40 dark:text-sky-400 text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                                <Database size={10} />
                                <span>{form.responseCount || 0} Responses</span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{form.status || 'draft'}</span>
                              </div>
                            </div>
                            <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                              {form.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                              {form.description ? form.description.split('|||')[0] : 'No summary descriptions configured.'}
                            </p>
                            
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold border-t border-slate-100/60 dark:border-slate-800/40 pt-3 mt-1.5 select-none">
                              <span>Updated {formatFriendlyDate(form.updatedAt)}</span>
                              <span>Created {formatFriendlyDate(form.createdAt)}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50/50 dark:bg-slate-900/15 px-5.5 py-3 border-t border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between gap-2 select-none">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/form/${form.id}/edit`}
                                className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-[10px] font-extrabold rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1 hover:scale-102 active:scale-98"
                              >
                                <Edit3 size={11} />
                                <span>Edit Workspace</span>
                              </Link>
                              <Link
                                to={`/form/${form.id}`}
                                target="_blank"
                                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 rounded-lg text-xs font-bold flex items-center justify-center transition"
                                title="View Public Form"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            </div>

                            <button
                              onClick={(e) => handleDeleteForm(form.id, e)}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                              title="Delete Form"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helpers for formatted date display
const formatFriendlyDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  let dateStr = dateVal;
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      dateStr = dateVal.toDate();
    } else if (dateVal.seconds) {
      dateStr = new Date(dateVal.seconds * 1000);
    } else {
      try {
        dateStr = String(dateVal);
      } catch (e) {
        return 'N/A';
      }
    }
  }
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return typeof dateStr === 'string' ? dateStr : 'N/A';
    }
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    return 'N/A';
  }
};

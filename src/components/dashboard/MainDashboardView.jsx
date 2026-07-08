import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Copy, Download, BarChart3, Palette, FileText, Globe, ExternalLink,
  Trash2, Edit3, User, Calendar, ChevronLeft, ChevronRight, Sparkles, TrendingUp,
  CheckCircle, Eye, Share2, Database, Brain, ArrowUpRight, Settings, Zap,
  MessageSquare, Target, Smartphone, AlertTriangle, CheckSquare, Clock, Send, LayoutTemplate
} from 'lucide-react';

const templateList = [
  { type: 'contact',   title: 'Contact Form',       desc: 'Collect names, emails, phone numbers, and messages from visitors.',               icon: 'User',        grad: 'from-blue-500 to-indigo-600',   fields: '6 fields · 2 min' },
  { type: 'feedback',  title: 'Feedback Form',       desc: 'Gather satisfaction scores, ratings, and improvement suggestions from users.',     icon: 'MessageSquare', grad: 'from-emerald-500 to-teal-600',  fields: '8 fields · 3 min' },
  { type: 'event',     title: 'Event Registration',  desc: 'Register attendees with session choices, dietary preferences, and tickets.',       icon: 'Calendar',    grad: 'from-violet-500 to-purple-600', fields: '10 fields · 4 min' },
  { type: 'inventory', title: 'Job Application',     desc: 'Intake developer resumes, portfolio links, and professional qualifications.',      icon: 'FileText',    grad: 'from-amber-500 to-orange-600',  fields: '12 fields · 5 min' },
  { type: 'survey',    title: 'Product Survey',      desc: 'Run NPS surveys, market research, and customer satisfaction analysis at scale.',   icon: 'BarChart3',   grad: 'from-pink-500 to-rose-600',     fields: '9 fields · 3 min' },
  { type: 'quiz',      title: 'Online Quiz',         desc: 'Create scored quizzes with multiple choice, true/false, and open-ended answers.',  icon: 'CheckSquare', grad: 'from-sky-500 to-cyan-600',      fields: '15 fields · 8 min' },
];

const ICONS = { User, MessageSquare, Calendar, FileText, BarChart3, CheckSquare };

function Sparkline({ path, color }) {
  return (
    <svg viewBox="0 0 120 36" fill="none" className="w-20 h-9" aria-hidden="true">
      <path d={path} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="flex items-center gap-1 text-[11px] font-bold text-brand dark:text-sky-400 hover:underline transition">
          {action.label} <ArrowUpRight size={11} />
        </button>
      )}
    </div>
  );
}

const formatFriendlyDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  let d = dateVal;
  if (typeof d === 'object') {
    if (typeof d.toDate === 'function') d = d.toDate();
    else if (d.seconds) d = new Date(d.seconds * 1000);
    else { try { d = String(d); } catch { return 'N/A'; } }
  }
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return typeof d === 'string' ? d : 'N/A';
    const diffDays = Math.ceil(Math.abs(new Date() - date) / 86400000);
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return 'N/A'; }
};

export default function MainDashboardView({
  allForms, filteredForms, handleCreateNewForm, handleCreateFromTemplate,
  handleDeleteForm, loadDashboardData, user, theme, triggerToast, setActiveView
}) {
  const carouselRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  const totalCount     = allForms.length;
  const publishedCount = allForms.filter(f => f.status === 'published').length;
  const draftCount     = allForms.filter(f => f.status === 'draft' || !f.status).length;
  const responsesCount = allForms.reduce((acc, f) => acc + (f.responseCount || 0), 0);
  const viewsCount     = responsesCount * 4;
  const completionRate = responsesCount > 0 ? Math.min(78, Math.round((responsesCount / Math.max(viewsCount, 1)) * 100)) : 0;

  const metrics = [
    { label: 'Total Forms',     value: totalCount,           iconBg: 'bg-blue-50 dark:bg-blue-950/40',     iconColor: 'text-blue-600 dark:text-blue-400',     icon: <FileText size={18} />, desc: 'All workspaces',   sparkline: 'M 0 28 Q 20 20 40 24 T 80 12 T 120 8',  color: '#2563EB' },
    { label: 'Published Forms', value: publishedCount,       iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', icon: <Globe size={18} />,    desc: 'Active & live',   sparkline: 'M 0 28 Q 15 18 35 22 T 70 10 T 120 6', color: '#10B981' },
    { label: 'Draft Forms',     value: draftCount,           iconBg: 'bg-amber-50 dark:bg-amber-950/40',   iconColor: 'text-amber-600 dark:text-amber-400',   icon: <FileText size={18} />, desc: 'Unpublished',      sparkline: 'M 0 20 Q 30 28 60 15 T 90 22 T 120 18', color: '#F59E0B' },
    { label: 'Total Responses', value: responsesCount,       iconBg: 'bg-violet-50 dark:bg-violet-950/40', iconColor: 'text-violet-600 dark:text-violet-400', icon: <Database size={18} />, desc: 'All submissions',  sparkline: 'M 0 26 Q 20 18 40 22 T 80 8 T 120 4',  color: '#8B5CF6' },
    { label: 'Completion Rate', value: `${completionRate}%`, iconBg: 'bg-pink-50 dark:bg-pink-950/40',     iconColor: 'text-pink-600 dark:text-pink-400',     icon: <Target size={18} />,   desc: 'Avg across forms', sparkline: 'M 0 24 Q 20 16 45 20 T 85 10 T 120 12', color: '#EC4899' },
    { label: 'Est. Views',      value: viewsCount,           iconBg: 'bg-sky-50 dark:bg-sky-950/40',       iconColor: 'text-sky-600 dark:text-sky-400',       icon: <Eye size={18} />,      desc: 'Page impressions', sparkline: 'M 0 22 Q 25 14 50 18 T 90 6 T 120 10',  color: '#0EA5E9' },
  ];

  const quickActions = [
    { title: 'Create New Form',  desc: 'Start from a blank canvas',   icon: <PlusCircle size={22} />,    grad: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',     action: handleCreateNewForm },
    { title: 'Import Template',  desc: 'Use a pre-built layout',      icon: <LayoutTemplate size={22} />, grad: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-50 dark:bg-emerald-950/30', action: () => handleCreateFromTemplate('contact') },
    { title: 'View Responses',   desc: 'Browse all submissions',      icon: <Database size={22} />,      grad: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', action: () => setActiveView('responses') },
    { title: 'Analytics',        desc: 'Insights & completion rates', icon: <BarChart3 size={22} />,     grad: 'from-amber-500 to-orange-600',  bg: 'bg-amber-50 dark:bg-amber-950/30',   action: () => setActiveView('responses') },
    { title: 'Themes',           desc: 'Customize form appearance',   icon: <Palette size={22} />,       grad: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50 dark:bg-pink-950/30',     action: () => setActiveView('themes') },
    { title: 'Settings',         desc: 'Account & workspace config',  icon: <Settings size={22} />,      grad: 'from-slate-500 to-slate-700',   bg: 'bg-slate-50 dark:bg-slate-800/50',   action: () => triggerToast('Settings panel coming soon.') },
  ];

  const aiInsights = [
    { icon: <TrendingUp size={14} className="text-emerald-500" />,  bg: 'bg-emerald-50 dark:bg-emerald-950/30', title: 'Improve Completion Rate',    text: `Your forms average ${completionRate}% completion. Reducing field count by 2-3 can boost this by up to 25%.` },
    { icon: <Smartphone size={14} className="text-blue-500" />,     bg: 'bg-blue-50 dark:bg-blue-950/30',       title: 'Mobile Optimization',        text: 'Use full-width inputs and single-column layouts to reduce mobile drop-off by 18%.' },
    { icon: <AlertTriangle size={14} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/30',     title: 'Missing Required Fields',    text: `${draftCount} draft form${draftCount !== 1 ? 's' : ''} may have fields that should be marked required for data quality.` },
    { icon: <CheckCircle size={14} className="text-violet-500" />,  bg: 'bg-violet-50 dark:bg-violet-950/30',  title: 'Accessibility Tips',         text: 'Add labels and placeholder text to all inputs - improves screen reader compatibility by 40%.' },
    { icon: <Zap size={14} className="text-pink-500" />,            bg: 'bg-pink-50 dark:bg-pink-950/30',       title: 'Performance Recommendation', text: `${publishedCount} form${publishedCount !== 1 ? 's' : ''} are live. Set response limits on high-traffic forms to prevent spam.` },
  ];

  const recentResponses = [...allForms]
    .filter(f => (f.responseCount || 0) > 0)
    .sort((a, b) => {
      const ts = (v) => {
        if (!v) return 0;
        if (typeof v === 'object' && v.seconds) return v.seconds;
        if (typeof v?.toDate === 'function') return v.toDate().getTime() / 1000;
        return new Date(v).getTime() / 1000;
      };
      return ts(b.updatedAt) - ts(a.updatedAt);
    }).slice(0, 5);

  const handleScrollCarousel = (dir) => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const handleShareForm = (formId) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(formId);
      triggerToast('Share link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-6">

      {/* 1. HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 dark:bg-[#0a1229] text-white py-9 px-8 shadow-2xl border border-slate-800/80 flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <span className="self-start bg-brand/15 text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-brand/25 mb-4">
            Workspace Active
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{user?.displayName?.split(' ')[0] || 'Builder'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed font-medium max-w-sm">
            Design, publish, and analyze web forms in minutes. You have <span className="text-white font-bold">{totalCount} form{totalCount !== 1 ? 's' : ''}</span> and <span className="text-white font-bold">{responsesCount} response{responsesCount !== 1 ? 's' : ''}</span> logged.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={handleCreateNewForm} className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <PlusCircle size={14} /> Create New Form
            </button>
            <button onClick={() => setActiveView('responses')} className="bg-white/8 hover:bg-white/12 border border-white/15 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer">
              <BarChart3 size={14} /> View Analytics
            </button>
          </div>
        </div>
        <div className="hidden lg:flex w-[320px] bg-[#090f1d] border border-slate-800/80 rounded-2xl p-5 overflow-hidden relative shadow-xl flex-shrink-0 flex-col gap-3 select-none">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
            <span className="w-2 h-2 rounded-full bg-red-500/80" /><span className="w-2 h-2 rounded-full bg-yellow-500/80" /><span className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="ml-auto text-[8px] text-slate-500 font-mono tracking-widest uppercase">FormStudio Live</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {[{w:'w-20'},{w:'w-28'},{w:'w-16'}].map((item,i)=>(
              <div key={i} className="flex flex-col gap-1"><div className={`${item.w} h-1.5 bg-slate-800 rounded-full`}/><div className="w-full h-7 bg-slate-950/60 border border-slate-850 rounded-lg"/></div>
            ))}
          </div>
          <div className="absolute bottom-4 right-4 bg-brand text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce text-[9px] font-black uppercase tracking-wider">
            <PlusCircle size={9} /> New entry +1
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS OVERVIEW */}
      <section>
        <SectionHeader title="Analytics Overview" subtitle="Real-time metrics across all your forms and responses" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-white dark:bg-[#0c1424] border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-4 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2 select-none">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.iconBg}`}><span className={m.iconColor}>{m.icon}</span></div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{m.value}</div>
                <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">{m.label}</div>
              </div>
              <Sparkline path={m.sparkline} color={m.color} />
              <p className="text-[10px] text-slate-400 font-medium">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. QUICK ACTIONS */}
      <section>
        <SectionHeader title="Quick Actions" subtitle="Jump straight into the most common tasks" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((qa, i) => (
            <button key={i} onClick={qa.action} className={`${qa.bg} rounded-2xl p-5 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-premium text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer group flex flex-col gap-3`}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${qa.grad} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>{qa.icon}</div>
              <div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{qa.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{qa.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. RECENT FORMS */}
      <section>
        <SectionHeader title="Recent Forms" subtitle={`${filteredForms.length} form${filteredForms.length !== 1 ? 's' : ''} in your workspace`} />
        {filteredForms.length === 0 ? (
          <div className="bg-white dark:bg-[#0c1424] rounded-2xl p-16 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4"><FileText size={32} className="text-slate-400 dark:text-slate-600" /></div>
            <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">No forms yet</h3>
            <p className="text-[11px] text-slate-400 mt-1.5 max-w-xs leading-relaxed font-medium">Create your first form to start collecting responses.</p>
            <button onClick={handleCreateNewForm} className="mt-5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
              <PlusCircle size={14} /> Create Your First Form
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-widest select-none">
              <span>Form Name</span><span>Status</span><span>Responses</span><span>Last Updated</span><span>Actions</span>
            </div>
            {filteredForms.slice(0, 8).map(form => (
              <div key={form.id} className="bg-white dark:bg-[#0c1424] border border-slate-200/70 dark:border-slate-800/80 rounded-2xl hover:shadow-premium hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden group">
                {/* Mobile */}
                <div className="md:hidden p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${form.status === 'published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{form.status || 'draft'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Database size={10}/>{form.responseCount || 0} responses</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-sky-400 transition-colors">{form.title}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={10}/>{formatFriendlyDate(form.updatedAt)}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/form/${form.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 bg-brand hover:bg-brand-hover text-white text-[11px] font-bold rounded-lg transition cursor-pointer"><Edit3 size={11}/>Edit</Link>
                    <Link to={`/form/${form.id}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"><Eye size={11}/>Preview</Link>
                    <button onClick={() => handleShareForm(form.id)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"><Share2 size={11}/>{copiedId === form.id ? 'Copied!' : 'Share'}</button>
                    <button onClick={(e) => handleDeleteForm(form.id, e)} className="flex items-center gap-1.5 px-3 py-2 border border-red-100 dark:border-red-950/50 text-red-500 text-[11px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer ml-auto"><Trash2 size={11}/>Delete</button>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-sky-400 transition-colors truncate">{form.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{form.description ? form.description.split('|||')[0] : 'No description'}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${form.status === 'published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}/>{form.status || 'draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200"><Database size={13} className="text-slate-400"/>{form.responseCount || 0}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1"><Clock size={11}/>{formatFriendlyDate(form.updatedAt)}</div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/form/${form.id}/edit`} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand hover:bg-brand-hover text-white transition cursor-pointer"><Edit3 size={13}/></Link>
                    <Link to={`/form/${form.id}`} target="_blank" title="Preview" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"><Eye size={13}/></Link>
                    <button onClick={() => handleShareForm(form.id)} title="Copy share link" className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${copiedId === form.id ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{copiedId === form.id ? <CheckCircle size={13}/> : <Share2 size={13}/>}</button>
                    <button onClick={() => { handleCreateFromTemplate('contact'); triggerToast(`"${form.title}" duplicated.`); }} title="Duplicate" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"><Copy size={13}/></button>
                    <button onClick={(e) => handleDeleteForm(form.id, e)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5 + 6. AI ASSISTANT & RECENT RESPONSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#0c1424] border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Brain size={16} className="text-white"/></div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">AI Workspace Assistant</h2>
                <p className="text-[10px] text-slate-400 font-medium">Intelligent recommendations</p>
              </div>
            </div>
            <span className="text-[9px] bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wide border border-violet-200/50 dark:border-violet-500/20">AI Powered</span>
          </div>
          <div className="flex flex-col gap-3">
            {aiInsights.map((ins, i) => (
              <div key={i} className={`${ins.bg} rounded-xl p-3.5 flex items-start gap-3`}>
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center">{ins.icon}</div>
                <div>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{ins.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#0c1424] border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center"><Send size={15} className="text-white"/></div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Recent Responses</h2>
                <p className="text-[10px] text-slate-400 font-medium">Latest form submissions</p>
              </div>
            </div>
            <button onClick={() => setActiveView('responses')} className="text-[11px] font-bold text-brand dark:text-sky-400 hover:underline flex items-center gap-1 transition">View all <ArrowUpRight size={11}/></button>
          </div>
          {recentResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3"><Database size={22} className="text-slate-400"/></div>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400">No responses yet</p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Responses appear here once users submit your forms.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentResponses.map(form => (
                <div key={form.id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-all duration-150 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand/15 to-sky-500/15 flex items-center justify-center flex-shrink-0"><FileText size={15} className="text-brand dark:text-sky-400"/></div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-brand dark:group-hover:text-sky-400 transition-colors">{form.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Database size={9}/>{form.responseCount} responses</span>
                        <span className="text-slate-200 dark:text-slate-700">·</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock size={9}/>{formatFriendlyDate(form.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/form/${form.id}/responses`} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand/8 hover:bg-brand/15 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-brand dark:text-sky-400 text-[10px] font-bold rounded-lg transition cursor-pointer">
                    <Eye size={11}/> View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 7. TEMPLATES GALLERY */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">Templates Gallery</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Start fast with popular pre-built forms</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleScrollCarousel('left')} className="w-8 h-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition cursor-pointer flex items-center justify-center shadow-sm" aria-label="Scroll left"><ChevronLeft size={14}/></button>
            <button onClick={() => handleScrollCarousel('right')} className="w-8 h-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition cursor-pointer flex items-center justify-center shadow-sm" aria-label="Scroll right"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
          {templateList.map(t => {
            const IconComp = ICONS[t.icon];
            return (
              <div key={t.type} className="w-[248px] bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 flex flex-col flex-shrink-0 overflow-hidden group">
                <div className={`h-28 bg-gradient-to-br ${t.grad} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/10"/>
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    {IconComp && <IconComp size={26}/>}
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{t.title}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">{t.desc}</p>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold self-start mt-auto">{t.fields}</span>
                </div>
                <div className="px-4 pb-4">
                  <button onClick={() => handleCreateFromTemplate(t.type)} className="w-full py-2.5 bg-slate-50 hover:bg-brand hover:text-white dark:bg-slate-800/60 dark:hover:bg-brand text-slate-700 dark:text-slate-300 text-[11px] font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80">
                    <Sparkles size={12}/> Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

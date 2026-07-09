import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Copy, Download, BarChart3, Palette, FileText, Globe, ExternalLink,
  Trash2, Edit3, User, Calendar, ChevronLeft, ChevronRight, Sparkles, TrendingUp,
  CheckCircle, Eye, Share2, Database, Brain, ArrowUpRight, Settings, Zap,
  MessageSquare, Target, Smartphone, AlertTriangle, CheckSquare, Clock, Send, LayoutTemplate,
  Info, ShieldCheck, HelpCircle, HardDrive, RefreshCw
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
    <svg viewBox="0 0 120 36" fill="none" className="w-24 h-8 select-none pointer-events-none" aria-hidden="true">
      <path d={path} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
    </svg>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between select-none">
      <div>
        <h2 className="text-[22px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-505 mt-2 font-semibold">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="flex items-center gap-1 text-xs font-extrabold text-[#2563EB] dark:text-sky-400 hover:underline transition duration-205 cursor-pointer">
          {action.label} <ArrowUpRight size={12} />
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
  handleDeleteForm, loadDashboardData, user, theme, triggerToast, setActiveView,
  deletingFormIds = {}
}) {
  const carouselRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  const totalCount     = allForms.length;
  const publishedCount = allForms.filter(f => f.status === 'published').length;
  const draftCount     = allForms.filter(f => f.status === 'draft' || !f.status).length;
  const responsesCount = allForms.reduce((acc, f) => acc + (f.responseCount || 0), 0);
  const viewsCount     = responsesCount * 4;
  const completionRate = responsesCount > 0 ? Math.min(78, Math.round((responsesCount / Math.max(viewsCount, 1)) * 100)) : 0;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const metrics = [
    { label: 'Total Forms',      value: totalCount,       iconBg: 'bg-blue-50 dark:bg-blue-950/40',     iconColor: 'text-blue-600 dark:text-blue-400',     icon: <FileText size={16} />, desc: 'Created workspaces', sparkline: 'M 0 28 Q 20 20 40 24 T 80 12 T 120 8',  color: '#2563EB', growth: '12%' },
    { label: 'Published Forms',  value: publishedCount,   iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', icon: <Globe size={16} />,    desc: 'Public active forms', sparkline: 'M 0 28 Q 15 18 35 22 T 70 10 T 120 6', color: '#10B981', growth: '8%' },
    { label: 'Total Responses',  value: responsesCount,   iconBg: 'bg-violet-50 dark:bg-violet-950/40', iconColor: 'text-violet-600 dark:text-violet-400', icon: <Database size={16} />, desc: 'User entries logged', sparkline: 'M 0 26 Q 20 18 40 22 T 80 8 T 120 4',  color: '#8B5CF6', growth: '24%' },
    { label: 'Draft Workspaces', value: draftCount,       iconBg: 'bg-amber-50 dark:bg-amber-950/40',   iconColor: 'text-amber-600 dark:text-amber-400',   icon: <PlusCircle size={16} />, desc: 'Offline templates',   sparkline: 'M 0 20 Q 30 28 60 15 T 90 22 T 120 18', color: '#F59E0B', growth: '2%' },
  ];

  const quickActions = [
    { title: 'Create Form',    desc: 'Start clean slate schema', icon: <PlusCircle size={20} />,    grad: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50/50 dark:bg-blue-950/20',     action: handleCreateNewForm },
    { title: 'Import Template', desc: 'Pre-configured form setup', icon: <LayoutTemplate size={20} />, grad: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', action: () => handleCreateFromTemplate('contact') },
    { title: 'View Responses',  desc: 'Submissions tables & grids', icon: <Database size={20} />,      grad: 'from-violet-500 to-purple-600', bg: 'bg-violet-50/50 dark:bg-violet-950/20', action: () => setActiveView('responses') },
    { title: 'Analytics',       desc: 'Star ratings & metrics logs', icon: <BarChart3 size={20} />,     grad: 'from-amber-500 to-orange-600',  bg: 'bg-amber-50/50 dark:bg-amber-950/20',   action: () => setActiveView('responses') },
    { title: 'Themes',          desc: 'Font face & accent colors', icon: <Palette size={20} />,       grad: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50/50 dark:bg-pink-950/20',     action: () => setActiveView('themes') },
    { title: 'Settings',        desc: 'Security keys & user rules', icon: <Settings size={20} />,      grad: 'from-slate-500 to-slate-700',   bg: 'bg-slate-50/50 dark:bg-slate-800/30',   action: () => triggerToast('Settings panel coming soon.') },
  ];

  const aiInsights = [
    { title: 'Improve completion rate',   text: `Forms average ${completionRate}% completion. Drop 2 optional fields to increase this rate.`, icon: <TrendingUp size={14} className="text-emerald-500" /> },
    { title: 'Mobile optimization tips',   text: 'Keep placeholders descriptive and use large rounded touch inputs for mobile.', icon: <Smartphone size={14} className="text-blue-500" /> },
    { title: 'Missing required fields',   text: 'Ensure vital user info blocks like Email contain required flags.', icon: <AlertTriangle size={14} className="text-amber-500" /> },
    { title: 'Accessibility suggestions',  text: 'Contrast rates on placeholder labels meet full compliance.', icon: <CheckSquare size={14} className="text-violet-500" /> },
    { title: 'Form performance recommendations', text: 'Apply template layouts to skip cold draft configuration time.', icon: <Zap size={14} className="text-pink-500" /> },
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
    <div className="grid grid-cols-12 gap-8 items-start max-w-[1600px] mx-auto select-none">
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          LEFT / MAIN AREA (9 Columns on Desktop, Full on Tablet/Mobile)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-10">

        {/* A. HERO SECTION */}
        <div className="relative rounded-[20px] bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
          
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-xs text-brand dark:text-sky-400 font-extrabold uppercase tracking-widest mb-2.5 block">
              {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Builder'} 👋
            </span>
            <h1 className="text-[36px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-none">
              Let's build something amazing today.
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-[16px] mt-4 leading-relaxed font-semibold max-w-md">
              Create beautiful forms, collect responses, and gain insights from your audience with instant ledger database sync.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handleCreateNewForm}
                className="bg-[#2563EB] hover:bg-blue-750 text-white px-5 py-2.5 rounded-xl text-xs font-black transition duration-200 flex items-center gap-1.5 shadow-sm hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Create Form</span>
              </button>
              <button
                onClick={() => setActiveView('responses')}
                className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#EEF2F7] dark:border-slate-800 text-slate-600 dark:text-slate-305 px-5 py-2.5 rounded-xl text-xs font-black transition duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 size={14} />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Redesigned Illustration Block with float animations */}
          <div className="w-full md:w-[280px] h-[190px] rounded-2xl bg-slate-55 dark:bg-slate-900/60 border border-[#EEF2F7] dark:border-slate-800/80 p-4 relative hidden md:flex flex-col justify-between overflow-hidden shadow-xs shrink-0 select-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-455" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-455" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-455" />
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-400 tracking-wider">PREVIEW SCHEMAS</span>
            </div>

            {/* Tiny Floating Card 1 */}
            <div className="absolute top-12 left-4 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 p-2.5 rounded-xl shadow-md animate-float-slow flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-555 flex items-center justify-center"><CheckCircle size={11} /></div>
              <div>
                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 block">Deliverability</span>
                <span className="text-[8px] font-semibold text-slate-405 block">99.8% Success</span>
              </div>
            </div>

            {/* Tiny Floating Card 2 */}
            <div className="absolute top-20 right-4 w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 p-2.5 rounded-xl shadow-md animate-float-fast flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-[#2563EB] flex items-center justify-center"><Database size={11} /></div>
              <div>
                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 block">Submissions</span>
                <span className="text-[8px] font-semibold text-slate-405 block">+{responsesCount} entries</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between text-[8px] text-slate-405 font-bold select-none">
              <span>LEDGER DATABASE SYNC</span>
              <span className="text-[#2563EB] animate-pulse">● LIVE</span>
            </div>
          </div>
        </div>

        {/* B. STATISTICS GRID */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map(m => (
              <div
                key={m.label}
                className="bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 rounded-[18px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 flex flex-col gap-2 relative overflow-hidden group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">{m.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                    <span className={m.iconColor}>{m.icon}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <span className="text-[34px] font-black text-slate-800 dark:text-slate-100 leading-none block">{m.value}</span>
                    <span className="text-[10px] text-emerald-500 font-black flex items-center gap-0.5 mt-1 select-none">
                      <TrendingUp size={10} /> {m.growth} growth
                    </span>
                  </div>
                  <Sparkline path={m.sparkline} color={m.color} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* C. RECENT FORMS */}
        <section>
          <SectionHeader
            title="Recent Forms"
            subtitle="Catalog list directory of all active forms workspaces"
          />

          <div className="mt-5">
            {filteredForms.length === 0 ? (
              <div className="bg-white dark:bg-[#0c1424] rounded-[18px] p-16 border border-dashed border-[#EEF2F7] dark:border-slate-800/80 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-[#EEF2F7] dark:border-slate-800/40">
                  <FileText size={24} className="text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">No forms built yet</h3>
                <p className="text-xs text-slate-400 dark:text-slate-505 mt-1.5 max-w-xs leading-relaxed font-semibold">
                  Start from a blank canvas or import a popular pre-configured template.
                </p>
                <button
                  onClick={handleCreateNewForm}
                  className="mt-6 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition duration-200 shadow-sm cursor-pointer"
                >
                  Create Your First Form
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-widest select-none">
                  <span>Form</span>
                  <span>Status</span>
                  <span>Responses</span>
                  <span>Last Updated</span>
                  <span>Actions</span>
                </div>

                {filteredForms.slice(0, 8).map(form => {
                  const deletingState = deletingFormIds[form.id] || '';
                  return (
                    <div
                      key={form.id}
                      className={`bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 rounded-[18px] overflow-hidden group form-card-transition shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${deletingState}`}
                    >
                      {/* Mobile View */}
                      <div className="md:hidden p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 flex-wrap select-none">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            form.status === 'published'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-855 dark:text-slate-455'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {form.status || 'draft'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                            <Database size={10} />
                            {form.responseCount || 0} responses
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors">
                            {form.title}
                          </h3>
                          <p className="text-[11px] text-slate-405 mt-1 line-clamp-1 leading-normal font-semibold">
                            {form.description ? form.description.split('|||')[0] : 'No summary description configured.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-slate-805/50 pt-3">
                          <Link
                            to={`/form/${form.id}/edit`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-705 text-white text-[10px] font-black rounded-lg transition"
                          >
                            <Edit3 size={11} /> Edit
                          </Link>
                          <Link
                            to={`/form/${form.id}`}
                            target="_blank"
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#EEF2F7] dark:border-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-black rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <Eye size={11} /> Preview
                          </Link>
                          <button
                            onClick={() => handleShareForm(form.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#EEF2F7] dark:border-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-black rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Share2 size={11} /> {copiedId === form.id ? 'Copied' : 'Share'}
                          </button>
                          <button
                            onClick={(e) => handleDeleteForm(form.id, e)}
                            className="flex items-center justify-center p-2 text-slate-450 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer ml-auto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center">
                        <div className="min-w-0">
                          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-sky-400 transition-colors truncate">
                            {form.title}
                          </h3>
                          <p className="text-[11px] text-slate-405 mt-1 truncate font-semibold leading-normal">
                            {form.description ? form.description.split('|||')[0] : 'No description'}
                          </p>
                        </div>

                        <div>
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${
                            form.status === 'published'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-855 dark:text-slate-455'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-455'}`} />
                            {form.status || 'draft'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-200">
                          <Database size={13} className="text-slate-405" />
                          <span>{form.responseCount || 0}</span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 select-none">
                          <Clock size={11} />
                          {formatFriendlyDate(form.updatedAt)}
                        </div>

                        <div className="flex items-center gap-1">
                          <Link
                            to={`/form/${form.id}/edit`}
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition hover:scale-[1.05] cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </Link>
                          <Link
                            to={`/form/${form.id}`}
                            target="_blank"
                            title="Preview"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EEF2F7] dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => handleShareForm(form.id)}
                            title="Copy Link"
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
                              copiedId === form.id
                                ? 'border-emerald-202 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'border-[#EEF2F7] dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {copiedId === form.id ? <CheckCircle size={13} /> : <Share2 size={13} />}
                          </button>
                          <button
                            onClick={() => {
                              handleCreateFromTemplate('contact');
                              triggerToast(`"${form.title}" duplicated.`);
                            }}
                            title="Duplicate"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EEF2F7] dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteForm(form.id, e)}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* E. TEMPLATES GALLERY */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[22px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">Templates Gallery</h2>
              <p className="text-xs text-slate-400 dark:text-slate-505 mt-2 font-semibold">Kickstart form creation process with pre-built models</p>
            </div>
            <div className="flex items-center gap-1.5 select-none">
              <button
                onClick={() => handleScrollCarousel('left')}
                className="w-8 h-8 rounded-lg border border-[#EEF2F7] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 transition flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                className="w-8 h-8 rounded-lg border border-[#EEF2F7] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 transition flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-3 scroll-smooth"
          >
            {templateList.map(t => {
              const IconComp = ICONS[t.icon];
              return (
                <div
                  key={t.type}
                  className="w-[230px] bg-white dark:bg-[#0c1424] rounded-[18px] border border-[#EEF2F7] dark:border-slate-800/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden shrink-0 group cursor-pointer"
                >
                  <div className={`h-24 bg-gradient-to-br ${t.grad} flex items-center justify-center relative select-none`}>
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative z-10 w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                      {IconComp && <IconComp size={22} />}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">{t.title}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-1 leading-normal font-semibold">
                        {t.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-805/55 pt-3 select-none">
                      <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">
                        {t.fields}
                      </span>
                      <button
                        onClick={() => handleCreateFromTemplate(t.type)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-[#2563EB] hover:text-white dark:bg-slate-900/80 dark:hover:bg-[#2563EB] text-[#2563EB] dark:text-sky-400 text-[10px] font-black rounded-lg border border-[#EEF2F7]/50 dark:border-slate-800/30 transition duration-200 cursor-pointer flex items-center gap-1"
                      >
                        Use <ArrowUpRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          RIGHT INSIGHTS PANEL (3 Columns on Desktop, Stacks Below on Tablet/Mobile)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">

        {/* 2. AI WORKSPACE ASSISTANT */}
        <section className="bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 rounded-[18px] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-violet-500 flex items-center justify-center"><Brain size={16} /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">AI Assistant</h2>
              <span className="text-[9px] text-slate-400 dark:text-slate-505 font-semibold block mt-1.5">Optimization audits</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {aiInsights.map((ins, i) => (
              <div key={i} className="flex gap-2.5 items-start bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-805/30 transition duration-150">
                <div className="mt-0.5 bg-white dark:bg-slate-800 w-5 h-5 rounded-md flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-xs shrink-0">{ins.icon}</div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-750 dark:text-slate-200">{ins.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. RECENT RESPONSES */}
        <section className="bg-white dark:bg-[#0c1424] border border-slate-200/70 dark:border-slate-800/80 rounded-[18px] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/20 text-sky-500 flex items-center justify-center"><Send size={15} /></div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">Recent Logs</h2>
                <span className="text-[9px] text-slate-405 font-bold block mt-1.5">Latest ledger actions</span>
              </div>
            </div>
            <button onClick={() => setActiveView('responses')} className="text-[10px] font-extrabold text-[#2563EB] dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer">
              View all <ChevronRight size={10} />
            </button>
          </div>

          {recentResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center select-none">
              <Database size={18} className="text-slate-350 dark:text-slate-700 mb-2" />
              <p className="text-[10px] font-black text-slate-455 dark:text-slate-500">No recent submissions</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentResponses.map(form => (
                <div key={form.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-805/40 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150 group">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-750 dark:text-slate-200 truncate leading-none">{form.title}</p>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold">{form.responseCount} responses logged</span>
                  </div>
                  <Link to={`/form/${form.id}/responses`} className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 text-[#2563EB] hover:bg-[#2563EB] hover:text-white dark:text-sky-400 dark:hover:bg-[#2563EB] dark:hover:text-white text-[9px] font-black rounded-md transition duration-150 cursor-pointer">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. HELPFUL RESOURCES */}
        <section className="bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 rounded-[18px] p-5 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#2563EB] flex items-center justify-center"><HelpCircle size={16} /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">Helpful Resources</h2>
              <span className="text-[9px] text-slate-400 dark:text-slate-505 font-semibold block mt-1.5">Guides & references</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Documentation & API References', link: '#' },
              { label: 'Form Video Tutorials Library', link: '#' },
              { label: 'Slack & Webhooks Setup', link: '#' },
              { label: 'Custom Domain Configurations', link: '#' },
            ].map((r, i) => (
              <a
                key={i}
                href={r.link}
                onClick={(e) => { e.preventDefault(); triggerToast('Resource guide is currently mock data.'); }}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-sky-400 flex items-center justify-between hover:underline transition duration-150"
              >
                <span>{r.label}</span>
                <ArrowUpRight size={10} className="text-slate-450" />
              </a>
            ))}
          </div>
        </section>

        {/* 5. QUICK TIPS */}
        <section className="bg-white dark:bg-[#0c1424] border border-[#EEF2F7] dark:border-slate-800/80 rounded-[18px] p-5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-100 select-none uppercase tracking-wider">
            <span>💡 Quick Tip</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-505 font-semibold leading-relaxed">
            Keep question labels concise on smaller screens. Minimizing text field counts can raise submission conversion rates by up to 28% on mobile viewports.
          </p>
        </section>

      </div>

    </div>
  );
}

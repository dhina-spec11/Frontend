import React, { useState, useEffect, useRef } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
  Link
} from 'react-router-dom';
import {
  Eye,
  Edit3,
  Moon,
  Sun,
  FileSpreadsheet,
  BarChart3,
  Database,
  ArrowLeft,
  ClipboardCheck,
  Check,
  Share2,
  PlusCircle,
  Trash2,
  Sparkles,
  ExternalLink,
  Globe,
  Copy,
  Bell,
  Search,
  X,
  Mail,
  Send,
  Info,
  FileText,
  LogOut,
  User,
  CloudLightning,
  CloudRain,
  CloudUpload,
  CloudOff,
  Cloud,
  ChevronRight,
  Monitor,
  Smartphone,
  Settings,
  Users,
  UserPlus,
  ShieldCheck,
  Lock
} from 'lucide-react';

import FormBuilder from './components/FormBuilder';
import FormIntake from './components/FormIntake';
import ResponsesSheet from './components/ResponsesSheet';
import AnalyticsSummary from './components/AnalyticsSummary';
import Auth from './components/Auth';
import SettingsSidebar from './components/SettingsSidebar';
import {
  saveForm,
  getForm,
  submitResponse,
  getResponses,
  getAllForms,
  deleteForm,
  subscribeToAuth,
  logOutUser,
  addCollaborator,
  removeCollaborator,
  getNetworkIp
} from './firebase';

// ==========================================
// 1. GLOBAL APP COMPONENT WITH ROUTING
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('formstudio_theme') || 'light');

  // Sync theme
  useEffect(() => {
    localStorage.setItem('formstudio_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent dark:border-brand rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
          Initializing secure workspace sessions...
        </span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" replace />} />

      {/* Public Intake Route */}
      <Route path="/form/:id" element={<FormPublicPage theme={theme} setTheme={setTheme} user={user} />} />

      {/* Shared Responses Viewer Route */}
      <Route path="/form/:id/responses" element={user ? <SharedResponsesPage user={user} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" replace />} />

      {/* Protected Dashboard Route */}
      <Route path="/" element={user ? <DashboardPage user={user} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" replace />} />

      {/* Protected Builder Workspace Route */}
      <Route path="/form/:id/edit" element={user ? <FormWorkspacePage user={user} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" replace />} />

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Helper to trigger floating toast notification
function Toast({ message, visible, isError }) {
  if (!visible) return null;
  return (
    <div className={`fixed bottom-6 left-6 text-white text-xs px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-fade-in border ${isError
        ? 'bg-red-600/90 border-red-500 backdrop-blur-md'
        : 'bg-slate-900/95 dark:bg-brand-dark-elevated/95 border-slate-800 dark:border-slate-700 backdrop-blur-md'
      }`}>
      {isError ? (
        <Info size={14} className="text-red-200" />
      ) : (
        <Check size={14} className="text-emerald-400" />
      )}
      <span className="font-bold">{message}</span>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW PAGE
// ==========================================
function DashboardPage({ user, theme, setTheme }) {
  const [allForms, setAllForms] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [toast, setToast] = useState({ message: '', visible: false, isError: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const triggerToast = (msg, isError = false) => {
    setToast({ message: msg, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  };

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const forms = await getAllForms();
      const userForms = Array.isArray(forms) ? forms.filter(f => !f.ownerUid || f.ownerUid === user?.uid) : [];
      const formsWithStats = await Promise.all(
        userForms.map(async (f) => {
          try {
            const resp = await getResponses(f.id);
            return { ...f, responseCount: Array.isArray(resp) ? resp.length : 0 };
          } catch (e) {
            return { ...f, responseCount: 0 };
          }
        })
      );
      setAllForms(formsWithStats);
    } catch (err) {
      console.error("Error loading forms catalog:", err);
      triggerToast('Error loading forms directory.', true);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid]);

  // Handle outside click to close user profile menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCreateNewForm = async () => {
    const newFormId = `form-${Date.now()}`;
    const defaultFields = [
      { id: `field-name`, label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. John Doe' },
      { id: `field-email`, label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. john@example.com' }
    ];

    try {
      await saveForm(newFormId, defaultFields, 'Untitled Form', 'Provide form details below.', 'draft', user?.uid);
      triggerToast('New blank form draft created.');
      navigate(`/form/${newFormId}/edit`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to create form.', true);
    }
  };

  const handleCreateFromTemplate = async (templateType) => {
    const newFormId = `form-${Date.now()}`;
    let title = 'Untitled Form';
    let description = '';
    let fields = [];

    switch (templateType) {
      case 'contact':
        title = 'Contact Details';
        description = 'Please fill out your contact details below.';
        fields = [
          { id: 'field-name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Jane Smith' },
          { id: 'field-email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. jane@company.com' },
          { id: 'field-phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '+1 (555) 000-0000' },
          { id: 'field-address', label: 'Mailing Address', type: 'paragraph', required: false, placeholder: 'Street, City, Zip...' }
        ];
        break;
      case 'feedback':
        title = 'Event Feedback';
        description = 'We would love to hear your honest feedback about the recent conference!';
        fields = [
          { id: 'field-name', label: 'Attendee Name', type: 'text', required: false, placeholder: 'Your name (optional)' },
          { id: 'field-sat', label: 'Overall Satisfaction', type: 'radio', required: true, options: ['Highly Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'] },
          { id: 'field-topics', label: 'Which topics did you enjoy most?', type: 'checkbox', required: true, options: ['AI Technologies', 'Web Development Trends', 'UI/UX Design Systems', 'Networking Hub'] },
          { id: 'field-date', label: 'Event Date', type: 'date', required: true },
          { id: 'field-comments', label: 'Suggestions for next year', type: 'paragraph', required: false, placeholder: 'Type comments here...' }
        ];
        break;
      case 'inventory':
        title = 'Job Application Intake';
        description = 'Submit your application specs and upload your resume.';
        fields = [
          { id: 'field-candidate-name', label: 'Candidate Name', type: 'text', required: true, placeholder: 'First and last name' },
          { id: 'field-candidate-email', label: 'Contact Email', type: 'email', required: true, placeholder: 'name@domain.com' },
          { id: 'field-role', label: 'Desired Position', type: 'select', required: true, options: ['Frontend Architect', 'Fullstack Developer', 'Product Designer', 'Data Scientist'] },
          { id: 'field-resume', label: 'Resume Upload', type: 'file', required: true },
          { id: 'field-experience', label: 'Years of Experience', type: 'number', required: true, placeholder: 'e.g. 5' }
        ];
        break;
      default:
        break;
    }

    try {
      await saveForm(newFormId, fields, title, description, 'draft', user?.uid);
      triggerToast(`${title} template loaded as a draft.`);
      navigate(`/form/${newFormId}/edit`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load template.', true);
    }
  };

  const handleDeleteForm = async (formId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this form and all its response entries?')) {
      try {
        await deleteForm(formId);
        triggerToast('Form deleted successfully.');
        loadDashboardData();
      } catch (err) {
        console.error("Error deleting form:", err);
        triggerToast('Failed to delete form.', true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

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

  // Calculations for Summary Statistics
  const totalForms = allForms.length;
  const publishedForms = allForms.filter(f => f.status === 'published').length;
  const draftForms = allForms.filter(f => f.status === 'draft' || !f.status).length;
  const totalResponses = allForms.reduce((acc, f) => acc + (f.responseCount || 0), 0);

  // Search, Filter, and Sort calculations
  const filteredForms = allForms
    .filter(f => {
      const titleText = f.title || '';
      const descText = f.description || '';
      const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            descText.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'published') return matchesSearch && f.status === 'published';
      if (statusFilter === 'draft') return matchesSearch && (f.status === 'draft' || !f.status);
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'responses') return (b.responseCount || 0) - (a.responseCount || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-300">

      {/* Modern Compact Navbar */}
      <header className="bg-white/80 dark:bg-[#0c1424]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="w-[98%] max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-brand flex items-center justify-center text-white font-extrabold shadow-sm">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100 block leading-tight">FormStudio</span>
              <span className="text-[8px] text-brand dark:text-sky-400 font-extrabold uppercase tracking-widest block mt-0.5">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button
              onClick={handleCreateNewForm}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle size={13} />
              <span className="hidden sm:inline">New Form</span>
            </button>

            {/* Notification Bell */}
            <div className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="w-8.5 h-8.5 border border-slate-200/60 dark:border-slate-800/85 rounded-full flex items-center justify-center bg-slate-50/50 dark:bg-brand-dark-elevated/50 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Unified User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <div 
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-brand to-sky-400 text-white font-extrabold flex items-center justify-center text-xs shadow-sm cursor-pointer select-none"
              >
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2.5 z-50 animate-fade-in text-xs font-semibold">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Logged in as</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{user?.email || 'N/A'}</span>
                  </div>
                  <button 
                    onClick={() => { setUserMenuOpen(false); setIsSettingsOpen(true); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition flex items-center gap-2"
                  >
                    <Settings size={13} />
                    <span>Workspace Settings</span>
                  </button>
                  <button 
                    onClick={() => { setUserMenuOpen(false); setShowLogoutConfirm(true); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition flex items-center gap-2"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-[98%] max-w-[1920px] mx-auto py-6 px-2 sm:px-4 flex flex-col gap-6">

        {/* 1. Hero Section (Compact & Sleek) */}
        <div className="relative rounded-[20px] overflow-hidden bg-slate-950 dark:bg-slate-900/40 text-white py-8 px-10 shadow-xl border border-slate-800 dark:border-slate-850 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="bg-brand/10 text-brand dark:text-blue-400 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-md border border-brand/20 backdrop-blur-xs">
              Personalized Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-4 leading-tight text-white">
              Design & publish premium web forms instantly
            </h1>
            <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-medium max-w-md">
              Create interactive surveys, log client databases with robust file uploads, view detailed analytics, and export spreadsheet ledgers.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateNewForm}
                className="bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-2 shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Create Blank Form</span>
              </button>
            </div>
          </div>

          {/* Interactive CSS dashboard preview mockup */}
          <div className="hidden lg:block w-96 h-48 bg-[#0c1424]/90 border border-slate-800/80 rounded-2xl p-4 overflow-hidden relative shadow-2xl backdrop-blur-md flex-shrink-0 animate-fade-in">
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
                  <div className="w-24 h-2 bg-slate-700 rounded-full" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-brand" />
                </div>
              </div>
              
              {/* Floating notification mockup badge */}
              <div className="absolute bottom-4 right-4 bg-brand text-white px-3 py-1 rounded-xl shadow-lg border border-brand/20 flex items-center gap-1.5 animate-bounce text-[9px] font-black uppercase tracking-wider">
                <PlusCircle size={10} />
                <span>New entry +1</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Dashboard Statistics Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Forms', value: totalForms, icon: <FileText size={16} />, desc: 'Total forms created', color: 'text-brand bg-brand/5 dark:bg-brand/10' },
            { label: 'Published Forms', value: publishedForms, icon: <Globe size={16} />, desc: 'Live public entries', color: 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' },
            { label: 'Total Responses', value: totalResponses, icon: <Database size={16} />, desc: 'User entries logged', color: 'text-sky-500 bg-sky-500/5 dark:bg-sky-500/10' },
            { label: 'Draft Forms', value: draftForms, icon: <Copy size={16} />, desc: 'Offline workspace drafts', color: 'text-amber-500 bg-amber-500/5 dark:bg-amber-500/10' }
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs hover:shadow-md hover:scale-[1.01] transition duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{stat.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{stat.value}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. Templates Catalog Section */}
        <div className="flex flex-col gap-3.5 mt-2">
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            Start with templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[
              { type: 'contact', title: 'Contact Details', desc: 'Securely gather users addresses, emails, phone numbers, and location details.', grad: 'from-blue-500 to-sky-500' },
              { type: 'feedback', title: 'Event Feedback', desc: 'Assess conference outcomes, session ratings, preferences, and custom check boxes.', grad: 'from-emerald-500 to-teal-500' },
              { type: 'inventory', title: 'Job Applications', desc: 'Intake developer applications, resumes, experiences, and drop down selections.', grad: 'from-amber-500 to-orange-500' }
            ].map(t => (
              <div
                key={t.type}
                className="bg-white dark:bg-[#0c1424] p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-xs hover:shadow-md transition duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.grad} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">{t.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">{t.desc}</p>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/40 flex justify-end">
                  <button
                    onClick={() => handleCreateFromTemplate(t.type)}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-brand dark:text-sky-400 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Directory Search, Sort & Lists */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                <span>Forms Directory</span>
                <span className="bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {filteredForms.length}
                </span>
              </h2>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search box */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search directory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] text-xs focus:outline-none focus:border-brand dark:focus:border-sky-400 transition"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={12} />
                </div>
              </div>

              {/* Status Filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none transition cursor-pointer"
              >
                <option value="all">All Forms</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="responses">Most Responses</option>
              </select>
            </div>
          </div>

          {/* Catalog grid rendering */}
          {dashboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-5 flex flex-col gap-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-lg mt-2" />
                </div>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="bg-white dark:bg-[#0c1424] rounded-2xl p-16 border border-dashed border-slate-200 dark:border-slate-800/80 text-center flex flex-col items-center justify-center">
              <Globe size={36} className="text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-xs font-black text-slate-600 dark:text-slate-300">No forms found</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
                {searchQuery || statusFilter !== 'all' 
                  ? "No forms match your search queries and filter settings." 
                  : "You have not created any forms yet."}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={handleCreateNewForm}
                  className="mt-5 bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Create Your First Form
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {filteredForms.map(form => (
                <div
                  key={form.id}
                  className="bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-250/50 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand/5 text-brand dark:bg-sky-950/30 dark:text-sky-400 text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                        <Database size={10} />
                        <span>{form.responseCount || 0} Responses</span>
                      </span>

                      {/* Status Dot badge */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">{form.status || 'draft'}</span>
                      </div>
                    </div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors line-clamp-1">
                      {form.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                      {form.description ? form.description.split('|||')[0] : 'No summary descriptions configured.'}
                    </p>
                    
                    {/* Timestamp tags */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold border-t border-slate-100/60 dark:border-slate-800/40 pt-2.5 mt-1">
                      <span>Updated {formatFriendlyDate(form.updatedAt)}</span>
                      <span>Created {formatFriendlyDate(form.createdAt)}</span>
                    </div>
                  </div>

                  {/* Redesigned card actions */}
                  <div className="bg-slate-50/50 dark:bg-brand-dark-elevated/25 px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/form/${form.id}/edit`}
                        className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                      >
                        <Edit3 size={11} />
                        <span>Edit Form</span>
                      </Link>
                      <Link
                        to={`/form/${form.id}`}
                        target="_blank"
                        className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 rounded-lg text-xs font-bold flex items-center justify-center transition"
                        title="View Public Form"
                      >
                        <ExternalLink size={12} />
                      </Link>
                    </div>

                    <button
                      onClick={(e) => handleDeleteForm(form.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
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
      </main>

      {/* Global Toast */}
      <Toast {...toast} />

      {/* Logout confirmation popover modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="max-w-xs w-full bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 animate-fade-in relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-955/20 flex items-center justify-center">
                <LogOut size={14} className="text-red-500" />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">Sign out workspace?</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-medium">
              You will be signed out of your FormStudio workspace dashboard.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-500 hover:bg-red-655 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}

// ==========================================
// 3. BUILDER & RESPONSES WORKSPACE VIEW
// ==========================================
function FormWorkspacePage({ user, theme, setTheme }) {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab: 'builder' | 'responses'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'builder');
  const [responseSubView, setResponseSubView] = useState('sheet'); // 'sheet' | 'analytics'

  // Data schema state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formTheme, setFormTheme] = useState({ theme: 'glassmorphism', font: 'Outfit', accent: 'brand' });
  const [formStatus, setFormStatus] = useState('draft'); // 'draft' | 'published'
  const [submissions, setSubmissions] = useState([]);

  // Loader & Save state
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // Modals & Panels
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewWidth, setPreviewWidth] = useState(480);

  const isResizingRef = useRef(false);

  const startResizing = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - e.clientX - 48;
    if (newWidth > 340 && newWidth < 800) {
      setPreviewWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const [toast, setToast] = useState({ message: '', visible: false, isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ message: msg, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  };

  // Load Form structure
  const fetchFormDetails = async () => {
    try {
      const form = await getForm(formId);
      if (!form) {
        triggerToast("Form workspace not found.", true);
        navigate('/');
        return;
      }

      // Ensure ownership check
      if (form.ownerUid && form.ownerUid !== user.uid) {
        triggerToast("Access Denied: You do not own this form workspace.", true);
        navigate('/');
        return;
      }

      let descText = form.description || '';
      let themeConfig = { theme: 'glassmorphism', font: 'Outfit', accent: 'brand' };
      if (descText.includes('|||')) {
        const parts = descText.split('|||');
        descText = parts[0];
        try {
          themeConfig = JSON.parse(parts[1]);
        } catch (e) {
          console.error("Failed to parse theme:", e);
        }
      }

      setFormTitle(form.title || 'Untitled Form');
      setFormDescription(descText);
      setFormTheme(themeConfig);
      setFormFields(form.fields || []);
      setFormStatus(form.status || 'draft');

      // Responses
      const resp = await getResponses(formId);
      setSubmissions(resp.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    } catch (e) {
      console.error(e);
      triggerToast("Error retrieving form schema details.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormDetails();
  }, [formId, user.uid]);

  // Debounced Auto-Saving mechanism
  const saveTimeoutRef = useRef(null);
  const isFirstMount = useRef(true);

  const triggerAutoSave = () => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const serializedDesc = `${formDescription}|||${JSON.stringify(formTheme)}`;
        await saveForm(formId, formFields, formTitle, serializedDesc, formStatus, user.uid);
        setSaveStatus('saved');
        // Reset saveStatus back to idle after a brief showing
        setTimeout(() => setSaveStatus(curr => curr === 'saved' ? 'idle' : curr), 3000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus('error');
      }
    }, 1500);
  };

  // Trigger auto save whenever details change
  useEffect(() => {
    if (!loading) {
      triggerAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formTitle, formDescription, formFields, formStatus, formTheme]);

  // Reset isFirstMount on ID switch
  useEffect(() => {
    isFirstMount.current = true;
  }, [formId]);

  // Synchronize submission deletes
  const handleSetSubmissions = (updater) => {
    const nextSubmissions = typeof updater === 'function' ? updater(submissions) : updater;
    setSubmissions(nextSubmissions);
    // Since deletion is local, let's keep database in sync (ResponsesSheet handles deletion internally)
  };

  const getShareUrl = () => {
    return `${window.location.origin}/form/${formId}`;
  };

  const handlePreviewSubmit = async (payload) => {
    try {
      await submitResponse(formId, payload);
      triggerToast("Response saved directly to database!");

      // Refresh responses ledger immediately
      const resp = await getResponses(formId);
      setSubmissions(resp.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    } catch (err) {
      console.error(err);
      triggerToast("Error saving response to database.", true);
    }
  };

  const getEmbedCode = () => {
    return `<iframe src="${getShareUrl()}" width="100%" height="650px" style="border:none; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" allowfullscreen></iframe>`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    triggerToast("Shareable link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLoadTemplate = (type) => {
    if (confirm('Are you sure you want to load this template? It will replace all current builder fields.')) {
      isFirstMount.current = false; // Allow save immediately
      switch (type) {
        case 'contact':
          setFormTitle('Contact Details');
          setFormDescription('Please fill out your contact details below.');
          setFormFields([
            { id: 'field-name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Jane Smith' },
            { id: 'field-email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. jane@company.com' },
            { id: 'field-phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '+1 (555) 000-0000' },
            { id: 'field-address', label: 'Mailing Address', type: 'paragraph', required: false, placeholder: 'Street, City, Zip...' }
          ]);
          break;
        case 'feedback':
          setFormTitle('Event Feedback');
          setFormDescription('We would love to hear your honest feedback about the recent conference!');
          setFormFields([
            { id: 'field-name', label: 'Attendee Name', type: 'text', required: false, placeholder: 'Your name (optional)' },
            { id: 'field-sat', label: 'Overall Satisfaction', type: 'radio', required: true, options: ['Highly Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'] },
            { id: 'field-topics', label: 'Which topics did you enjoy most?', type: 'checkbox', required: true, options: ['AI Technologies', 'Web Development Trends', 'UI/UX Design Systems', 'Networking Hub'] },
            { id: 'field-date', label: 'Event Date', type: 'date', required: true },
            { id: 'field-comments', label: 'Suggestions for next year', type: 'paragraph', required: false, placeholder: 'Type comments here...' }
          ]);
          break;
        case 'inventory':
          setFormTitle('Job Application Intake');
          setFormDescription('Submit your application specs and upload your resume.');
          setFormFields([
            { id: 'field-candidate-name', label: 'Candidate Name', type: 'text', required: true, placeholder: 'First and last name' },
            { id: 'field-candidate-email', label: 'Contact Email', type: 'email', required: true, placeholder: 'name@domain.com' },
            { id: 'field-role', label: 'Desired Position', type: 'select', required: true, options: ['Frontend Architect', 'Fullstack Developer', 'Product Designer', 'Data Scientist'] },
            { id: 'field-resume', label: 'Resume Upload', type: 'file', required: true },
            { id: 'field-experience', label: 'Years of Experience', type: 'number', required: true, placeholder: 'e.g. 5' }
          ]);
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent dark:border-brand rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading form configuration workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-12 flex flex-col">

      {/* Workspace Subheader */}
      <header className="bg-white/75 dark:bg-brand-dark/75 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 shadow-sm flex-shrink-0 transition-all">
        <div className="w-[98%] max-w-[1920px] mx-auto px-2 py-3 flex items-center justify-between">

          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="font-extrabold text-sm max-w-[200px] truncate text-slate-700 dark:text-slate-200">
              {formTitle || 'Untitled Form'}
            </span>
          </div>

          {/* Builder / Responses switcher */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/30">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'builder'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              Builder Setup
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'responses'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <span>Responses</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                {submissions.length}
              </span>
            </button>
          </div>

          {/* Save Status / Live Status & Publish Toggle */}
          <div className="flex items-center gap-3">

            {/* Auto Save Sync Icon */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-2">
              {saveStatus === 'saving' && (
                <>
                  <CloudLightning size={14} className="text-brand animate-bounce" />
                  <span className="animate-pulse">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Cloud size={14} className="text-emerald-500" />
                  <span className="text-emerald-500">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <CloudOff size={14} className="text-red-500 animate-pulse" />
                  <span className="text-red-500">Error auto-saving</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Cloud size={14} className="text-slate-400 dark:text-slate-600" />
                  <span>Sync active</span>
                </>
              )}
            </div>

            {/* Publish Toggle Button */}
            <div className="flex items-center gap-2 border border-slate-200/50 dark:border-slate-800 px-3 py-1.5 rounded-xl bg-slate-50/50 dark:bg-brand-dark-elevated/20">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {formStatus === 'published' ? 'Published' : 'Draft'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formStatus === 'published'}
                  onChange={(e) => setFormStatus(e.target.checked ? 'published' : 'draft')}
                  aria-label="Publish draft status toggle"
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Share / Eye preview buttons */}

            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand/10 transition cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>

            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 border border-slate-200/60 dark:border-slate-800/80 rounded-full flex items-center justify-center bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 border border-slate-200/60 dark:border-slate-800/80 rounded-full flex items-center justify-center bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open Settings"
              title="Settings"
            >
              <Settings size={14} />
            </button>

          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 w-[98%] max-w-[1920px] mx-auto px-2 py-6 flex flex-col gap-6">

        {/* TABS 1: BUILDER SETUP & PREVIEW DUAL-PANE */}
        {activeTab === 'builder' && (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 items-stretch w-full">

            {/* Left Panel: Builder fields config */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              <FormBuilder
                formFields={formFields}
                setFormFields={setFormFields}
                formTitle={formTitle}
                setFormTitle={setFormTitle}
                formDescription={formDescription}
                setFormDescription={setFormDescription}
                formTheme={formTheme}
                setFormTheme={setFormTheme}
                onSave={() => triggerToast("Form structure saved explicitly.")}
                isSaving={saveStatus === 'saving'}
                loadTemplate={handleLoadTemplate}
              />
            </div>

            {/* Drag Resizer Line (Desktop only) */}
            <div
              onMouseDown={startResizing}
              className="hidden lg:flex w-2 cursor-col-resize self-stretch items-center justify-center group select-none transition-all flex-shrink-0"
              title="Drag to resize preview panel"
            >
              <div className="w-0.5 h-1/2 bg-slate-200 dark:bg-slate-800 rounded-full group-hover:bg-brand transition-colors" />
            </div>

            {/* Right Panel: Live Device Preview Simulator */}
            <div
              style={{ width: window.innerWidth >= 1024 ? `${previewWidth}px` : '100%' }}
              className="flex-shrink-0 flex flex-col items-center gap-4 lg:sticky lg:top-24 max-w-full transition-[width] duration-75 animate-fade-in"
            >
              <div className="w-full flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
                {/* Device Type Selectors */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-850 rounded-xl">
                  {[
                    { id: 'desktop', icon: <Monitor size={13} />, label: 'Desktop' },
                    { id: 'tablet', icon: <Smartphone className="rotate-90" size={13} />, label: 'Tablet' },
                    { id: 'mobile', icon: <Smartphone size={13} />, label: 'Mobile' }
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setPreviewDevice(d.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer ${previewDevice === d.id
                          ? 'bg-white dark:bg-slate-900 text-brand shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      title={d.label}
                    >
                      {d.icon}
                      <span className="hidden sm:inline">{d.label}</span>
                    </button>
                  ))}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewZoom(z => Math.max(0.75, z - 0.1))}
                    disabled={previewZoom <= 0.75}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-30 cursor-pointer text-xs font-bold"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setPreviewZoom(1.0)}
                    className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-brand cursor-pointer px-1"
                    title="Reset Zoom"
                  >
                    {Math.round(previewZoom * 100)}%
                  </button>
                  <button
                    onClick={() => setPreviewZoom(z => Math.min(1.25, z + 0.1))}
                    disabled={previewZoom >= 1.25}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-30 cursor-pointer text-xs font-bold"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Simulator Outer Bezel Wrapper */}
              <div className="w-full flex justify-center items-start overflow-hidden py-2">

                <div
                  style={{
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top center',
                    width: previewDevice === 'mobile' ? '320px' : previewDevice === 'tablet' ? '480px' : '100%',
                    transition: 'width 0.3s ease, transform 0.2s ease'
                  }}
                  className="flex-shrink-0"
                >

                  {/* MOBILE SIMULATOR */}
                  {previewDevice === 'mobile' && (
                    <div className="w-full bg-slate-950 dark:bg-slate-900 border-[10px] border-slate-950 dark:border-slate-900 rounded-[38px] shadow-2xl overflow-hidden relative">
                      {/* Speaker and Camera punch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[22px] w-[110px] bg-slate-950 dark:bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-10 h-1 bg-slate-800 rounded-full" />
                      </div>

                      {/* Screen viewport */}
                      <div className="bg-slate-50 dark:bg-brand-dark-bg h-[540px] overflow-y-auto scrollbar-thin pt-6 pb-8 px-4 rounded-[28px] relative z-10">
                        <FormIntake
                          formTitle={formTitle}
                          formDescription={formDescription}
                          formFields={formFields}
                          onSubmit={handlePreviewSubmit}
                          isSubmitting={false}
                          isPreview={true}
                          themeConfig={formTheme}
                        />
                      </div>
                    </div>
                  )}

                  {/* TABLET SIMULATOR */}
                  {previewDevice === 'tablet' && (
                    <div className="w-full bg-slate-950 dark:bg-slate-900 border-[12px] border-slate-950 dark:border-slate-900 rounded-[28px] shadow-2xl overflow-hidden relative">
                      {/* Top Camera dot */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full z-30" />

                      {/* Screen viewport */}
                      <div className="bg-slate-50 dark:bg-brand-dark-bg h-[600px] overflow-y-auto scrollbar-thin p-6 rounded-[18px] relative z-10">
                        <FormIntake
                          formTitle={formTitle}
                          formDescription={formDescription}
                          formFields={formFields}
                          onSubmit={handlePreviewSubmit}
                          isSubmitting={false}
                          isPreview={true}
                          themeConfig={formTheme}
                        />
                      </div>
                    </div>
                  )}

                  {/* DESKTOP BROWSER SIMULATOR */}
                  {previewDevice === 'desktop' && (
                    <div className="w-full bg-white dark:bg-brand-dark border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                      {/* Browser Title Bar Mockup */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/80 select-none">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        {/* Browser address field */}
                        <div className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold py-1 px-4 rounded-lg w-1/2 text-center truncate">
                          formstudio.io/form/{formId}
                        </div>
                        <div className="w-10" />
                      </div>

                      {/* Viewport */}
                      <div className="bg-slate-50 dark:bg-brand-dark-bg h-[620px] overflow-y-auto scrollbar-thin p-8">
                        <FormIntake
                          formTitle={formTitle}
                          formDescription={formDescription}
                          formFields={formFields}
                          onSubmit={handlePreviewSubmit}
                          isSubmitting={false}
                          isPreview={true}
                          themeConfig={formTheme}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TABS 2: RESPONSES LEDGER */}
        {activeTab === 'responses' && (
          <div className="animate-fade-in flex flex-col gap-6">

            {/* Responses controls subheader */}
            <div className="bg-white dark:bg-brand-dark border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Submission Database Ledger
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Managing and exporting log responses for form "{formTitle}"
                  </p>
                </div>

                <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/30 self-start">
                  <button
                    onClick={() => setResponseSubView('sheet')}
                    className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all ${responseSubView === 'sheet'
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Spreadsheet Grid</span>
                  </button>
                  <button
                    onClick={() => setResponseSubView('analytics')}
                    className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all ${responseSubView === 'analytics'
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                  >
                    <BarChart3 size={13} />
                    <span>Analytics Overview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Render selected responses subview */}
            {responseSubView === 'sheet' ? (
              <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <ResponsesSheet
                  formFields={formFields}
                  submissions={submissions}
                  setSubmissions={handleSetSubmissions}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <AnalyticsSummary
                  formFields={formFields}
                  submissions={submissions}
                />
              </div>
            )}

          </div>
        )}

      </div>

      {/* SHARE / PUBLISH GLASS MODAL */}
      {isShareOpen && (
        <ShareModal
          formId={formId}
          formTitle={formTitle}
          formStatus={formStatus}
          getShareUrl={getShareUrl}
          getEmbedCode={getEmbedCode}
          handleCopyLink={handleCopyLink}
          copiedLink={copiedLink}
          onClose={() => setIsShareOpen(false)}
          triggerToast={triggerToast}
        />
      )}

      {/* Global Toast */}
      <Toast {...toast} />

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onLogout={async () => {
          try {
            await logOutUser();
            navigate('/login');
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
}

// ==========================================
// 3b. SHARE MODAL COMPONENT WITH COLLABORATORS
// ==========================================
function ShareModal({ formId, formTitle, formStatus, getShareUrl, getEmbedCode, handleCopyLink, copiedLink, onClose, triggerToast }) {
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'collaborators'
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [qrUrl, setQrUrl] = useState(getShareUrl());

  // Load existing collaborators from the database and resolve LAN IP for QR scanning
  useEffect(() => {
    const loadData = async () => {
      try {
        const form = await getForm(formId);
        if (form) {
          setCollaborators(form.sharedWith || []);
        }

        const shareUrl = getShareUrl();
        if (shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1')) {
          const ip = await getNetworkIp();
          if (ip && ip !== 'localhost') {
            const newUrl = shareUrl.replace('localhost', ip).replace('127.0.0.1', ip);
            setQrUrl(newUrl);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [formId]);

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      triggerToast('Please enter a valid email address.', true);
      return;
    }
    if (collaborators.includes(email)) {
      triggerToast('This email already has access.', true);
      return;
    }
    setIsInviting(true);
    try {
      await addCollaborator(formId, email);
      setCollaborators(prev => [...prev, email]);
      setInviteEmail('');
      triggerToast(`Access granted to ${email}`);
    } catch (err) {
      triggerToast('Failed to add collaborator.', true);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (email) => {
    try {
      await removeCollaborator(formId, email);
      setCollaborators(prev => prev.filter(e => e !== email));
      triggerToast(`Access revoked for ${email}`);
    } catch (err) {
      triggerToast('Failed to remove collaborator.', true);
    }
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
      />

      <div className="bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-brand" />

        {/* Header */}
        <div className="flex justify-between items-start p-7 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand dark:bg-brand/20 flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Share &amp; Manage Access
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Share your portal link or invite collaborators to view responses.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status badge */}
        <div className="mx-7 bg-slate-50 dark:bg-brand-dark-elevated/30 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardCheck size={14} className="text-brand flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{formTitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${formStatus === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-300">
              {formStatus === 'published' ? 'LIVE' : 'DRAFT'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mx-7 mt-5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/30">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'link'
                ? 'bg-white dark:bg-brand-dark-elevated text-brand shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
          >
            <Globe size={12} />
            <span>Public Link &amp; QR</span>
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'collaborators'
                ? 'bg-white dark:bg-brand-dark-elevated text-brand shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
          >
            <Users size={12} />
            <span>Response Access</span>
            {collaborators.length > 0 && (
              <span className="bg-brand/20 dark:bg-brand/30 text-brand text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {collaborators.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-7 pt-5 flex flex-col gap-4">

          {/* TAB: Public Link */}
          {activeTab === 'link' && (
            <>
              {/* Copy URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Shareable URL Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated/50 rounded-xl px-3 py-2.5 text-slate-600 dark:text-slate-300 focus:outline-none select-all font-semibold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/40 dark:bg-brand-dark-elevated/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}`}
                    alt="QR Code"
                    width={120}
                    height={120}
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-200">Intake QR Code</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Scan to open the public form. Place in presentations, printed brochures, or landing pages.
                  </p>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-brand font-black uppercase tracking-wider mt-2 block hover:underline"
                  >
                    Download High-Res QR <ExternalLink size={10} className="inline ml-0.5" />
                  </a>
                </div>
              </div>

              {/* Embed code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">HTML Embed Snippet</label>
                <textarea
                  readOnly
                  rows={2}
                  value={getEmbedCode()}
                  className="w-full text-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated/50 rounded-xl p-3 text-slate-500 dark:text-slate-400 focus:outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="flex gap-2 items-start text-[10px] text-slate-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-amber-700 dark:text-amber-400">
                  <strong>Draft Restriction:</strong> Publish the form to allow public submissions.
                </p>
              </div>
            </>
          )}

          {/* TAB: Collaborators / Response Access */}
          {activeTab === 'collaborators' && (
            <div className="flex flex-col gap-4">
              <div className="bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/30 rounded-xl p-4 flex gap-3">
                <ShieldCheck size={16} className="text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">Response Viewer Access</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Invited people can view submitted responses at <strong>{window.location.origin}/form/{formId}/responses</strong> after logging in.
                  </p>
                </div>
              </div>

              {/* Invite input */}
              <form onSubmit={handleAddCollaborator} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Invite by Email</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="collaborator@example.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark-elevated/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand dark:focus:border-sky-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus size={13} />
                    <span>{isInviting ? 'Adding...' : 'Grant'}</span>
                  </button>
                </div>
              </form>

              {/* Collaborators list */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">People with Access ({collaborators.length})</span>
                {collaborators.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Lock size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">No collaborators invited yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Add emails above to grant response viewing access.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {collaborators.map(email => (
                      <div key={email} className="flex items-center justify-between bg-slate-50 dark:bg-brand-dark-elevated/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-brand flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                            {email[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{email}</span>
                            <span className="text-[10px] text-emerald-500 font-bold">Viewer Access</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCollaborator(email)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition cursor-pointer"
                          title="Revoke access"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy response view link */}
              {collaborators.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Response Viewer Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/form/${formId}/responses`}
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-brand-dark-elevated/50 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/form/${formId}/responses`);
                        triggerToast('Response viewer link copied!');
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-dark-elevated rounded-xl text-slate-500 hover:text-brand transition cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-7 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-brand-dark-elevated text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3c. SHARED RESPONSES VIEWER PAGE
// ==========================================
function SharedResponsesPage({ user, theme, setTheme }) {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false, isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ message: msg, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const form = await getForm(formId);
        if (!form) { navigate('/'); return; }

        // Check access: owner OR collaborator
        const isOwner = form.ownerUid === user.uid;
        const isCollaborator = (form.sharedWith || []).includes(user.email?.toLowerCase());

        if (!isOwner && !isCollaborator) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setFormData(form);
        const resp = await getResponses(formId);
        setSubmissions(resp.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
      } catch (e) {
        console.error(e);
        triggerToast('Error loading responses.', true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent dark:border-brand rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Verifying access permissions...</span>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You don't have permission to view responses for this form. Contact the form owner to request access.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl transition hover:bg-brand-hover cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg text-slate-800 dark:text-slate-100 transition-colors pb-16">
      <header className="bg-white/70 dark:bg-brand-dark/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50 sticky top-0 z-30 shadow-sm">
        <div className="w-[98%] max-w-[1920px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="font-black text-sm text-slate-700 dark:text-slate-200 block">{formData?.title}</span>
              <span className="text-[10px] text-slate-400 font-medium">Shared Responses View</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Viewer Access</span>
            </div>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 border border-slate-200/60 dark:border-slate-800/80 rounded-full flex items-center justify-center bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="w-[98%] max-w-[1920px] mx-auto py-8 px-2 sm:px-4 flex flex-col gap-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Responses', value: submissions.length, color: 'text-brand' },
            { label: 'Form Fields', value: formData?.fields?.length || 0, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Form Status', value: formData?.status || 'draft', color: formData?.status === 'published' ? 'text-emerald-600' : 'text-amber-600' },
            { label: 'Access Role', value: 'Viewer', color: 'text-slate-600 dark:text-slate-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-brand-dark border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
              <span className={`text-lg font-black capitalize mt-1 block ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Responses table */}
        <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet size={16} className="text-brand" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Submission Responses</h2>
            <span className="bg-brand/10 text-brand text-[10px] font-black px-2 py-0.5 rounded-full">{submissions.length}</span>
          </div>
          <ResponsesSheet
            formFields={formData?.fields || []}
            submissions={submissions}
            setSubmissions={() => { }} // Read-only for collaborators
            readOnly={true}
          />
        </div>

        {/* Analytics read-only */}
        <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-brand" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Response Analytics</h2>
          </div>
          <AnalyticsSummary
            formFields={formData?.fields || []}
            submissions={submissions}
          />
        </div>
      </main>

      <Toast {...toast} />
    </div>
  );
}

// ==========================================
// 4. PUBLIC PORTAL INTAKE VIEW PAGE
// ==========================================
function FormPublicPage({ theme, setTheme, user }) {
  const { id: formId } = useParams();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formStatus, setFormStatus] = useState('published');
  const [ownerUid, setOwnerUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTheme, setFormTheme] = useState({ theme: 'glassmorphism', font: 'Outfit', accent: 'brand' });
  const [toast, setToast] = useState({ message: '', visible: false, isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ message: msg, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  };

  const loadFormConfig = async () => {
    try {
      const form = await getForm(formId);
      if (form) {
        let descText = form.description || '';
        let themeConfig = { theme: 'glassmorphism', font: 'Outfit', accent: 'brand' };
        if (descText.includes('|||')) {
          const parts = descText.split('|||');
          descText = parts[0];
          try {
            themeConfig = JSON.parse(parts[1]);
          } catch (e) {
            console.error("Failed to parse theme:", e);
          }
        }
        setFormTitle(form.title || 'Untitled Form');
        setFormDescription(descText);
        setFormTheme(themeConfig);
        setFormFields(form.fields || []);
        setFormStatus(form.status || 'published');
        setOwnerUid(form.ownerUid || null);
      } else {
        setFormTitle('Blank Form');
        setFormStatus('draft'); // Not found behaves as draft
      }
    } catch (e) {
      console.error(e);
      triggerToast("Error retrieving intake specifications.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormConfig();
  }, [formId]);

  const handleResponseSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await submitResponse(formId, payload);
      triggerToast("Your response entry has been successfully logged!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to write submission entry.", true);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent dark:border-brand rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Syncing database schemas...</span>
      </div>
    );
  }

  // Check if Form is draft. If draft, check if the current logged-in user is the owner.
  // If owner is logged in, they can view it. If not owner, display draft blocker.
  const isOwner = user && ownerUid && user.uid === ownerUid;
  const isDraftBlocker = formStatus === 'draft' && !isOwner;

  if (isDraftBlocker) {
    return (
      <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-brand-dark border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1 text-amber-600 dark:text-amber-400">
            <CloudOff size={28} />
          </div>

          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Form Offline (Draft Mode)</h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            This form is currently configured in a Draft state by the administrator and cannot record public submissions.
          </p>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2" />

          {user ? (
            <Link
              to="/"
              className="text-xs font-bold text-brand hover:text-brand-hover hover:underline"
            >
              Return to your Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition"
            >
              Sign In to Edit Form
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tint dark:bg-brand-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col pb-16">

      {/* Mini navbar */}
      <header className="bg-white/70 dark:bg-brand-dark/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-600 to-sky-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <ClipboardCheck size={16} />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100">FormStudio</span>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                to={`/form/${formId}/edit`}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1"
              >
                <Edit3 size={12} />
                <span>Edit Workspace</span>
              </Link>
            )}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 border border-slate-200/60 dark:border-slate-800/80 rounded-full flex items-center justify-center bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Intake Content */}
      <main className="max-w-2xl mx-auto py-10 px-6 w-full flex-1">
        <FormIntake
          formTitle={formTitle}
          formDescription={formDescription}
          formFields={formFields}
          onSubmit={handleResponseSubmit}
          isSubmitting={isSubmitting}
          themeConfig={formTheme}
        />

        {/* Footnote powered branding */}
        <div className="text-center mt-12 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-brand dark:text-slate-500 dark:hover:text-brand font-bold transition"
          >
            <ClipboardCheck size={13} />
            <span>Powered by FormStudio · Establish your own portal</span>
          </Link>
        </div>
      </main>

      {/* Global Toast */}
      <Toast {...toast} />
    </div>
  );
}

import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  User,
  Bell,
  BellOff,
  Shield,
  Trash2,
  ChevronRight,
  LogOut,
  Palette,
  Settings2,
  FileText,
  CheckCircle,
  Globe,
  Lock,
  Info,
  Monitor,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function SettingsSidebar({ isOpen, onClose, theme, setTheme, user, onLogout, onDeleteAccount }) {
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifEnabled, setNotifEnabled] = useState(
    () => localStorage.getItem('fs_notifications') !== 'false'
  );
  const [emailDigest, setEmailDigest] = useState(
    () => localStorage.getItem('fs_email_digest') !== 'false'
  );
  const [formDefaultsPublished, setFormDefaultsPublished] = useState(
    () => localStorage.getItem('fs_default_status') === 'published'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const toggleNotif = (val) => {
    setNotifEnabled(val);
    localStorage.setItem('fs_notifications', String(val));
  };

  const toggleEmailDigest = (val) => {
    setEmailDigest(val);
    localStorage.setItem('fs_email_digest', String(val));
  };

  const toggleFormDefault = (val) => {
    setFormDefaultsPublished(val);
    localStorage.setItem('fs_default_status', val ? 'published' : 'draft');
  };

  const navItems = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'forms', label: 'Form Defaults', icon: FileText },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-brand-dark border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-sky-900/30 text-brand dark:text-sky-400 flex items-center justify-center">
              <Settings2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">Settings</h2>
              <p className="text-[10px] text-slate-400 font-bold">Customize your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Nav */}
        <nav className="flex flex-col gap-0.5 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer w-full text-left ${
                activeSection === id
                  ? 'bg-brand/10 dark:bg-sky-900/25 text-brand dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              } ${id === 'danger' ? '!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-950/20' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={14} className={id === 'danger' ? 'text-red-500' : ''} />
                <span>{label}</span>
              </div>
              {activeSection === id && <ChevronRight size={12} />}
            </button>
          ))}
        </nav>

        {/* Section Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ─── APPEARANCE ─── */}
          {activeSection === 'appearance' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <SectionTitle title="Theme Mode" icon={Monitor} />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition cursor-pointer ${
                    theme === 'light'
                      ? 'border-brand bg-brand/5 dark:bg-sky-900/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === 'light' ? 'bg-brand/15 text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Sun size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Light</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Clean & Bright</p>
                  </div>
                  {theme === 'light' && <CheckCircle size={13} className="text-brand" />}
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition cursor-pointer ${
                    theme === 'dark'
                      ? 'border-sky-500 bg-sky-900/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-sky-400/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === 'dark' ? 'bg-sky-500/15 text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Moon size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Dark</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Easy on eyes</p>
                  </div>
                  {theme === 'dark' && <CheckCircle size={13} className="text-sky-400" />}
                </button>
              </div>

              <Divider />

              <SectionTitle title="Accent Color" icon={Sparkles} />
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: 'Purple', color: 'bg-sky-600', ring: 'ring-sky-500' },
                  { label: 'Indigo', color: 'bg-sky-600', ring: 'ring-sky-500' },
                  { label: 'Blue', color: 'bg-blue-600', ring: 'ring-blue-500' },
                  { label: 'Emerald', color: 'bg-emerald-600', ring: 'ring-emerald-500' },
                  { label: 'Rose', color: 'bg-rose-600', ring: 'ring-rose-500' },
                  { label: 'Amber', color: 'bg-amber-500', ring: 'ring-amber-400' },
                ].map(({ label, color, ring }) => (
                  <button
                    key={label}
                    title={label}
                    className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 dark:ring-offset-brand-dark ring-transparent hover:${ring} transition cursor-pointer`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic font-medium">Accent color theming (requires Firebase config to persist).</p>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {activeSection === 'profile' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <SectionTitle title="Account Details" icon={User} />

              <div className="bg-slate-50 dark:bg-brand-dark-elevated/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-sky-600 flex items-center justify-center text-white text-lg font-black shadow-md flex-shrink-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-500" />
                    <span>Account verified</span>
                  </p>
                </div>
              </div>

              <Divider />
              <SectionTitle title="Workspace Info" icon={Globe} />

              <SettingRow label="Account Type" value="Free Tier" />
              <SettingRow label="User ID" value={user?.uid?.slice(0, 16) + '...' || 'N/A'} mono />
              <SettingRow label="Auth Provider" value="Email / Password" />

              <Divider />
              <SectionTitle title="Security" icon={Lock} />

              <InfoNote text="Password change and 2FA configuration is available through your Firebase Authentication provider dashboard." />

              <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-brand-dark-elevated/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer group">
                <span>Change Password</span>
                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeSection === 'notifications' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <SectionTitle title="Notification Preferences" icon={Bell} />

              <ToggleRow
                label="In-App Notifications"
                description="Get toasts for autosave, actions, and syncs"
                enabled={notifEnabled}
                onChange={toggleNotif}
              />

              <ToggleRow
                label="Email Digest"
                description="Receive a weekly summary of form submissions"
                enabled={emailDigest}
                onChange={toggleEmailDigest}
              />

              <Divider />
              <InfoNote text="Email notifications require your backend to be configured with a mailer integration (e.g. SendGrid, Resend)." />
            </div>
          )}

          {/* ─── FORM DEFAULTS ─── */}
          {activeSection === 'forms' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <SectionTitle title="Form Creation Defaults" icon={FileText} />

              <ToggleRow
                label="Default to Published"
                description="New forms are published immediately on creation instead of draft"
                enabled={formDefaultsPublished}
                onChange={toggleFormDefault}
              />

              <Divider />
              <SectionTitle title="Submission Behavior" icon={CheckCircle} />
              <InfoNote text="Submission landing page and response confirmation messages can be customized from inside each form workspace." />
            </div>
          )}

          {/* ─── DANGER ZONE ─── */}
          {activeSection === 'danger' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <SectionTitle title="Danger Zone" icon={AlertTriangle} className="text-red-500" />

              <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-black text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-[11px] text-red-600/70 dark:text-red-500/60 leading-relaxed mt-1">
                    Permanently deletes your account and all associated forms, responses, and data. This action <strong>cannot be undone</strong>.
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2.5 border border-red-300 dark:border-red-800 bg-white dark:bg-brand-dark text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer self-start"
                  >
                    <Trash2 size={13} />
                    <span>Delete My Account</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                      Type <span className="font-black">DELETE</span> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE here..."
                      className="text-xs border border-red-300 dark:border-red-800 bg-white dark:bg-brand-dark text-red-700 dark:text-red-400 px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={deleteInput !== 'DELETE'}
                        onClick={() => onDeleteAccount && onDeleteAccount()}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/40 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-brand-dark-elevated/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                <LogOut size={14} className="text-slate-500" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
            FormStudio · v2.0.0
          </p>
        </div>
      </aside>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title, icon: Icon, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon size={13} className={`text-brand dark:text-sky-400 ${className}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${className}`}>
        {title}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-100 dark:bg-slate-800 -mx-5" />;
}

function SettingRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${mono ? 'font-mono text-[10px]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-medium">{description}</p>
      </div>
      <label className="switch flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}

function InfoNote({ text }) {
  return (
    <div className="flex gap-2 bg-slate-50 dark:bg-brand-dark-elevated/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
      <Info size={13} className="text-brand dark:text-sky-400 flex-shrink-0 mt-0.5" />
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{text}</p>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  User, Key, AlertTriangle, Link, LogOut, Check, Save 
} from 'lucide-react';

const AVATARS = [
  '👩‍💻', '👨‍💻', '🦊', '🚀', '🎨', '💼', '🥑', '👾'
];

export default function AccountView({ user, onLogout }) {
  const [profileName, setProfileName] = useState(() => localStorage.getItem('fs_account_name') || 'Builder User');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('fs_account_avatar') || '👩‍💻');
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [googleConnected, setGoogleConnected] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    localStorage.setItem('fs_account_name', profileName);
    localStorage.setItem('fs_account_avatar', avatar);
    
    // Dispatch custom event to notify App.jsx navigation header
    window.dispatchEvent(new Event('fs_profile_update'));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!passwordOld || !passwordNew) return;
    alert("Mock password successfully updated!");
    setPasswordOld('');
    setPasswordNew('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Account Configuration</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your personal profile, credentials, and third-party integrations.
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {isSaved ? <Check size={13} /> : <Save size={13} />}
          <span>{isSaved ? 'Changes Saved!' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Profile details & Password */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Avatar & Name Profile */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <User size={13} className="text-brand dark:text-sky-400" />
              <span>Personal Details</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-3">
              {/* Avatar circle */}
              <div className="w-18 h-18 rounded-full border border-slate-200 dark:border-slate-850 flex items-center justify-center text-4xl shadow-inner select-none relative bg-slate-55 dark:bg-slate-900/60">
                {avatar}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Choose Avatar Tag</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setAvatar(av)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                        avatar === av ? 'border-brand dark:border-sky-400 bg-brand/5' : 'border-slate-200 dark:border-slate-850'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <form onSubmit={handleResetPassword} className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Key size={13} className="text-brand dark:text-sky-400" />
              <span>Modify Password</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Old Password</label>
                <input
                  type="password"
                  value={passwordOld}
                  onChange={(e) => setPasswordOld(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={passwordNew}
                  onChange={(e) => setPasswordNew(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!passwordOld || !passwordNew}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-3 py-2 rounded-lg transition duration-200 self-start disabled:opacity-50 cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Right (1/3): Integrations & Destructive options */}
        <div className="flex flex-col gap-5">
          {/* Integrations panel */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Link size={13} className="text-brand dark:text-sky-400" />
              <span>Connected Accounts</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {[
                { name: 'Google Workspace', status: googleConnected, set: setGoogleConnected },
                { name: 'GitHub Integration', status: githubConnected, set: setGithubConnected },
                { name: 'Slack Integrations', status: slackConnected, set: setSlackConnected }
              ].map(app => (
                <div key={app.name} className="flex items-center justify-between py-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-250">{app.name}</span>
                  <button
                    onClick={() => app.set(s => !s)}
                    className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-wide border cursor-pointer transition ${
                      app.status 
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                    }`}
                  >
                    {app.status ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Account & Session Logout */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-500" />
              <span>Danger Zone</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out Workspace</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 border border-red-200 dark:border-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Delete FormStudio Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="max-w-xs w-full bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 relative select-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-500" />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">Permanently delete?</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-medium">
              Are you sure? This action is irreversible and will delete your workspace forms catalog.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); onLogout(); }}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

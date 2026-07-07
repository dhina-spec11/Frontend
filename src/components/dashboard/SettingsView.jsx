import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Bell, Save, Globe, Eye, 
  HelpCircle, Check
} from 'lucide-react';

export default function SettingsView() {
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('fs_settings_workspace_name') || 'FormStudio Hub');
  const [defaultStatus, setDefaultStatus] = useState(() => localStorage.getItem('fs_settings_default_status') || 'draft');
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('fs_settings_autosave') !== 'false');
  const [autoSaveInterval, setAutoSaveInterval] = useState(() => localStorage.getItem('fs_settings_autosave_interval') || '30');
  const [emailDigest, setEmailDigest] = useState(() => localStorage.getItem('fs_settings_email_digest') !== 'false');
  const [language, setLanguage] = useState(() => localStorage.getItem('fs_settings_language') || 'en');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('fs_settings_timezone') || 'IST');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('fs_settings_workspace_name', workspaceName);
    localStorage.setItem('fs_settings_default_status', defaultStatus);
    localStorage.setItem('fs_settings_autosave', String(autoSave));
    localStorage.setItem('fs_settings_autosave_interval', autoSaveInterval);
    localStorage.setItem('fs_settings_email_digest', String(emailDigest));
    localStorage.setItem('fs_settings_language', language);
    localStorage.setItem('fs_settings_timezone', timezone);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Workspace Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Configure system settings, notification rules, and localization mappings.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {isSaved ? <Check size={13} /> : <Save size={13} />}
          <span>{isSaved ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3): Core settings form */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Workspace info */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Settings size={13} className="text-brand dark:text-sky-400" />
              <span>Workspace Profile</span>
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. FormStudio Professional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Form Preferences */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Shield size={13} className="text-brand dark:text-sky-400" />
              <span>Form Defaults</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Default Status</label>
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Auto Save Interval</label>
                <select
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(e.target.value)}
                  disabled={!autoSave}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="10">Every 10 seconds</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 60 seconds</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Enable Auto Save</span>
                <span className="text-[10px] text-slate-400 font-medium">Save form drafts automatically in the background</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSave} 
                  onChange={(e) => setAutoSave(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
              </label>
            </div>
          </div>
        </div>

        {/* Right column (1/3): Localization & Notifications */}
        <div className="flex flex-col gap-5">
          {/* Notifications config */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Bell size={13} className="text-brand dark:text-sky-400" />
              <span>Email & Notifications</span>
            </h3>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-bold">Email Digest</span>
                <span className="text-[9px] text-slate-400 leading-normal font-medium">Receive weekly summaries of form response metrics</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  checked={emailDigest} 
                  onChange={(e) => setEmailDigest(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
              </label>
            </div>
          </div>

          {/* Localization config */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Globe size={13} className="text-brand dark:text-sky-400" />
              <span>Localization</span>
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Default Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Time Zone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">EST (GMT-5)</option>
                  <option value="IST">IST (GMT+5:30)</option>
                  <option value="CET">CET (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

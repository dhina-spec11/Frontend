import React, { useState, useEffect } from 'react';
import { 
  User, Key, AlertTriangle, Link, LogOut, Check, Save, UserPlus, Users 
} from 'lucide-react';
import { changePassword, signUpUser } from '../../firebase';

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

  // Multi-Account Management States
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [addAccountEmail, setAddAccountEmail] = useState('');
  const [addAccountPassword, setAddAccountPassword] = useState('');
  const [addAccountName, setAddAccountName] = useState('');
  const [addAccountLoading, setAddAccountLoading] = useState(false);
  const [addAccountError, setAddAccountError] = useState('');
  const [allAccounts, setAllAccounts] = useState(() => {
    const raw = localStorage.getItem('formstudio_all_accounts');
    let accounts = raw ? JSON.parse(raw) : [];
    // Ensure current user is in list
    if (user && !accounts.some(acc => acc.email === user.email)) {
      accounts.push({
        email: user.email,
        name: localStorage.getItem('fs_account_name') || 'Builder User',
        avatar: localStorage.getItem('fs_account_avatar') || '👩‍💻',
        uid: user.uid
      });
      localStorage.setItem('formstudio_all_accounts', JSON.stringify(accounts));
    }
    return accounts;
  });

  const handleSwitchAccount = (targetAccount) => {
    const userObj = {
      uid: targetAccount.uid,
      email: targetAccount.email
    };
    localStorage.setItem('mock_firebase_current_user', JSON.stringify(userObj));
    localStorage.setItem('fs_account_name', targetAccount.name || 'Builder User');
    localStorage.setItem('fs_account_avatar', targetAccount.avatar || '👩‍💻');
    
    window.dispatchEvent(new Event('mock_auth_change'));
    window.dispatchEvent(new Event('fs_profile_update'));
    
    alert(`Switched to account: ${targetAccount.email}`);
    window.location.reload();
  };

  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    if (!addAccountEmail || !addAccountPassword || !addAccountName) return;
    if (addAccountPassword.length < 6) {
      setAddAccountError('Password must be at least 6 characters.');
      return;
    }
    setAddAccountLoading(true);
    setAddAccountError('');
    try {
      const currentMockUser = localStorage.getItem('mock_firebase_current_user');
      const currentName = localStorage.getItem('fs_account_name');
      const currentAvatar = localStorage.getItem('fs_account_avatar');

      const newUser = await signUpUser(addAccountEmail, addAccountPassword);
      
      const newAccObj = {
        email: addAccountEmail.toLowerCase(),
        name: addAccountName.trim(),
        avatar: '🦊',
        uid: newUser.uid
      };

      const updatedList = [...allAccounts];
      if (!updatedList.some(acc => acc.email === newAccObj.email)) {
        updatedList.push(newAccObj);
        localStorage.setItem('formstudio_all_accounts', JSON.stringify(updatedList));
        setAllAccounts(updatedList);
      }

      localStorage.setItem('mock_firebase_current_user', currentMockUser);
      localStorage.setItem('fs_account_name', currentName);
      localStorage.setItem('fs_account_avatar', currentAvatar);

      alert(`✅ Account "${addAccountName}" successfully added to account manager.`);
      setAddAccountEmail('');
      setAddAccountPassword('');
      setAddAccountName('');
      setShowAddAccountModal(false);
    } catch (err) {
      console.error(err);
      setAddAccountError(err.message || 'Failed to add account.');
    } finally {
      setAddAccountLoading(false);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('fs_account_name', profileName);
    localStorage.setItem('fs_account_avatar', avatar);
    
    // Dispatch custom event to notify App.jsx navigation header
    window.dispatchEvent(new Event('fs_profile_update'));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const [pwLoading, setPwLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordOld || !passwordNew) return;
    if (passwordNew.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(user.email, passwordOld, passwordNew);
      alert("Password successfully updated!");
      setPasswordOld('');
      setPasswordNew('');
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
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
              disabled={!passwordOld || !passwordNew || pwLoading}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-3 py-2 rounded-lg transition duration-200 self-start disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {pwLoading && <div className="w-3 h-3 border-2 border-slate-700 dark:border-slate-300 border-t-transparent rounded-full animate-spin" />}
              <span>{pwLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Right (1/3): Integrations & Destructive options */}
        <div className="flex flex-col gap-5">
          {/* Account Management panel */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
              <Users size={13} className="text-brand dark:text-sky-400" />
              <span>Account Management</span>
            </h3>
            
            <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
              {allAccounts.map((acc) => {
                const isActive = acc.email === user?.email;
                return (
                  <div key={acc.email} className="flex items-center justify-between py-1.5 border-b border-slate-100/60 dark:border-slate-800/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm select-none">{acc.avatar || '🦊'}</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{acc.name}</span>
                        <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{acc.email}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full select-none">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchAccount(acc)}
                        className="px-2 py-1 text-[9px] font-black uppercase border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-brand dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddAccountModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-250 dark:border-slate-800 hover:border-brand dark:hover:border-sky-400 hover:bg-brand/5 dark:hover:bg-sky-950/20 text-slate-655 dark:text-slate-355 hover:text-brand dark:hover:text-sky-400 text-[10px] font-extrabold rounded-xl transition cursor-pointer"
            >
              <UserPlus size={12} />
              <span>Add Account</span>
            </button>
          </div>

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
      {/* Add Account Modal POP UP */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="max-w-sm w-full bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-850 rounded-2xl shadow-2xl p-6 relative animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 dark:bg-sky-950/40 flex items-center justify-center">
                <UserPlus size={16} className="text-brand dark:text-sky-400" />
              </div>
              <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 tracking-tight">Add Account Profile</h3>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="flex flex-col gap-4">
              {addAccountError && (
                <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 p-2.5 rounded-xl font-bold">
                  {addAccountError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addAccountName}
                  onChange={(e) => setAddAccountName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={addAccountEmail}
                  onChange={(e) => setAddAccountEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={addAccountPassword}
                  onChange={(e) => setAddAccountPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="submit"
                  disabled={addAccountLoading}
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addAccountLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Add Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAccountModal(false);
                    setAddAccountError('');
                    setAddAccountName('');
                    setAddAccountEmail('');
                    setAddAccountPassword('');
                  }}
                  className="flex-1 py-2.5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 text-[10px] font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

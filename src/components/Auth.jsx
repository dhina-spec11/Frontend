import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, AlertCircle, ClipboardCheck,
  ArrowRight, Eye, EyeOff,
  BarChart3, Users, Globe, Shield, Zap
} from 'lucide-react';
import { logInUser, signUpUser, signInWithGoogle } from '../firebase';

const FEATURES = [
  { icon: ClipboardCheck, label: 'Drag & Drop Builder' },
  { icon: BarChart3,      label: 'Live Analytics' },
  { icon: Users,          label: 'Team Collaboration' },
  { icon: Globe,          label: 'Public Portals + QR' },
  { icon: Shield,         label: 'Secure Auth' },
  { icon: Zap,            label: 'Auto-Save Cloud Sync' },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchMode = (val) => { setIsLogin(val); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await logInUser(email, password);
      } else {
        await signUpUser(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      // Ignore when the user simply closes the login popup window
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        return;
      }
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-tint dark:bg-brand-dark-bg transition-colors duration-300 overflow-hidden">

      {/* ── LEFT PANEL — branding (hidden mobile) ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 bg-gradient-to-br from-[#071424] via-[#0a1f3a] to-brand-dark-bg overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-brand flex items-center justify-center text-white shadow-lg shadow-brand/30">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <p className="font-black text-white text-lg tracking-tight leading-none">FormStudio</p>
            <p className="text-[9px] font-extrabold text-sky-400 tracking-[0.2em] uppercase">Management Hub</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <span className="text-[10px] font-black text-sky-400 border border-sky-500/30 bg-sky-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
              Premium SaaS Platform
            </span>
            <h2 className="text-4xl font-black text-white mt-5 leading-tight">
              Build beautiful<br />
              <span className="text-sky-400">forms instantly.</span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed font-medium max-w-xs">
              Create, publish, and analyze forms with a premium drag-and-drop builder. No code required.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition"
              >
                <Icon size={12} className="text-sky-400" />
                <span className="text-[11px] font-bold text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-[11px] text-slate-500 italic leading-relaxed font-medium">
            "FormStudio replaced 3 tools for our team — we build, share, and analyze all in one place."
          </p>
          <p className="text-[10px] text-sky-400 font-bold mt-2">— Product Team, SaaS Startup</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-10 right-10 w-64 h-64 bg-sky-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-brand/6 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-brand flex items-center justify-center text-white shadow-lg">
              <ClipboardCheck size={18} />
            </div>
            <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight">FormStudio</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-brand-dark border border-slate-200/60 dark:border-slate-700/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* accent line */}
            <div className="h-1 bg-gradient-to-r from-sky-400 via-brand to-sky-500" />

            <div className="p-8">
              {/* Tab switcher */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-7 border border-slate-200/40 dark:border-slate-700/30">
                {[{ val: true, label: 'Sign In' }, { val: false, label: 'Sign Up' }].map(({ val, label }) => (
                  <button
                    key={label}
                    onClick={() => switchMode(val)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isLogin === val
                        ? 'bg-white dark:bg-brand-dark-elevated text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">
                    {isLogin ? 'Welcome back 👋' : 'Create your account'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                    {isLogin
                      ? 'Sign in to access your form workspace.'
                      : 'Get started with a free FormStudio account.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-dark-elevated/60 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand dark:focus:border-sky-400 focus:bg-white dark:focus:bg-brand-dark-elevated transition"
                    />
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-brand-dark-elevated/60 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand dark:focus:border-sky-400 focus:bg-white dark:focus:bg-brand-dark-elevated transition"
                    />
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar — signup only */}
                  {!isLogin && password.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            password.length >= i * 3
                              ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-sky-400' : 'bg-emerald-400'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-[9px] font-bold text-slate-400 ml-1 whitespace-nowrap">
                        {password.length < 4 ? 'Weak' : password.length < 7 ? 'Fair' : password.length < 10 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Error message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-200 dark:border-red-900/30"
                    >
                      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  id="auth-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-sky-500 to-brand hover:from-sky-600 hover:to-brand-hover text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:scale-[1.01] transition duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 select-none">
                  <div className="h-px bg-slate-100 dark:bg-slate-800/80 flex-1" />
                  <span>or</span>
                  <div className="h-px bg-slate-100 dark:bg-slate-800/80 flex-1" />
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-250 text-xs font-bold transition duration-200 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.72 1.5 6.7L5.266 9.765z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.04 15.342C14.936 16.084 13.568 16.5 12 16.5c-3.14 0-5.795-2.127-6.734-4.99L1.5 14.545C3.357 18.52 7.33 21.24 12 21.24c3.08 0 5.827-1.127 7.78-3.03l-3.74-2.868z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.275c0-.8-.08-1.57-.22-2.316H12v4.51H18.52c-.29 1.48-1.14 2.73-2.42 3.565l3.74 2.87c2.18-2.02 3.65-4.99 3.65-8.629z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.266 9.765C5.016 10.51 4.88 11.3 4.88 12.12s.136 1.61.386 2.355l-3.766 2.805A11.967 11.967 0 0 1 0 12.12c0-1.855.42-3.61 1.168-5.18l4.098 2.825z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>

              {/* Switch mode */}
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 font-medium">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => switchMode(!isLogin)}
                  className="text-brand font-bold hover:underline cursor-pointer"
                >
                  {isLogin ? 'Sign up free →' : 'Sign in →'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold mt-5 uppercase tracking-widest">
            FormStudio &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}

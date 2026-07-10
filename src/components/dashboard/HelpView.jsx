import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, BookOpen, Send, Check, ShieldCheck 
} from 'lucide-react';
import { submitSupportTicket } from '../../firebase';

const FAQS = [
  { q: "How do I share a form with my team?", a: "Open the form in the editor, click the Share button on the top-right, and enter your team member's email address to add them as a collaborator." },
  { q: "Where is my response data stored?", a: "All submissions are stored securely in your workspace MySQL database. You can export them to CSV anytime from the Responses Ledger page." },
  { q: "Can I collect file uploads from users?", a: "Yes, you can drag and drop a 'File Upload' field into your form builder to securely accept attachments from submitters." }
];

export default function HelpView({ user }) {
  const [email, setEmail] = useState(user?.email || '');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !msg || submitting) return;
    setSubmitting(true);
    try {
      await submitSupportTicket(email, msg);
      setSubmitted(true);
      setMsg('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit ticket. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Access product documentation, browse common FAQs, or submit support tickets directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): FAQs */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2 mb-1">
              <BookOpen size={13} className="text-brand dark:text-sky-400" />
              <span>Frequently Asked Questions</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b last:border-0 border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Q: {faq.q}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (1/3): Support Ticket Form */}
        <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={13} className="text-brand dark:text-sky-400" />
            <span>Submit a Ticket</span>
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@domain.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Message Description</label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                rows={4}
                placeholder="Explain the issue you are experiencing..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-sky-500 to-brand hover:from-sky-600 hover:to-brand-hover text-white py-2.5 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : submitted ? (
                <Check size={13} />
              ) : (
                <Send size={13} />
              )}
              <span>{submitting ? 'Sending...' : submitted ? 'Ticket Submitted!' : 'Send Support Ticket'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

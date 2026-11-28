import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';
import type { PageId } from '../types.ts';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Formula Question or Verification');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Support &amp; Feedback</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contact VeloCalc
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Report a formula edge case, suggest a new calculator, or reach out regarding partnerships and policy inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Direct Contact</h2>
            <p className="text-xs leading-relaxed">
              For formula audits, accessibility feedback, or advertising inquiries, contact the editorial team directly:
            </p>
            <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
              support@velocalc.dpdns.org
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
              <p>
                <strong>Response Window:</strong> Typically within 1–2 business days.
              </p>
              <p>
                <strong>Bug Reports:</strong> Please include the calculator URL and input parameters used.
              </p>
            </div>
          </div>

          <div className="text-xs space-y-1.5">
            <a
              href="/about"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('about');
                }
              }}
              className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              About Our Verification Process →
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('privacy');
                }
              }}
              className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Privacy Policy &amp; Ad Disclosures →
            </a>
          </div>
        </div>

        <div className="md:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Inquiry Prepared</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Thank you, {name}. You can also send this directly via your mail client to{' '}
                <a
                  href={`mailto:support@velocalc.dpdns.org?subject=${encodeURIComponent(`[VeloCalc] ${topic}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold underline"
                >
                  support@velocalc.dpdns.org
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Send a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-topic" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option>Formula Question or Verification</option>
                  <option>Request a New Calculator</option>
                  <option>Report a Bug</option>
                  <option>Privacy or Advertising Inquiry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-msg" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the calculator, inputs, or feedback..."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Prepare Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

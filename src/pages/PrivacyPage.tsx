import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, AlertCircle, Cpu } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'methodology' | 'terms'>('privacy');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Client-Side Certified · Zero-Tracking</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy &amp; Scientific Methodology
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete transparency regarding our decentralized browser execution model and standardized formulas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'privacy'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Privacy Guarantee
        </button>
        <button
          onClick={() => setActiveTab('methodology')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'methodology'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Formulas &amp; Methodology
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'terms'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Terms &amp; Disclaimers
        </button>
      </div>

      {/* Content */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>100% Local Sandboxed Computation</span>
            </div>
            <p className="text-xs">
              Every formula, balance, biometric metric, and parameter you enter executes purely within your local browser JavaScript runtime. No inputs or outputs are ever transmitted over the network or saved to remote databases.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Avoidance by Architecture
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>No Financial Logging:</strong> Mortgage principals, debts, salary figures, and interest rates are calculated strictly in transient RAM.
              </li>
              <li>
                <strong>No Health or Biometric Storage:</strong> Body weight, body fat measurements, and gestational timelines are never shared or indexed.
              </li>
              <li>
                <strong>Zero Tracking or Fingerprinting:</strong> No advertising pixels, session recording scripts, or user fingerprinting technologies exist.
              </li>
              <li>
                <strong>Local History Control:</strong> Any calculation history records you choose to save remain on your physical device using standard HTML5 localStorage and can be wiped instantly with one click.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Standardized Mathematical References</span>
            </h2>
            <p className="text-xs">
              We rely strictly on established clinical, financial, and engineering standards:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Compound Annuities</span>
                <span className="text-xs text-slate-500">Standard actuarial amortization formulas for mortgages, auto loans, and TVM calculations.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Mifflin-St Jeor (1990)</span>
                <span className="text-xs text-slate-500">Validated clinical standard for Basal Metabolic Rate and Total Daily Energy Expenditure.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">US Navy Circumference Model</span>
                <span className="text-xs text-slate-500">Hodgdon and Beckett regression equations for estimating percentage body fat.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">RFC 3021 &amp; CIDR</span>
                <span className="text-xs text-slate-500">IETF networking standards for IPv4 subnet masks and point-to-point host allocation.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Mandatory Educational Advisory</span>
            </div>
            <p className="text-xs">
              Calculations provided by VeloCalc Pro are mathematical models designed strictly for illustrative, educational, and planning purposes. VeloCalc Pro does not provide licensed financial, legal, tax, or medical counsel.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h2>
            <p className="text-xs">
              All tools are provided on an &quot;AS-IS&quot; basis without warranties of any kind. You are solely responsible for verifying figures with certified accountants, lending officers, or medical professionals before executing legally binding transactions or healthcare changes.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

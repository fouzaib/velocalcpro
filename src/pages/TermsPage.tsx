import React from 'react';
import type { PageId } from '../types.ts';

interface TermsPageProps {
  onNavigate: (page: PageId) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Legal &amp; Disclaimers</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Terms of Use &amp; Calculation Disclaimer
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Important notices regarding educational use of VeloCalc financial, health, math, and engineering calculators.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            1. Educational &amp; Planning Purposes Only
          </h2>
          <p>
            All tools, formulas, amortization schedules, and reference guides provided on VeloCalc are intended solely
            for informational, educational, and preliminary planning purposes. Results depend directly on the accuracy
            of user-supplied assumptions such as interest rates, tax percentages, or anthropometric measurements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            2. Not Professional Financial, Legal, or Medical Advice
          </h2>
          <p>
            VeloCalc does not provide licensed financial, investment, tax, legal, structural engineering, or medical
            advice. Before signing a mortgage note, modifying debt obligations, designing safety-critical hardware, or
            starting a nutrition or exercise regimen, verify figures with a qualified professional or licensed
            practitioner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            3. Intellectual Property &amp; Acceptable Use
          </h2>
          <p>
            You may freely use VeloCalc calculators for personal, academic, and commercial analysis. Automated scraping,
            denial-of-service requests, or redistributing the site as a mirror is prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            While we verify every equation carefully against established standards, VeloCalc is provided on an “as-is”
            basis without warranties of any kind. VeloCalc is not liable for decisions or damages resulting from reliance
            on calculated estimates.
          </p>
        </section>

        <div className="pt-2 flex flex-wrap gap-5 text-xs font-semibold">
          <a
            href="/privacy"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('privacy');
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Privacy Policy →
          </a>
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('calculators');
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Calculators →
          </a>
        </div>
      </div>
    </div>
  );
};

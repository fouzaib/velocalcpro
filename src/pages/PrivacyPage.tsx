import React from 'react';
import type { PageId } from '../types.ts';

interface PrivacyPageProps {
  onNavigate: (page: PageId) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Architecture &amp; Trust</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy &amp; Scientific Methodology
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          How VeloCalc Pro processes calculations locally in your browser without third-party data harvesting.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            100% Client-Side Computation
          </h2>
          <p>
            All 51 calculators execute mathematical, financial, nutritional, and engineering equations directly inside
            your browser JavaScript runtime. Numeric inputs, mortgage balances, salaries, health metrics, and random
            generations are never transmitted to or stored on any analytics server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Local Snapshot &amp; Preference Storage
          </h2>
          <p>
            When you click Save Snapshot or switch dark/light mode or currency preferences, those settings are saved
            exclusively in your browser’s <code className="font-mono text-xs">localStorage</code>. You can erase them at
            any time from the History view or your browser site settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Standardized Reference Equations
          </h2>
          <p>
            Financial tools follow standard fixed-period annuity amortization and discrete compounding conventions.
            Fitness calculators implement published peer-reviewed formulas (Mifflin-St Jeor, Karvonen Heart Rate
            Reserve, Epley/Brzycki 1RM, and U.S. DoD circumference density). Engineering calculators adhere to IEEE
            circuit laws and RFC 3021 IPv4 CIDR notation.
          </p>
        </section>

        <div className="pt-2">
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('calculators');
              }
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to all 51 calculators
          </a>
        </div>
      </div>
    </div>
  );
};

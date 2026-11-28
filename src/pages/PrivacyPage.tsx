import React from 'react';
import type { PageId } from '../types.ts';

interface PrivacyPageProps {
  onNavigate: (page: PageId) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Architecture &amp; Compliance</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy &amp; Scientific Methodology
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          How VeloCalc processes calculations locally in your browser, handles cookies and advertising partners, and
          protects user privacy.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            1. 100% Client-Side Computation
          </h2>
          <p>
            All 51 calculators execute mathematical, financial, nutritional, and engineering equations directly inside
            your browser JavaScript runtime. Numeric inputs such as mortgage balances, salaries, health measurements, and
            random generations are never transmitted to or stored on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            2. Local Snapshot &amp; Preference Storage
          </h2>
          <p>
            When you click Save Snapshot or switch light/dark mode or currency preferences, those settings are saved
            exclusively in your browser’s <code className="font-mono text-xs">localStorage</code>. You can clear them at
            any time from the History page or your browser site settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            3. Google AdSense &amp; Third-Party Advertising Cookies
          </h2>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this
            website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to
            users based on their visit to VeloCalc and/or other sites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              Google Ads Settings
            </a>{' '}
            or by visiting{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              www.aboutads.info/choices
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            4. Standardized Reference Equations
          </h2>
          <p>
            Financial tools follow standard fixed-period annuity amortization and discrete compounding conventions.
            Fitness calculators implement published peer-reviewed formulas (Mifflin-St Jeor, Karvonen Heart Rate
            Reserve, Epley/Brzycki 1RM, and U.S. DoD circumference density). Engineering calculators adhere to IEEE
            circuit laws and RFC 3021 IPv4 CIDR notation.
          </p>
        </section>

        <div className="pt-2 flex flex-wrap gap-5 text-xs font-semibold">
          <a
            href="/terms"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('terms');
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Terms &amp; Disclaimers →
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('contact');
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Contact Us →
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
            ← Back to all 51 calculators
          </a>
        </div>
      </div>
    </div>
  );
};

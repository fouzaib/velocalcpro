import React from 'react';
import type { PageId } from '../types.ts';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, page: PageId) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">About VeloCalc</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About VeloCalc &amp; Editorial Standards
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Transparent, verifiable quantitative tools for personal finance, clinical nutrition math, academic geometry,
          and electrical or network engineering.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Our Purpose</h2>
          <p>
            Most online calculator sites bury simple formulas beneath intrusive pop-ups, slow server round-trips, and
            opaque numbers. VeloCalc was built to give students, engineers, homeowners, and analysts a fast,
            distraction-free workspace where every output can be traced back to its exact equation, assumptions, and
            worked example.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Formula Verification &amp; Curation
          </h2>
          <p>
            Every calculator in our 51-tool library documents its mathematical formula, parameter definitions, edge-case
            behavior (such as negative amortization warnings on credit cards or RFC 3021 /31 CIDR subnetting), and
            peer-reviewed or industry-standard sources. Tools are regularly audited for IEEE-754 floating-point
            stability, currency localization, and responsive accessibility.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1">
            <li>
              <strong>Finance (18 Tools):</strong> Standard annuity amortization, discrete/continuous compounding, IRR/CAGR
              normalization, and underwriting DTI ratios.
            </li>
            <li>
              <strong>Fitness &amp; Health (10 Tools):</strong> Mifflin-St Jeor resting energy expenditure, Karvonen
              heart-rate reserve zones, Epley/Brzycki 1RM strength modeling, and U.S. DoD body fat density.
            </li>
            <li>
              <strong>Mathematics (12 Tools):</strong> Euclidean geometry, quadratic discriminant analysis, combinatorics,
              and Abramowitz-Stegun normal percentile approximations.
            </li>
            <li>
              <strong>Engineering (11 Tools):</strong> IPv4 bitmasking, Ohm’s law with 2× thermal derating, passive RC
              filter response, kinematics, and cryptographic bit entropy.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Explore Further</h2>
          <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
            <a href="/" onClick={(e) => go(e, 'calculators')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Browse All 51 Calculators →
            </a>
            <a href="/knowledge" onClick={(e) => go(e, 'knowledge')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Read Formula Guides →
            </a>
            <a href="/contact" onClick={(e) => go(e, 'contact')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Contact &amp; Bug Reports →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

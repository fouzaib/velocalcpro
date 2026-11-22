import React, { useState } from 'react';
import { articles } from '../data/articles.ts';
import type { CalcCategory } from '../types.ts';

interface KnowledgePageProps {
  onSelectCalc: (calcId: string) => void;
}

const CATEGORIES: ('All' | CalcCategory)[] = ['All', 'Finance', 'Fitness', 'Math', 'Engineering'];

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ onSelectCalc }) => {
  const [filter, setFilter] = useState<'All' | CalcCategory>('All');

  const visible = filter === 'All' ? articles : articles.filter((a) => a.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reference Documentation</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Formulas, Algorithms &amp; Mathematical Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Inspect the exact equations, assumptions, and clinical or engineering models behind VeloCalc Pro.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {visible.map((art) => (
          <article
            key={art.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{art.category}</span>
              <span aria-hidden="true">·</span>
              <span>{art.readTime}</span>
            </div>

            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{art.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{art.summary}</p>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
              {art.sections.map((sec) => (
                <div key={sec.heading} className="space-y-1.5">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">{sec.heading}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{sec.body}</p>
                  {sec.formula && (
                    <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                      {sec.formula}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={`/calc/${art.relatedCalcId}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectCalc(art.relatedCalcId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open Related Calculator →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

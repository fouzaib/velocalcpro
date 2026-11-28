import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { articles } from '../data/articles.ts';
import { calculators } from '../data/calculators.ts';
import type { CalcCategory } from '../types.ts';

interface KnowledgePageProps {
  activeSlug?: string | null;
  onSelectArticle: (slug: string | null) => void;
  onSelectCalc: (calcId: string) => void;
}

const CATEGORIES: ('All' | CalcCategory)[] = ['All', 'Finance', 'Fitness', 'Math', 'Engineering'];

export const KnowledgePage: React.FC<KnowledgePageProps> = ({
  activeSlug = null,
  onSelectArticle,
  onSelectCalc,
}) => {
  const [filter, setFilter] = useState<'All' | CalcCategory>('All');

  const focusedArticle = activeSlug ? articles.find((a) => a.id === activeSlug) : null;

  if (focusedArticle) {
    const relatedCalc = calculators.find((c) => c.id === focusedArticle.relatedCalcId);
    const otherArticles = articles.filter((a) => a.id !== focusedArticle.id).slice(0, 4);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <a
            href="/knowledge"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onSelectArticle(null);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Knowledge Guides</span>
          </a>
        </div>

        <article className="space-y-6">
          <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{focusedArticle.category}</span>
              <span aria-hidden="true">·</span>
              <span>{focusedArticle.readTime}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
              {focusedArticle.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {focusedArticle.summary}
            </p>
          </header>

          <div className="space-y-6">
            {focusedArticle.sections.map((sec) => (
              <section key={sec.heading} className="space-y-2">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{sec.heading}</h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{sec.body}</p>
                {sec.formula && (
                  <pre className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                    {sec.formula}
                  </pre>
                )}
              </section>
            ))}
          </div>

          {relatedCalc && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Interactive Tool</p>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Try the {relatedCalc.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{relatedCalc.desc}</p>
              </div>
              <a
                href={`/calc/${relatedCalc.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectCalc(relatedCalc.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="h-10 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Open Calculator →
              </a>
            </div>
          )}
        </article>

        <section className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">More Reference Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherArticles.map((art) => (
              <a
                key={art.id}
                href={`/knowledge/${art.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectArticle(art.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {art.category} · {art.readTime}
                </span>
                <h3 className="mt-1 font-display text-sm font-bold text-slate-900 dark:text-white">{art.title}</h3>
              </a>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const visible = filter === 'All' ? articles : articles.filter((a) => a.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reference Documentation</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Formulas, Algorithms &amp; Mathematical Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Inspect the exact equations, worked numeric examples, and clinical or engineering models behind VeloCalc.
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

            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              <a
                href={`/knowledge/${art.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectArticle(art.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {art.title}
              </a>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{art.summary}</p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <a
                href={`/knowledge/${art.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectArticle(art.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Read Full Guide →
              </a>
              <a
                href={`/calc/${art.relatedCalcId}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectCalc(art.relatedCalcId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline"
              >
                Open Calculator
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

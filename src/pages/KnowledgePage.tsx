import React, { useState } from 'react';
import { articles } from '../data/articles';
import { Article } from '../types';
import { BookOpen, ArrowRight, X } from 'lucide-react';

interface KnowledgePageProps {
  onOpenCalc: (calcId: string) => void;
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ onOpenCalc }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Finance' | 'Health' | 'Tech & Math'>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories: ('All' | 'Finance' | 'Health' | 'Tech & Math')[] = [
    'All',
    'Finance',
    'Health',
    'Tech & Math',
  ];

  const filtered = activeCategory === 'All' ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mathematical Insights &amp; Scientific Reference
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Formulas, Algorithms &amp; Guides
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Understand the exact equations, physiological formulas, and computer networking standards powering our calculation suite.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <article
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">{art.category}</span>
                <span aria-hidden="true">·</span>
                <span>{art.readTime}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                {art.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Read Full Formula Guide</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold">{selectedArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.readTime}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {selectedArticle.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {sec.heading}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {sec.body}
                  </p>
                  {sec.formula && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 font-medium">
                      Formula: {sec.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Ready to test these numbers?</span>
              <button
                onClick={() => {
                  const targetId = selectedArticle.relatedCalcId;
                  setSelectedArticle(null);
                  onOpenCalc(targetId);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Launch Interactive Calculator →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

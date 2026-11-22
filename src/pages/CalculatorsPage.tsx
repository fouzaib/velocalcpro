import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, RotateCcw, Search, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculators } from '../data/calculators.ts';
import { articles } from '../data/articles.ts';
import type { CalcCategory, CurrencyCode, PageId } from '../types.ts';

interface CalculatorsPageProps {
  activeCalcId: string;
  onSelectCalc: (calcId: string) => void;
  onNavigate: (page: PageId) => void;
  currency: CurrencyCode;
  restoredInputs?: Record<string, number> | null;
  onClearRestoredInputs?: () => void;
  onSaveSnapshot: (
    calcId: string,
    calcName: string,
    category: CalcCategory,
    primaryResult: string,
    primaryLabel: string,
    inputSnapshot: Record<string, number>
  ) => void;
}

const CATEGORIES: ('All' | CalcCategory)[] = ['All', 'Finance', 'Fitness', 'Math', 'Engineering'];

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  activeCalcId,
  onSelectCalc,
  onNavigate,
  currency,
  restoredInputs,
  onClearRestoredInputs,
  onSaveSnapshot,
}) => {
  const activeCalc = useMemo(
    () => calculators.find((c) => c.id === activeCalcId) ?? calculators[0],
    [activeCalcId]
  );

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const inp of activeCalc.inputs) {
      init[inp.id] = inp.val;
    }
    return init;
  });

  const [draftValues, setDraftValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const inp of activeCalc.inputs) {
      init[inp.id] = String(inp.val);
    }
    return init;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CalcCategory>('All');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Sync inputs when switching calculator or restoring a saved snapshot
  useEffect(() => {
    const defaults: Record<string, number> = {};
    for (const inp of activeCalc.inputs) {
      defaults[inp.id] = inp.val;
    }

    if (restoredInputs) {
      for (const inp of activeCalc.inputs) {
        if (typeof restoredInputs[inp.id] === 'number' && Number.isFinite(restoredInputs[inp.id])) {
          defaults[inp.id] = restoredInputs[inp.id];
        }
      }
      onClearRestoredInputs?.();
    } else if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      for (const inp of activeCalc.inputs) {
        const raw = params.get(inp.id);
        if (raw !== null && raw !== '' && !Number.isNaN(Number(raw))) {
          defaults[inp.id] = Number(raw);
        }
      }
    }

    const drafts: Record<string, string> = {};
    for (const [k, v] of Object.entries(defaults)) {
      drafts[k] = String(v);
    }

    setValues(defaults);
    setDraftValues(drafts);
    setShowFullSchedule(false);
  }, [activeCalc, restoredInputs, onClearRestoredInputs]);

  const result = useMemo(() => activeCalc.calc(values, currency), [activeCalc, values, currency]);

  const relatedCalcs = useMemo(
    () => calculators.filter((c) => c.category === activeCalc.category && c.id !== activeCalc.id).slice(0, 6),
    [activeCalc]
  );

  const relatedArticle = useMemo(
    () => articles.find((a) => a.relatedCalcId === activeCalc.id) ?? null,
    [activeCalc.id]
  );

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return calculators.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleInputChange = (id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    setDraftValues((prev) => ({ ...prev, [id]: String(val) }));
  };

  const handleTextInputChange = (id: string, raw: string) => {
    if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
    setDraftValues((prev) => ({ ...prev, [id]: raw }));
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      setValues((prev) => ({ ...prev, [id]: 0 }));
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      setValues((prev) => ({ ...prev, [id]: parsed }));
    }
  };

  const handleReset = () => {
    const defaults: Record<string, number> = {};
    const drafts: Record<string, string> = {};
    for (const inp of activeCalc.inputs) {
      defaults[inp.id] = inp.val;
      drafts[inp.id] = String(inp.val);
    }
    setValues(defaults);
    setDraftValues(drafts);
  };

  const handleSave = () => {
    onSaveSnapshot(
      activeCalc.id,
      activeCalc.name,
      activeCalc.category,
      result.primary,
      result.primaryLabel,
      { ...values }
    );
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const breakdownTotal = result.breakdown?.reduce((sum, b) => sum + Math.max(0, b.value), 0) ?? 0;

  const selectionCalcs = useMemo(
    () =>
      selectedCategory === 'All'
        ? calculators
        : calculators.filter((c) => c.category === selectedCategory),
    [selectedCategory]
  );

  const quickStripCalcs = useMemo(
    () =>
      selectedCategory === 'All'
        ? calculators.filter((c) => c.category === activeCalc.category)
        : selectionCalcs,
    [selectedCategory, activeCalc.category, selectionCalcs]
  );

  const activeIdx = calculators.findIndex((c) => c.id === activeCalc.id);
  const prevCalc = calculators[(activeIdx - 1 + calculators.length) % calculators.length];
  const nextCalc = calculators[(activeIdx + 1) % calculators.length];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* Top Calculator Selection Bar */}
      <section
        aria-label="Calculator selection bar"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? calculators.length
                  : calculators.filter((c) => c.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat !== 'All' && activeCalc.category !== cat) {
                      const firstInCat = calculators.find((c) => c.category === cat);
                      if (firstInCat) onSelectCalc(firstInCat.id);
                    }
                  }}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Direct Selector + Prev / Next */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="quick-calc-select" className="sr-only">
              Select calculator
            </label>
            <select
              id="quick-calc-select"
              value={activeCalc.id}
              onChange={(e) => onSelectCalc(e.target.value)}
              className="h-9 flex-1 sm:w-72 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedCategory === 'All'
                ? (['Finance', 'Fitness', 'Math', 'Engineering'] as CalcCategory[]).map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {calculators
                        .filter((c) => c.category === cat)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </optgroup>
                  ))
                : selectionCalcs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
            </select>

            <a
              href={`/calc/${prevCalc.id}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  onSelectCalc(prevCalc.id);
                }
              }}
              aria-label={`Previous calculator: ${prevCalc.name}`}
              title={prevCalc.name}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </a>
            <a
              href={`/calc/${nextCalc.id}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  onSelectCalc(nextCalc.id);
                }
              }}
              aria-label={`Next calculator: ${nextCalc.name}`}
              title={nextCalc.name}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Horizontal Quick-Switch Strip */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {quickStripCalcs.map((calc) => {
            const isCurrent = calc.id === activeCalc.id;
            return (
              <a
                key={calc.id}
                href={`/calc/${calc.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onSelectCalc(calc.id);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {calc.name}
              </a>
            );
          })}
        </div>
      </section>

      {/* Active Calculator Workspace */}
      <section aria-labelledby="calc-heading" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{activeCalc.category}</span>
              <span aria-hidden="true">·</span>
              <code className="font-mono text-slate-700 dark:text-slate-300">{activeCalc.formulaExplanation}</code>
            </div>
            <h1
              id="calc-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance"
            >
              {activeCalc.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{activeCalc.desc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <a
              href="/compare"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('compare');
                }
              }}
              className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Compare What-If</span>
            </a>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{savedNotice ? 'Saved to History' : 'Save Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* Inputs + Live Results Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs Panel */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">Input Parameters</h2>
            <div className="space-y-4">
              {activeCalc.inputs.map((inp) => {
                const currentVal = values[inp.id] ?? inp.val;
                if (inp.options && inp.options.length > 0) {
                  return (
                    <div key={inp.id} className="space-y-1.5">
                      <label
                        htmlFor={`input-${inp.id}`}
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {inp.label}
                      </label>
                      <select
                        id={`input-${inp.id}`}
                        value={currentVal}
                        onChange={(e) => handleInputChange(inp.id, Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {inp.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={inp.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`input-${inp.id}`}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {inp.label}
                      </label>
                      {inp.unit && (
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{inp.unit}</span>
                      )}
                    </div>
                    <input
                      id={`input-${inp.id}`}
                      type="text"
                      inputMode="decimal"
                      value={draftValues[inp.id] ?? String(currentVal)}
                      onChange={(e) => handleTextInputChange(inp.id, e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="range"
                      aria-label={`${inp.label} slider`}
                      min={inp.min}
                      max={inp.max}
                      step={inp.step}
                      value={Math.min(inp.max, Math.max(inp.min, currentVal))}
                      onChange={(e) => handleInputChange(inp.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outputs & Schedule Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{result.primaryLabel}</p>
                <p className="mt-1 font-mono tabular-nums text-3xl sm:text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                  {result.primary}
                </p>
              </div>

              {result.breakdown && breakdownTotal > 0 && (
                <div className="space-y-2">
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                    {result.breakdown.map((b) => (
                      <div
                        key={b.label}
                        style={{
                          width: `${(Math.max(0, b.value) / breakdownTotal) * 100}%`,
                          backgroundColor: b.color,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                    {result.breakdown.map((b) => (
                      <span key={b.label} className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                        <span>
                          {b.label}: {((Math.max(0, b.value) / breakdownTotal) * 100).toFixed(1)}%
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.details.map((d) => (
                  <div key={d.label} className="space-y-0.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.label}</p>
                    <p className="font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
                      {d.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {result.schedule && result.schedule.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Amortization &amp; Growth Schedule
                  </h2>
                  {result.schedule.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowFullSchedule((s) => !s)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
                    >
                      {showFullSchedule ? 'Show Compact' : `Show All (${result.schedule.length})`}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Period</th>
                        {result.schedule[0].payment !== undefined && (
                          <th className="px-4 py-2.5 font-semibold text-right">Payment</th>
                        )}
                        {result.schedule[0].principal !== undefined && (
                          <th className="px-4 py-2.5 font-semibold text-right">Principal</th>
                        )}
                        {result.schedule[0].interest !== undefined && (
                          <th className="px-4 py-2.5 font-semibold text-right">Interest</th>
                        )}
                        <th className="px-4 py-2.5 font-semibold text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                      {(showFullSchedule ? result.schedule : result.schedule.slice(0, 8)).map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-300">
                            {row.period}
                          </td>
                          {row.payment !== undefined && (
                            <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">{row.payment}</td>
                          )}
                          {row.principal !== undefined && (
                            <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">
                              {row.principal}
                            </td>
                          )}
                          {row.interest !== undefined && (
                            <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{row.interest}</td>
                          )}
                          <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                            {row.balance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Unique Formula, Methodology & FAQs for the Active Calculator */}
      <section
        aria-labelledby="methodology-heading"
        className="border-t border-slate-200 dark:border-slate-800 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h2 id="methodology-heading" className="font-display text-xl font-bold text-slate-900 dark:text-white">
              About the {activeCalc.name} Formula
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{activeCalc.methodology}</p>
            <div className="mt-3 p-3.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
              {activeCalc.formulaExplanation}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {activeCalc.faqs.map((faq) => (
                <div key={faq.q} className="py-4 space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{faq.q}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-6">
          {relatedArticle && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Deep Dive · {relatedArticle.readTime}
              </p>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {relatedArticle.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{relatedArticle.summary}</p>
              <a
                href="/knowledge"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate('knowledge');
                  }
                }}
                className="inline-block pt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Read formula guide →
              </a>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Related {activeCalc.category} Tools
            </h3>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {relatedCalcs.map((rc) => (
                <li key={rc.id} className="py-2.5 first:pt-0 last:pb-0">
                  <a
                    href={`/calc/${rc.id}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                        e.preventDefault();
                        onSelectCalc(rc.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="block group"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {rc.name}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{rc.desc}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Complete 51-Calculator Directory with Real Crawlable <a href> Links */}
      <section aria-labelledby="directory-heading" className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 id="directory-heading" className="font-display text-xl font-bold text-slate-900 dark:text-white">
              All 51 Precision Calculators
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse by domain or search formulas across finance, fitness, mathematics, and engineering.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 51 calculators..."
              aria-label="Search calculators"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? calculators.length : calculators.filter((c) => c.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {filteredDirectory.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No calculators matched "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((calc) => {
              const isCurrent = calc.id === activeCalc.id;
              return (
                <a
                  key={calc.id}
                  href={`/calc/${calc.id}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                      e.preventDefault();
                      onSelectCalc(calc.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`block rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{calc.category}</div>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-900 dark:text-white">{calc.name}</h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{calc.desc}</p>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

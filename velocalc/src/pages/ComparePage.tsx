import React, { useEffect, useMemo, useState } from 'react';
import { calculators } from '../data/calculators.ts';
import type { CurrencyCode } from '../types.ts';

interface ComparePageProps {
  currency: CurrencyCode;
  initialCalcId?: string;
}

export const ComparePage: React.FC<ComparePageProps> = ({ currency, initialCalcId }) => {
  const [selectedId, setSelectedId] = useState<string>(initialCalcId || 'mortgage');

  const activeCalc = useMemo(
    () => calculators.find((c) => c.id === selectedId) ?? calculators[0],
    [selectedId]
  );

  const [scenarioA, setScenarioA] = useState<Record<string, number>>({});
  const [scenarioB, setScenarioB] = useState<Record<string, number>>({});
  const [draftA, setDraftA] = useState<Record<string, string>>({});
  const [draftB, setDraftB] = useState<Record<string, string>>({});

  useEffect(() => {
    const baseA: Record<string, number> = {};
    const baseB: Record<string, number> = {};
    const strA: Record<string, string> = {};
    const strB: Record<string, string> = {};
    for (const inp of activeCalc.inputs) {
      baseA[inp.id] = inp.val;
      if (inp.id === 'years' && inp.val === 30) {
        baseB[inp.id] = 15;
      } else if (inp.id === 'rate' && inp.val > 1) {
        baseB[inp.id] = Math.max(inp.min, Number((inp.val - 0.75).toFixed(2)));
      } else if (inp.id === 'monthly' && inp.val > 0) {
        baseB[inp.id] = Math.min(inp.max, Math.round(inp.val * 1.5));
      } else {
        baseB[inp.id] = inp.val;
      }
      strA[inp.id] = String(baseA[inp.id]);
      strB[inp.id] = String(baseB[inp.id]);
    }
    setScenarioA(baseA);
    setScenarioB(baseB);
    setDraftA(strA);
    setDraftB(strB);
  }, [activeCalc]);

  const resA = useMemo(() => activeCalc.calc(scenarioA, currency), [activeCalc, scenarioA, currency]);
  const resB = useMemo(() => activeCalc.calc(scenarioB, currency), [activeCalc, scenarioB, currency]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">What-If Scenario Studio</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Side-by-Side Scenario Comparison
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Test two parameter sets side-by-side across any of the 51 calculators.
          </p>
        </div>

        <div className="w-full md:w-80">
          <label htmlFor="compare-calc-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Select Calculator
          </label>
          <select
            id="compare-calc-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {calculators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {[
          {
            label: 'Scenario A (Baseline)',
            state: scenarioA,
            setter: setScenarioA,
            draft: draftA,
            setDraft: setDraftA,
            res: resA,
            accent: 'text-slate-900 dark:text-white',
          },
          {
            label: 'Scenario B (Alternative)',
            state: scenarioB,
            setter: setScenarioB,
            draft: draftB,
            setDraft: setDraftB,
            res: resB,
            accent: 'text-indigo-600 dark:text-indigo-400',
          },
        ].map((col) => (
          <div
            key={col.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{col.label}</p>
                <p className={`mt-1 font-mono tabular-nums text-2xl sm:text-3xl font-bold ${col.accent}`}>
                  {col.res.primary}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{col.res.primaryLabel}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCalc.inputs.map((inp) => {
                  const val = col.state[inp.id] ?? inp.val;
                  if (inp.options) {
                    return (
                      <div key={inp.id} className="space-y-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                          {inp.label}
                        </label>
                        <select
                          value={val}
                          onChange={(e) => col.setter((p) => ({ ...p, [inp.id]: Number(e.target.value) }))}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100"
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
                    <div key={inp.id} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        {inp.label}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={col.draft[inp.id] ?? String(val)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
                          col.setDraft((p) => ({ ...p, [inp.id]: raw }));
                          if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
                            col.setter((p) => ({ ...p, [inp.id]: 0 }));
                            return;
                          }
                          const parsed = Number(raw);
                          if (Number.isFinite(parsed)) {
                            col.setter((p) => ({ ...p, [inp.id]: parsed }));
                          }
                        }}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
              {col.res.details.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{d.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {d.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

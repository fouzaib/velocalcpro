import React, { useState, useMemo } from 'react';
import { Calculator, CurrencyKey } from '../types';
import { ArrowLeftRight, Check, Sparkles } from 'lucide-react';

interface ComparePageProps {
  calculators: Calculator[];
  initialCalcId?: string;
  currency: CurrencyKey;
  onOpenCalc: (id: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  calculators,
  initialCalcId = 'mortgage',
  currency,
  onOpenCalc,
}) => {
  const [selectedCalcId, setSelectedCalcId] = useState(initialCalcId);

  const calc = useMemo(() => {
    return calculators.find((c) => c.id === selectedCalcId) || calculators[0];
  }, [calculators, selectedCalcId]);

  // Scenario A inputs
  const [inputsA, setInputsA] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    calc.inputs.forEach((inp) => (init[inp.id] = inp.val));
    return init;
  });

  // Scenario B inputs (with slight variation for comparison)
  const [inputsB, setInputsB] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    calc.inputs.forEach((inp) => {
      // Create sensible default variation
      if (inp.id === 'term') init[inp.id] = 15;
      else if (inp.id === 'rate' || inp.id === 'roi') init[inp.id] = inp.val + 1.5;
      else if (inp.id === 'monthly') init[inp.id] = inp.val * 1.5;
      else if (inp.id === 'downPay') init[inp.id] = inp.val * 1.25;
      else init[inp.id] = inp.val;
    });
    return init;
  });

  // Re-sync when calculator changes
  React.useEffect(() => {
    const initA: Record<string, number> = {};
    const initB: Record<string, number> = {};
    calc.inputs.forEach((inp) => {
      initA[inp.id] = inp.val;
      if (inp.id === 'term') initB[inp.id] = Math.max(1, Math.round(inp.val / 2));
      else if (inp.id === 'rate' || inp.id === 'roi') initB[inp.id] = inp.val + 1;
      else if (inp.id === 'monthly') initB[inp.id] = Math.round(inp.val * 1.3);
      else initB[inp.id] = inp.val;
    });
    setInputsA(initA);
    setInputsB(initB);
  }, [calc]);

  const resA = useMemo(() => calc.calc(inputsA, currency), [calc, inputsA, currency]);
  const resB = useMemo(() => calc.calc(inputsB, currency), [calc, inputsB, currency]);

  // Copy values from A to B
  const copyAtoB = () => {
    setInputsB({ ...inputsA });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Decision Analysis
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Side-by-Side What-If Comparison
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate tradeoffs between two scenarios simultaneously with instant reactive deltas.
          </p>
        </div>

        {/* Calculator Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="compare-calc-select" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Tool:
          </label>
          <select
            id="compare-calc-select"
            value={calc.id}
            onChange={(e) => setSelectedCalcId(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            {calculators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Delta Banner */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Delta Summary
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Scenario A: <span className="font-mono text-indigo-600 dark:text-indigo-400">{resA.primary}</span> vs Scenario B: <span className="font-mono text-emerald-600 dark:text-emerald-400">{resB.primary}</span>
            </div>
          </div>
        </div>

        <button
          onClick={copyAtoB}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 transition"
        >
          Clone A to B
        </button>
      </div>

      {/* Side-by-Side Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scenario A Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Baseline
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Scenario A
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Result</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                {resA.primary}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {calc.inputs.map((inp) => (
              <div key={inp.id} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  {inp.label}
                </label>
                <input
                  type="number"
                  value={inputsA[inp.id] ?? inp.val}
                  step={inp.step ?? 'any'}
                  onChange={(e) =>
                    setInputsA({ ...inputsA, [inp.id]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ))}
          </div>

          {resA.details && resA.details.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Metrics</span>
              {resA.details.map((d, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-500">{d.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{d.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scenario B Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200/80 dark:border-emerald-950 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Alternative
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Scenario B
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Result</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {resB.primary}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {calc.inputs.map((inp) => (
              <div key={inp.id} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  {inp.label}
                </label>
                <input
                  type="number"
                  value={inputsB[inp.id] ?? inp.val}
                  step={inp.step ?? 'any'}
                  onChange={(e) =>
                    setInputsB({ ...inputsB, [inp.id]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            ))}
          </div>

          {resB.details && resB.details.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Metrics</span>
              {resB.details.map((d, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-500">{d.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{d.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Launch Link */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-300">
          Want the full amortization schedule or SVG chart for {calc.name}?
        </span>
        <button
          onClick={() => onOpenCalc(calc.id)}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Open Full Tool Studio</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
};

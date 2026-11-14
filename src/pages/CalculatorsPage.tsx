import React, { useState, useMemo } from 'react';
import { Calculator, CalculatorCategory, CurrencyKey, HistoryRecord } from '../types';
import { VisualChart } from '../components/VisualChart';
import { sanitizeCsvField } from '../utils/format';
import { 
  Star, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Printer, 
  Table, 
  Search, 
  BookmarkCheck,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface CalculatorsPageProps {
  calculators: Calculator[];
  activeCalcId: string;
  onSelectCalc: (id: string) => void;
  currency: CurrencyKey;
  pinnedIds: string[];
  onTogglePin: (id: string) => void;
  onSaveHistory: (record: HistoryRecord) => void;
  onAskAi: (calc: Calculator, res: string) => void;
  accentColor: string;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  calculators,
  activeCalcId,
  onSelectCalc,
  currency,
  pinnedIds,
  onTogglePin,
  onSaveHistory,
  onAskAi,
  accentColor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Active calculator
  const activeCalc = useMemo(() => {
    return calculators.find((c) => c.id === activeCalcId) || calculators[0];
  }, [calculators, activeCalcId]);

  // Current inputs state for active calc
  const [inputValues, setInputValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activeCalc.inputs.forEach((inp) => {
      init[inp.id] = inp.val;
    });
    return init;
  });

  // Re-sync when active calculator changes
  React.useEffect(() => {
    const init: Record<string, number> = {};
    activeCalc.inputs.forEach((inp) => {
      init[inp.id] = inp.val;
    });
    setInputValues(init);
    setShowSchedule(false);
  }, [activeCalc]);

  const handleInputChange = (id: string, val: number) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: isNaN(val) ? 0 : val,
    }));
  };

  // Compute live result
  const result = useMemo(() => {
    return activeCalc.calc(inputValues, currency);
  }, [activeCalc, inputValues, currency]);

  // Copy result
  const handleCopyResult = () => {
    const text = `${activeCalc.name}: ${result.primary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share calculation URL
  const handleShare = () => {
    const params = new URLSearchParams();
    Object.entries(inputValues).forEach(([k, v]) => params.set(k, String(v)));
    const shareUrl = `${window.location.origin}${window.location.pathname}#calc=${activeCalc.id}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2200);
  };

  // Save to history
  const handleSave = () => {
    const record: HistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      calcId: activeCalc.id,
      calcName: activeCalc.name,
      category: activeCalc.category,
      primaryResult: result.primary,
      timestamp: Date.now(),
      inputSnapshot: { ...inputValues },
    };
    onSaveHistory(record);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows: string[][] = [
      [sanitizeCsvField('VeloCalc Pro - Calculation Export')],
      [sanitizeCsvField('Calculator'), sanitizeCsvField(activeCalc.name)],
      [sanitizeCsvField('Category'), sanitizeCsvField(activeCalc.category)],
      [sanitizeCsvField('Currency'), sanitizeCsvField(currency)],
      [sanitizeCsvField('Date'), sanitizeCsvField(new Date().toLocaleString())],
      [],
      [sanitizeCsvField('Input Parameter'), sanitizeCsvField('Value')],
    ];

    activeCalc.inputs.forEach((inp) => {
      rows.push([sanitizeCsvField(inp.label), sanitizeCsvField(inputValues[inp.id] ?? inp.val)]);
    });

    rows.push([]);
    rows.push([sanitizeCsvField('Primary Result'), sanitizeCsvField(result.primary)]);

    if (result.details && result.details.length > 0) {
      rows.push([]);
      rows.push([sanitizeCsvField('Detailed Metrics'), sanitizeCsvField('Value')]);
      result.details.forEach((d) => {
        rows.push([sanitizeCsvField(d.label), sanitizeCsvField(d.val)]);
      });
    }

    if (result.schedule && result.schedule.length > 0) {
      rows.push([]);
      rows.push([
        sanitizeCsvField('Year'),
        sanitizeCsvField('Principal Repaid'),
        sanitizeCsvField('Interest Repaid'),
        sanitizeCsvField('Remaining Balance'),
      ]);
      result.schedule.forEach((s) => {
        rows.push([
          sanitizeCsvField(s.year),
          sanitizeCsvField(s.principalPaid),
          sanitizeCsvField(s.interestPaid),
          sanitizeCsvField(s.balanceRemaining),
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VeloCalc_${activeCalc.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered calculators for directory
  const filteredCalculators = useMemo(() => {
    return calculators.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [calculators, selectedCategory, searchQuery]);

  const categories: CalculatorCategory[] = [
    'All',
    'Financial',
    'Fitness & Health',
    'Math',
    'Tech & Engineering',
  ];

  const isPinned = pinnedIds.includes(activeCalc.id);

  return (
    <div className="space-y-12">
      
      {/* Pinned Favorites Quick Access (if any) */}
      {pinnedIds.length > 0 && (
        <div className="no-print flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px] shrink-0">
            ★ Pinned:
          </span>
          {pinnedIds.map((id) => {
            const calc = calculators.find((c) => c.id === id);
            if (!calc) return null;
            const isCur = calc.id === activeCalc.id;
            return (
              <button
                key={id}
                onClick={() => onSelectCalc(id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition ${
                  isCur
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {calc.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Hero Active Calculator Studio */}
      <section className="print-calculator-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Printable Official Header */}
        <div className="hidden print:block px-6 pt-6 pb-4 border-b border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">VeloCalc Pro</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700">Official Calculation Summary</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified Client-Side Mathematical Modeling</p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono space-y-0.5">
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div>Currency Standard: {currency}</div>
            </div>
          </div>
        </div>

        {/* Studio Top Control Bar */}
        <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-850/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTogglePin(activeCalc.id)}
              className={`no-print p-1.5 rounded-lg border transition ${
                isPinned
                  ? 'text-amber-500 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500'
              }`}
              title={isPinned ? 'Unpin from favorites' : 'Pin to favorites'}
            >
              <Star className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{activeCalc.category}</span>
                <span aria-hidden="true">·</span>
                <span>Client-Side Local Computation</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                {activeCalc.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons (NO EMBED BUTTON / NO CODE DISPLAY) */}
          <div className="no-print flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Print calculation result sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Result</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Copy direct link to this calculation"
            >
              {shared ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shared ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Save snapshot to history"
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Star className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Export calculation to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Inputs & Outputs Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print-layout-grid">
          
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Input Parameters
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden print:inline-block">
                All values local
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed no-print">
              {activeCalc.desc}
            </p>

            <div className="space-y-4 pt-2">
              {activeCalc.inputs.map((inp) => {
                const val = inputValues[inp.id] ?? inp.val;
                return (
                  <div key={inp.id} className="space-y-1.5 print-input-row">
                    <div className="flex items-center justify-between text-xs">
                      <label 
                        htmlFor={`inp-${inp.id}`}
                        className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-900"
                      >
                        {inp.label}
                      </label>
                      {inp.help && (
                        <span className="no-print text-[11px] text-slate-400">{inp.help}</span>
                      )}
                    </div>
                    <div className="relative">
                      {/* Clean static text for print */}
                      <div className="hidden print:block font-mono text-sm font-bold text-slate-950 py-0.5">
                        {val} {inp.suffix ? inp.suffix : ''}
                      </div>
                      {/* Interactive input for screen */}
                      <input
                        id={`inp-${inp.id}`}
                        type="number"
                        value={val}
                        step={inp.step ?? 'any'}
                        min={inp.min}
                        max={inp.max}
                        onChange={(e) => handleInputChange(inp.id, parseFloat(e.target.value))}
                        className="print:hidden w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {activeCalc.formulaExplanation && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] print:text-slate-700">Formula: {activeCalc.formulaExplanation}</span>
                <button
                  onClick={() => onAskAi(activeCalc, result.primary)}
                  className="no-print flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Formula</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4 print-result-box">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-slate-900">
                  Calculated Result
                </span>
                <button
                  onClick={handleCopyResult}
                  className="no-print flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  title="Copy computed result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Primary Output */}
              <div 
                className="text-3xl sm:text-4xl font-extrabold tracking-tight select-all tabular-nums leading-none print-primary-value"
                style={{ color: 'var(--accent)' }}
              >
                {result.primary}
              </div>

              {/* Secondary Details */}
              {result.details && result.details.length > 0 && (
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
                  {result.details.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">{d.label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-slate-950 tabular-nums font-mono">
                        {d.val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart Visualization (if available) */}
              {result.chart && (
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700">
                  <VisualChart chartData={result.chart} accentColor={accentColor} />
                </div>
              )}

              {/* Schedule Accordion Toggle (if loan/mortgage) */}
              {result.schedule && result.schedule.length > 0 && (
                <div className="no-print pt-3 border-t border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5" />
                      <span>{showSchedule ? 'Hide Amortization Schedule' : 'View Yearly Amortization Schedule'}</span>
                    </span>
                    <span className="text-xs">{showSchedule ? '▲' : '▼'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Amortization Schedule View */}
        {showSchedule && result.schedule && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Annual Amortization Schedule
                </h3>
                <p className="text-xs text-slate-500">Principal and interest progression timeline</p>
              </div>
              <button
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-72 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 print-table-wrapper">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-semibold">
                  <tr>
                    <th className="p-3">Year</th>
                    <th className="p-3">Principal Paid</th>
                    <th className="p-3">Interest Paid</th>
                    <th className="p-3">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 font-mono tabular-nums">
                      <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">Year {row.year}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400">{row.principalPaid}</td>
                      <td className="p-3 text-rose-500">{row.interestPaid}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{row.balanceRemaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Printable Document Footer */}
        <div className="hidden print:block px-6 py-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-mono">
          VeloCalc Pro · 100% Client-Side Local Computation · Zero Data Logged or Transmitted · Verified Mathematical Modeling
        </div>

      </section>

      {/* Directory & Explorer Section */}
      <section id="directory-section" className="no-print space-y-6">
        
        {/* Filter & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Complete Calculator Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant access to all 51 precision mathematical utilities
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Live Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter calculators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          {categories.map((cat) => {
            const isSel = selectedCategory === cat;
            const count = cat === 'All' ? calculators.length : calculators.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums font-mono">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* 51 Calculators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalculators.map((calc) => {
            const isCur = calc.id === activeCalc.id;
            return (
              <div
                key={calc.id}
                onClick={() => {
                  onSelectCalc(calc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                  isCur
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>{calc.category}</span>
                    {pinnedIds.includes(calc.id) && (
                      <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {calc.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>{isCur ? 'Currently Active' : 'Load Calculator'}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};

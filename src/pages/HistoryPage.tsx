import React from 'react';
import { HistoryRecord, Calculator } from '../types';
import { sanitizeCsvField } from '../utils/format';
import { 
  History, 
  Trash2, 
  Download, 
  ArrowUpRight, 
  Clock, 
  Star, 
  StarOff 
} from 'lucide-react';

interface HistoryPageProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onLoadRecord: (record: HistoryRecord) => void;
  pinnedIds: string[];
  calculators: Calculator[];
  onTogglePin: (calcId: string) => void;
  onOpenCalc: (calcId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  onLoadRecord,
  pinnedIds,
  calculators,
  onTogglePin,
  onOpenCalc,
}) => {
  const exportAllHistoryCsv = () => {
    if (history.length === 0) return;

    const rows: string[][] = [
      [sanitizeCsvField('VeloCalc Pro - Saved History Audit Log')],
      [sanitizeCsvField('Export Date'), sanitizeCsvField(new Date().toISOString())],
      [sanitizeCsvField('Total Records'), sanitizeCsvField(history.length)],
      [],
      [
        sanitizeCsvField('Timestamp'),
        sanitizeCsvField('Calculator Name'),
        sanitizeCsvField('Category'),
        sanitizeCsvField('Primary Output'),
        sanitizeCsvField('Input Parameters Snapshot'),
      ],
    ];

    history.forEach((rec) => {
      const inputsStr = Object.entries(rec.inputSnapshot)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');

      rows.push([
        sanitizeCsvField(new Date(rec.timestamp).toLocaleString()),
        sanitizeCsvField(rec.calcName),
        sanitizeCsvField(rec.category),
        sanitizeCsvField(rec.primaryResult),
        sanitizeCsvField(inputsStr),
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VeloCalc_History_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Local Device Audit Trail
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Calculation History &amp; Saved Presets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            100% saved locally in your browser storage. Zero network transmission.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportAllHistoryCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All to CSV</span>
            </button>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-semibold text-rose-600 dark:text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Pinned Tools Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pinned Quick-Access Calculators ({pinnedIds.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Stars appear across top navigation</span>
        </div>

        {pinnedIds.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No calculators pinned yet. Click the star on any calculator to pin it here for quick access.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pinnedIds.map((id) => {
              const calc = calculators.find((c) => c.id === id);
              if (!calc) return null;
              return (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between group"
                >
                  <button
                    onClick={() => onOpenCalc(id)}
                    className="text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate pr-2"
                  >
                    {calc.name}
                  </button>
                  <button
                    onClick={() => onTogglePin(id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Unpin"
                  >
                    <StarOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Calculations Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recorded Calculations ({history.length})
            </h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              No saved calculations in this session yet.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Whenever you calculate values in any tool, click the &quot;Save&quot; button to store a snapshot here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{rec.calcName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rec.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {rec.primaryResult}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    {Object.entries(rec.inputSnapshot)
                      .slice(0, 3)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => onLoadRecord(rec)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <span>Load Snapshot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveHistoryItem(rec.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition rounded-lg"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

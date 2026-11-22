import React from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';
import type { HistoryRecord, PageId } from '../types.ts';

interface HistoryPageProps {
  records: HistoryRecord[];
  onLoadRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (page: PageId) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
  onNavigate,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Local Browser Storage</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Saved Calculation Snapshots
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Restore any previously saved input configuration and result directly inside its calculator.
          </p>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors whitespace-nowrap shrink-0"
          >
            Clear All History
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No saved calculation snapshots yet.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Run any calculator and click Save Snapshot to store your inputs locally for instant one-click restoration.
          </p>
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                onNavigate('calculators');
              }
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
          >
            Explore Calculators
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const inputSummary = Object.entries(rec.inputSnapshot)
              .map(([k, v]) => `${k}=${v}`)
              .join(' · ');

            return (
              <div
                key={rec.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{rec.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(rec.timestamp).toLocaleString()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rec.currency}</span>
                  </div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {rec.calcName}
                  </h2>
                  <p className="font-mono tabular-nums text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {rec.primaryLabel}: {rec.primaryResult}
                  </p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">{inputSummary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadRecord(rec)}
                    className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>Load Snapshot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    aria-label={`Delete ${rec.calcName} snapshot`}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

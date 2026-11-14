import React, { useState, useEffect, useRef } from 'react';
import { Calculator } from '../types';
import { Search, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  calculators: Calculator[];
  onSelectCalculator: (calcId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  calculators,
  onSelectCalculator,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = calculators.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type tool name or category... (e.g. mortgage, subnet, 1RM, tip)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No calculator found matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCalculator(c.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400">· {c.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {c.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation.tsx';
import { CalculatorsPage } from './pages/CalculatorsPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { KnowledgePage } from './pages/KnowledgePage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { AssistantPage } from './pages/AssistantPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { calculators } from './data/calculators.ts';
import type { CalcCategory, CurrencyCode, HistoryRecord, PageId } from './types.ts';

function parseLocation(): { page: PageId; calcId: string } {
  if (typeof window === 'undefined') {
    return { page: 'calculators', calcId: 'mortgage' };
  }
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path.startsWith('/calc/')) {
    const id = path.slice('/calc/'.length).replace(/\.html$/, '');
    const found = calculators.find((c) => c.id === id);
    if (found) return { page: 'calculators', calcId: found.id };
  }

  const clean = path.replace(/\.html$/, '');
  if (clean === '/compare') return { page: 'compare', calcId: 'mortgage' };
  if (clean === '/knowledge') return { page: 'knowledge', calcId: 'mortgage' };
  if (clean === '/history') return { page: 'history', calcId: 'mortgage' };
  if (clean === '/assistant') return { page: 'assistant', calcId: 'mortgage' };
  if (clean === '/privacy') return { page: 'privacy', calcId: 'mortgage' };

  return { page: 'calculators', calcId: 'mortgage' };
}

export default function App() {
  const initial = parseLocation();
  const [activePage, setActivePage] = useState<PageId>(initial.page);
  const [activeCalcId, setActiveCalcId] = useState<string>(initial.calcId);
  const [restoredInputs, setRestoredInputs] = useState<Record<string, number> | null>(null);

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('velocalc_currency') as CurrencyCode | null;
      if (saved) return saved;
    }
    return 'USD';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('velocalc_theme') === 'dark';
    }
    return false;
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('velocalc_history');
        if (raw) return JSON.parse(raw) as HistoryRecord[];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      window.localStorage.setItem('velocalc_theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('velocalc_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem('velocalc_currency', currency);
  }, [currency]);

  useEffect(() => {
    try {
      window.localStorage.setItem('velocalc_history', JSON.stringify(history));
    } catch {
      // Ignore storage quota issues
    }
  }, [history]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseLocation();
      setActivePage(parsed.page);
      setActiveCalcId(parsed.calcId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync <title>, <link rel="canonical">, <meta name="description">, and <meta name="robots">
  useEffect(() => {
    const origin = window.location.origin;
    const active = calculators.find((c) => c.id === activeCalcId);

    let title = 'VeloCalc Pro - 51 Precision Calculators';
    let description =
      'Clean, distraction-free suite of 51 precision calculators for finance, fitness, math, and engineering with live schedules, what-if comparison, and zero tracking.';
    let canonicalPath = '/';
    let robots = 'index, follow';

    if (activePage === 'calculators') {
      if (window.location.pathname.startsWith('/calc/') && active) {
        title = `${active.name} — Free Online ${active.category} Calculator | VeloCalc Pro`;
        description = `${active.desc} Formula: ${active.formulaExplanation}.`;
        canonicalPath = `/calc/${active.id}`;
      } else {
        canonicalPath = '/';
      }
    } else if (activePage === 'compare') {
      title = 'Side-by-Side What-If Calculator Comparison | VeloCalc Pro';
      description = 'Compare two financial, mortgage, loan, investment, or fitness scenarios side-by-side.';
      canonicalPath = '/compare';
    } else if (activePage === 'knowledge') {
      title = 'Formulas, Algorithms & Mathematical Guides | VeloCalc Pro';
      description =
        'Learn the exact equations behind mortgage amortization, the Rule of 72, Mifflin-St Jeor TDEE, CIDR subnetting, and 1RM strength modeling.';
      canonicalPath = '/knowledge';
    } else if (activePage === 'privacy') {
      title = 'Privacy Policy & Scientific Methodology | VeloCalc Pro';
      description =
        'Learn how VeloCalc Pro executes 100% client-side calculations with zero tracking and standardized mathematical formulas.';
      canonicalPath = '/privacy';
    } else if (activePage === 'history') {
      title = 'Calculation History | VeloCalc Pro';
      canonicalPath = '/history';
      robots = 'noindex, follow';
    } else if (activePage === 'assistant') {
      title = 'Velo Math & Formula Assistant | VeloCalc Pro';
      canonicalPath = '/assistant';
      robots = 'noindex, follow';
    }

    document.title = title;

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', `${origin}${canonicalPath}`);
    }

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', description);
    }

    let robotsEl = document.querySelector('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute('content', robots);
  }, [activePage, activeCalcId]);

  const handleNavigate = useCallback((page: PageId) => {
    setActivePage(page);
    const nextPath = page === 'calculators' ? '/' : `/${page}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectCalc = useCallback((calcId: string) => {
    setActiveCalcId(calcId);
    setActivePage('calculators');
    const nextPath = `/calc/${calcId}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }, []);

  const handleSaveSnapshot = useCallback(
    (
      calcId: string,
      calcName: string,
      category: CalcCategory,
      primaryResult: string,
      primaryLabel: string,
      inputSnapshot: Record<string, number>
    ) => {
      const record: HistoryRecord = {
        id: `${calcId}-${Date.now()}`,
        calcId,
        calcName,
        category,
        timestamp: Date.now(),
        primaryResult,
        primaryLabel,
        inputSnapshot,
        currency,
      };
      setHistory((prev) => [record, ...prev].slice(0, 50));
    },
    [currency]
  );

  const handleLoadRecord = useCallback((record: HistoryRecord) => {
    setCurrency(record.currency);
    setRestoredInputs(record.inputSnapshot);
    setActiveCalcId(record.calcId);
    setActivePage('calculators');
    const nextPath = `/calc/${record.calcId}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearRestored = useCallback(() => {
    setRestoredInputs(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navigation
        activePage={activePage}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <main className="flex-1">
        {activePage === 'calculators' && (
          <CalculatorsPage
            activeCalcId={activeCalcId}
            onSelectCalc={handleSelectCalc}
            onNavigate={handleNavigate}
            currency={currency}
            restoredInputs={restoredInputs}
            onClearRestoredInputs={handleClearRestored}
            onSaveSnapshot={handleSaveSnapshot}
          />
        )}
        {activePage === 'compare' && <ComparePage currency={currency} initialCalcId={activeCalcId} />}
        {activePage === 'knowledge' && <KnowledgePage onSelectCalc={handleSelectCalc} />}
        {activePage === 'history' && (
          <HistoryPage
            records={history}
            onLoadRecord={handleLoadRecord}
            onDeleteRecord={(id) => setHistory((prev) => prev.filter((r) => r.id !== id))}
            onClearAll={() => setHistory([])}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === 'assistant' && <AssistantPage onSelectCalc={handleSelectCalc} />}
        {activePage === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} VeloCalc Pro · 51 Precision Calculators</p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  handleNavigate('calculators');
                }
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Calculators
            </a>
            <a
              href="/compare"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  handleNavigate('compare');
                }
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Compare
            </a>
            <a
              href="/knowledge"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  handleNavigate('knowledge');
                }
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Knowledge
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  handleNavigate('privacy');
                }
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy &amp; Methodology
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { PageId, ThemeKey, CurrencyKey, HistoryRecord, ChatMessage } from './types';
import { calculators } from './data/calculators';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { ComparePage } from './pages/ComparePage';
import { KnowledgePage } from './pages/KnowledgePage';
import { HistoryPage } from './pages/HistoryPage';
import { AssistantPage } from './pages/AssistantPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { formatNumber } from './utils/format';

const themeColors: Record<ThemeKey, { accent: string; hover: string; light: string; border: string; glow: string }> = {
  indigo: { accent: '#4f46e5', hover: '#4338ca', light: 'rgba(79, 70, 229, 0.12)', border: 'rgba(79, 70, 229, 0.35)', glow: 'rgba(79, 70, 229, 0.25)' },
  emerald: { accent: '#10b981', hover: '#059669', light: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', glow: 'rgba(16, 185, 129, 0.25)' },
  cyan: { accent: '#06b6d4', hover: '#0891b2', light: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', glow: 'rgba(6, 182, 212, 0.25)' },
  rose: { accent: '#f43f5e', hover: '#e11d48', light: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)', glow: 'rgba(244, 63, 94, 0.25)' },
  amber: { accent: '#f59e0b', hover: '#d97706', light: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', glow: 'rgba(245, 158, 11, 0.25)' },
  violet: { accent: '#8b5cf6', hover: '#7c3aed', light: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', glow: 'rgba(139, 92, 246, 0.25)' },
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('calculators');
  const [activeCalcId, setActiveCalcId] = useState<string>('mortgage');
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(() => {
    return (localStorage.getItem('velocalc_theme_color') as ThemeKey) || 'indigo';
  });
  const [activeCurrency, setActiveCurrency] = useState<CurrencyKey>(() => {
    return (localStorage.getItem('velocalc_currency') as CurrencyKey) || 'USD';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('velocalc_theme_mode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Pinned favorites
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('velocalc_pinned');
      return saved ? JSON.parse(saved) : ['mortgage', 'loan', 'compound', 'bmi'];
    } catch {
      return ['mortgage', 'loan', 'compound', 'bmi'];
    }
  });

  // History records
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('velocalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Chat log for AI Assistant
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your Velo AI Guide. I can explain any mathematical formula, evaluate custom equations, and help you model financial or scientific scenarios. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);

  // Apply dark class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('velocalc_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('velocalc_theme_mode', 'light');
    }
  }, [isDark]);

  // Apply CSS color variables
  useEffect(() => {
    const t = themeColors[activeTheme] || themeColors.indigo;
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-hover', t.hover);
    r.style.setProperty('--accent-light', t.light);
    r.style.setProperty('--accent-border', t.border);
    r.style.setProperty('--accent-glow', t.glow);
    localStorage.setItem('velocalc_theme_color', activeTheme);
  }, [activeTheme]);

  // Hash route listener
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;

      if (hash.startsWith('page=')) {
        const page = hash.replace('page=', '') as PageId;
        if (['calculators', 'compare', 'knowledge', 'history', 'assistant', 'privacy'].includes(page)) {
          setActivePage(page);
        }
      } else if (hash.startsWith('calc=')) {
        const [calcPart] = hash.split('?');
        const calcId = calcPart.replace('calc=', '');
        if (calculators.some((c) => c.id === calcId)) {
          setActiveCalcId(calcId);
          setActivePage('calculators');
        }
      } else if (hash === 'privacy' || hash === 'terms') {
        setActivePage('privacy');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.location.hash = `page=${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCalc = (calcId: string) => {
    setActiveCalcId(calcId);
    setActivePage('calculators');
    window.location.hash = `calc=${calcId}`;
  };

  const handleTogglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        localStorage.setItem('velocalc_pinned', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSaveHistory = (record: HistoryRecord) => {
    setHistory((prev) => {
      const next = [record, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('velocalc_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('velocalc_history');
    } catch {}
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('velocalc_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleLoadRecord = (record: HistoryRecord) => {
    setActiveCalcId(record.calcId);
    setActivePage('calculators');
    window.location.hash = `calc=${record.calcId}`;
  };

  // AI Assistant message handler
  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setChatLog((prev) => [...prev, userMsg]);

    const q = text.toLowerCase();
    setTimeout(() => {
      let reply = '';
      let suggestedToolId: string | undefined;

      // 1. Math solver expression
      const mathMatch = text.match(/(?:calc|calculate|solve|math|eval)?\s*[:=]?\s*([0-9\.\+\-\*\/\^\(\)\s]+)/i);
      if (mathMatch && mathMatch[1].trim().length > 2 && /[\+\-\*\/\^]/.test(mathMatch[1])) {
        try {
          const expr = mathMatch[1].replace(/\^/g, '**');
          if (/^[0-9\.\+\-\*\/\(\)\s\*\*]+$/.test(expr)) {
            const sol = Function(`'use strict'; return (${expr})`)();
            if (!isNaN(sol) && isFinite(sol)) {
              reply = `Calculated: ${mathMatch[1].trim()} = ${formatNumber(sol, 4)}`;
            }
          }
        } catch {}
      }

      // 2. Domain answers
      if (!reply) {
        if (q.includes('mortgage') || q.includes('amortization') || q.includes('home loan')) {
          suggestedToolId = 'mortgage';
          reply = `Mortgage payments are calculated using fixed compound annuities: M = P[i(1+i)^n]/[(1+i)^n - 1].\n\nIn early years, interest dominates because it is charged on the large remaining principal. Extra principal payments reduce subsequent monthly interest compounding forever, shaving years off the repayment term.`;
        } else if (q.includes('rule of 72') || q.includes('doubling') || q.includes('compound')) {
          suggestedToolId = 'compound';
          reply = `The Rule of 72 is an algebraic approximation of compound doubling time:\n\nDoubling Years ≈ 72 / Annual Return Rate\n\nFor example, at an 8% expected return, capital doubles in approximately 9 years (72 / 8 = 9). At 12%, capital doubles in 6 years.`;
        } else if (q.includes('calorie') || q.includes('bmr') || q.includes('tdee') || q.includes('fat loss')) {
          suggestedToolId = 'calorie';
          reply = `Basal Metabolic Rate (BMR) measures energy required for cellular respiration at rest (via Mifflin-St Jeor). Total Daily Energy Expenditure (TDEE) multiplies BMR by activity factor.\n\nFor sustainable fat loss without metabolic slowdown, aim for a measured 15% to 20% deficit under TDEE.`;
        } else if (q.includes('subnet') || q.includes('cidr') || q.includes('mask') || q.includes('ipv4')) {
          suggestedToolId = 'subnet';
          reply = `In IPv4 CIDR notation (/xx), the prefix defines how many leading bits identify the network block. The remaining bits allocate host capacity:\n\nUsable Hosts = 2^(32 - Prefix) - 2\n\nFor example, a /24 network provides 256 addresses minus 2 reserves (network and broadcast), yielding 254 usable host addresses.`;
        } else if (q.includes('1rm') || q.includes('one rep max') || q.includes('strength')) {
          suggestedToolId = 'onerepmax';
          reply = `The One Rep Max estimator blends the Epley formula (W * [1 + r/30]) and Brzycki formula (W * [36 / (37 - r)]) to benchmark maximal strength from sets of 2 to 10 repetitions without maximal injury risk.`;
        } else {
          reply = `I can help you analyze any of our 51 precision calculators, evaluate equations, or compare what-if scenarios. Try selecting a calculator from the navigation or ask about specific financial or fitness equations!`;
        }
      }

      setChatLog((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: Date.now(),
          suggestedToolId,
        },
      ]);
    }, 200);
  }, []);

  const handleAskAiFromCalc = (calc: (typeof calculators)[0], primaryRes: string) => {
    setActivePage('assistant');
    handleSendMessage(`How does the formula for ${calc.name} work, and what does ${primaryRes} represent?`);
  };

  const activeCalc = calculators.find((c) => c.id === activeCalcId) || calculators[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Persistent Navigation Menu */}
      <Navigation
        activePage={activePage}
        onNavigate={handleNavigate}
        activeTheme={activeTheme}
        onThemeChange={(t) => setActiveTheme(t)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        activeCurrency={activeCurrency}
        onCurrencyChange={(curr) => setActiveCurrency(curr)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activePage === 'calculators' && (
          <CalculatorsPage
            calculators={calculators}
            activeCalcId={activeCalcId}
            onSelectCalc={handleSelectCalc}
            currency={activeCurrency}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
            onSaveHistory={handleSaveHistory}
            onAskAi={handleAskAiFromCalc}
            accentColor={themeColors[activeTheme]?.accent || '#4f46e5'}
          />
        )}

        {activePage === 'compare' && (
          <ComparePage
            calculators={calculators}
            initialCalcId={activeCalcId}
            currency={activeCurrency}
            onOpenCalc={handleSelectCalc}
          />
        )}

        {activePage === 'knowledge' && (
          <KnowledgePage onOpenCalc={handleSelectCalc} />
        )}

        {activePage === 'history' && (
          <HistoryPage
            history={history}
            onClearHistory={handleClearHistory}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onLoadRecord={handleLoadRecord}
            pinnedIds={pinnedIds}
            calculators={calculators}
            onTogglePin={handleTogglePin}
            onOpenCalc={handleSelectCalc}
          />
        )}

        {activePage === 'assistant' && (
          <AssistantPage
            chatLog={chatLog}
            onSendMessage={handleSendMessage}
            onClearChat={() => setChatLog([])}
            activeCalc={activeCalc}
            onOpenCalc={handleSelectCalc}
          />
        )}

        {activePage === 'privacy' && <PrivacyPage />}
      </main>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        calculators={calculators}
        onSelectCalculator={handleSelectCalc}
      />

      {/* Distraction-Free Compliance Footer (No Ads, No Embed Code, Clean Typography) */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              ⚡
            </div>
            <span className="font-bold text-slate-900 dark:text-white">VeloCalc Pro</span>
            <span>· 51 Precision Calculation Engines</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
            <button onClick={() => handleNavigate('calculators')} className="hover:text-slate-900 dark:hover:text-white transition">
              Calculators
            </button>
            <button onClick={() => handleNavigate('compare')} className="hover:text-slate-900 dark:hover:text-white transition">
              Compare Studio
            </button>
            <button onClick={() => handleNavigate('knowledge')} className="hover:text-slate-900 dark:hover:text-white transition">
              Formulas &amp; Guides
            </button>
            <button onClick={() => handleNavigate('history')} className="hover:text-slate-900 dark:hover:text-white transition">
              Audit History
            </button>
            <button onClick={() => handleNavigate('assistant')} className="hover:text-slate-900 dark:hover:text-white transition">
              AI Assistant
            </button>
            <button onClick={() => handleNavigate('privacy')} className="hover:text-slate-900 dark:hover:text-white transition">
              Privacy &amp; Terms
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            100% Client-Side Computation · Zero Server Tracking
          </p>
        </div>
      </footer>

    </div>
  );
}

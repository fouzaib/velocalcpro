import React, { useState } from 'react';
import { PageId, ThemeKey, CurrencyKey } from '../types';
import { 
  Calculator, 
  Scale, 
  BookOpen, 
  History, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Palette
} from 'lucide-react';

interface NavigationProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  activeTheme: ThemeKey;
  onThemeChange: (theme: ThemeKey) => void;
  isDark: boolean;
  onToggleDark: () => void;
  activeCurrency: CurrencyKey;
  onCurrencyChange: (curr: CurrencyKey) => void;
  onOpenCommandPalette: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  activeTheme,
  onThemeChange,
  isDark,
  onToggleDark,
  activeCurrency,
  onCurrencyChange,
  onOpenCommandPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'calculators', label: 'Calculators', icon: <Calculator className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <Scale className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const themeOptions: { key: ThemeKey; label: string; color: string }[] = [
    { key: 'indigo', label: 'Indigo', color: '#4f46e5' },
    { key: 'emerald', label: 'Emerald', color: '#10b981' },
    { key: 'cyan', label: 'Cyan', color: '#06b6d4' },
    { key: 'rose', label: 'Rose', color: '#f43f5e' },
    { key: 'amber', label: 'Amber', color: '#f59e0b' },
    { key: 'violet', label: 'Violet', color: '#8b5cf6' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <button 
          onClick={() => onNavigate('calculators')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: 'var(--accent)' }}>
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                VeloCalc
              </span>
              <span className="text-xs font-black tracking-wider uppercase" style={{ color: 'var(--accent)' }}>
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              51 Client-Side Tools
            </span>
          </div>
        </button>

        {/* Persistent Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Quick Command Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-xl border border-slate-200/60 dark:border-slate-700 transition"
            title="Search 51 Calculators (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 rounded text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Currency Selector */}
          <select
            value={activeCurrency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyKey)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-700 transition"
            title="Change currency"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="INR">INR (₹)</option>
          </select>

          {/* Theme Palette Picker Popover */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition"
              title="Theme Accent Color"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 mt-2 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1.5 z-50">
                {themeOptions.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      onThemeChange(t.key);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      activeTheme === t.key ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: t.color }}
                    title={t.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

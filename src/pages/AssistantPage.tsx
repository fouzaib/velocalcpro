import React, { useState } from 'react';
import { ChatMessage, Calculator } from '../types';
import { formatNumber } from '../utils/format';
import { Sparkles, Send, Trash2, ArrowRight } from 'lucide-react';

interface AssistantPageProps {
  chatLog: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  activeCalc: Calculator;
  onOpenCalc: (calcId: string) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  chatLog,
  onSendMessage,
  onClearChat,
  activeCalc,
  onOpenCalc,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    `How does the ${activeCalc.name} formula work?`,
    'How do early mortgage payments save interest?',
    'What is the Rule of 72 for investment doubling?',
    'Calculate math: 50000 * (1 + 0.07)^15',
    'How do I calculate calories for steady fat loss?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mathematical &amp; Algorithmic Intelligence
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Velo AI Guide &amp; Math Solver
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask formula explanations, tradeoffs between options, or run quick arbitrary equations.
          </p>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(p)}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {chatLog.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}
          >
            {msg.sender === 'assistant' && (
              <div 
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                ⚡
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.suggestedToolId && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => onOpenCalc(msg.suggestedToolId!)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Launch Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a mathematical formula, financial scenario, or type an equation (e.g. 1000 * (1+0.05)^10)..."
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>

    </div>
  );
};

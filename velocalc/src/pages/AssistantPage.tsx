import React, { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { calculators } from '../data/calculators.ts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedCalcId?: string;
}

interface AssistantPageProps {
  onSelectCalc: (calcId: string) => void;
}

const STARTER_PROMPTS = [
  'Explain how a 15-year vs 30-year mortgage impacts total interest on $400,000.',
  'How do I calculate usable hosts in a /26 IPv4 subnet?',
  'Derive the Rule of 72 and check when it differs from exact doubling time.',
  'How do I pick a resistor for a 3.2V blue LED on a 5V USB rail at 15 mA?',
];

export const AssistantPage: React.FC<AssistantPageProps> = ({ onSelectCalc }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask any question about financial formulas, nutrition math, engineering equations, or which of the 51 VeloCalc Pro tools fits your problem.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned status ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'No response generated.',
          recommendedCalcId: data.recommendedCalcId,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the assistant API endpoint.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Formula &amp; Equation Guide</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Velo Math &amp; Formula Assistant
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Step-by-step equation derivations, parameter explanations, and calculator recommendations powered by Gemini.
        </p>
      </div>

      {/* Starter Prompts */}
      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => sendMessage(q)}
            className="text-left text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 min-h-[320px] max-h-[520px] overflow-y-auto">
        {messages.map((msg, idx) => {
          const recCalc = msg.recommendedCalcId
            ? calculators.find((c) => c.id === msg.recommendedCalcId)
            : null;
          return (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                {msg.content}
              </div>
              {recCalc && (
                <a
                  href={`/calc/${recCalc.id}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                      e.preventDefault();
                      onSelectCalc(recCalc.id);
                    }
                  }}
                  className="mt-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open {recCalc.name} →
                </a>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Solving and deriving formula...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a math, finance, fitness, or engineering question..."
          aria-label="Ask a formula question"
          className="flex-1 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-11 px-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};

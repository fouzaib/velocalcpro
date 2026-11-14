import React from 'react';
import { ChartData } from '../types';
import { formatNumber } from '../utils/format';

interface VisualChartProps {
  chartData: ChartData;
  accentColor: string;
}

export const VisualChart: React.FC<VisualChartProps> = ({ chartData, accentColor }) => {
  const total = chartData.data.reduce((a, b) => a + b, 0);

  if (total <= 0) return null;

  // Render clean SVG Doughnut
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Color mapping
  const palette = [
    accentColor,
    '#f43f5e', // rose
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
  ];

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80">
      <div className="relative shrink-0 w-36 h-36 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 w-full h-full">
          {chartData.data.map((val, idx) => {
            const percent = val / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;
            const color = (chartData.colors && chartData.colors[idx]) || palette[idx % palette.length];

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Ratio
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            100%
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {chartData.labels.map((label, idx) => {
          const val = chartData.data[idx] || 0;
          const pct = Math.round((val / total) * 100);
          const color = (chartData.colors && chartData.colors[idx]) || palette[idx % palette.length];

          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-800 dark:text-slate-200 shrink-0 font-medium">
                <span>{pct}%</span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">({formatNumber(val, 0)})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

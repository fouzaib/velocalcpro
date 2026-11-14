import { CurrencyKey } from '../types';

export const currencySymbols: Record<CurrencyKey, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹',
};

export function formatCurrency(amount: number, currency: CurrencyKey = 'USD'): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return `${currencySymbols[currency] || '$'}0.00`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(val: number, maxDecimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Number(val).toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function sanitizeCsvField(val: string | number | null | undefined): string {
  let str = String(val ?? '');
  // Prevent CSV injection if starting with formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

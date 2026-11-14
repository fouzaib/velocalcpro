export type PageId = 'calculators' | 'compare' | 'knowledge' | 'history' | 'assistant' | 'privacy';

export type ThemeKey = 'indigo' | 'emerald' | 'cyan' | 'rose' | 'amber' | 'violet';

export type CurrencyKey = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR';

export type CalculatorCategory = 'All' | 'Financial' | 'Fitness & Health' | 'Math' | 'Tech & Engineering';

export interface CalculatorInput {
  id: string;
  label: string;
  val: number;
  step?: number | string;
  min?: number;
  max?: number;
  suffix?: string;
  help?: string;
}

export interface DetailItem {
  label: string;
  val: string;
  sub?: string;
}

export interface ScheduleItem {
  year: number;
  principalPaid: string;
  interestPaid: string;
  balanceRemaining: string;
}

export interface ChartData {
  type: 'doughnut' | 'bar' | 'line';
  labels: string[];
  data: number[];
  colors?: string[];
}

export interface CalculationResult {
  primary: string;
  details: DetailItem[];
  chart?: ChartData;
  schedule?: ScheduleItem[];
  note?: string;
}

export interface Calculator {
  id: string;
  name: string;
  category: 'Financial' | 'Fitness & Health' | 'Math' | 'Tech & Engineering';
  desc: string;
  formulaExplanation?: string;
  iconName?: string;
  inputs: CalculatorInput[];
  calc: (values: Record<string, number>, currency: CurrencyKey) => CalculationResult;
}

export interface HistoryRecord {
  id: string;
  calcId: string;
  calcName: string;
  category: string;
  primaryResult: string;
  timestamp: number;
  inputSnapshot: Record<string, number>;
}

export interface Article {
  id: string;
  title: string;
  category: 'Finance' | 'Health' | 'Tech & Math';
  readTime: string;
  summary: string;
  relatedCalcId: string;
  sections: {
    heading: string;
    body: string;
    formula?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedToolId?: string;
}

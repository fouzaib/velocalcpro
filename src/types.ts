export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export type CalcCategory = 'Finance' | 'Fitness' | 'Math' | 'Engineering';

export type PageId =
  | 'calculators'
  | 'compare'
  | 'knowledge'
  | 'history'
  | 'assistant'
  | 'privacy'
  | 'about'
  | 'contact'
  | 'terms';

export interface CalcInputOption {
  label: string;
  value: number;
}

export interface CalcInput {
  id: string;
  label: string;
  val: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  options?: CalcInputOption[];
}

export interface CalcDetail {
  label: string;
  val: string;
}

export interface ScheduleRow {
  period: string | number;
  payment?: string;
  principal?: string;
  interest?: string;
  balance: string;
}

export interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface CalcFaq {
  q: string;
  a: string;
}

export interface CalcResult {
  primary: string;
  primaryLabel: string;
  details: CalcDetail[];
  schedule?: ScheduleRow[];
  breakdown?: BreakdownItem[];
}

export interface CalculatorDef {
  id: string;
  name: string;
  category: CalcCategory;
  desc: string;
  formulaExplanation: string;
  methodology: string;
  faqs: CalcFaq[];
  inputs: CalcInput[];
  calc: (values: Record<string, number>, currency: CurrencyCode) => CalcResult;
}

export interface HistoryRecord {
  id: string;
  calcId: string;
  calcName: string;
  category: CalcCategory;
  timestamp: number;
  primaryResult: string;
  primaryLabel: string;
  inputSnapshot: Record<string, number>;
  currency: CurrencyCode;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: CalcCategory;
  readTime: string;
  summary: string;
  relatedCalcId: string;
  sections: {
    heading: string;
    body: string;
    formula?: string;
  }[];
}

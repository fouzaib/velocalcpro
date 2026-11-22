import type { CalculatorDef, CurrencyCode, ScheduleRow } from '../types.ts';

const CURRENCY_LOCALES: Record<CurrencyCode, { locale: string; symbol: string }> = {
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  INR: { locale: 'en-IN', symbol: '₹' },
  CAD: { locale: 'en-CA', symbol: 'CA$' },
  AUD: { locale: 'en-AU', symbol: 'A$' },
  JPY: { locale: 'ja-JP', symbol: '¥' },
};

export function fmtMoney(val: number, currency: CurrencyCode, decimals?: number): string {
  const safeVal = Number.isFinite(val) ? val : 0;
  const maxDigits = decimals ?? (currency === 'JPY' ? 0 : 2);
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency]?.locale || 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : maxDigits,
      maximumFractionDigits: maxDigits,
    }).format(safeVal);
  } catch {
    return `${CURRENCY_LOCALES[currency]?.symbol || '$'}${safeVal.toFixed(maxDigits)}`;
  }
}

export function fmtNum(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(val);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function factorial(n: number): number {
  const k = Math.max(0, Math.min(170, Math.floor(n)));
  let res = 1;
  for (let i = 2; i <= k; i++) res *= i;
  return res;
}

export const calculators: CalculatorDef[] = [
  // ===================== FINANCE (18) =====================
  {
    id: 'mortgage',
    name: 'Mortgage Payment & Amortization',
    category: 'Finance',
    desc: 'Calculate monthly principal, interest, property tax, and insurance with an annual amortization schedule.',
    formulaExplanation: 'M = P · [r(1 + r)^n] / [(1 + r)^n - 1]',
    methodology:
      'Computes fixed-rate monthly Principal & Interest using standard annuity amortization over 12×years periods, then adds monthly property tax and homeowner insurance escrows to show true monthly housing cost alongside a year-by-year paydown table.',
    faqs: [
      {
        q: 'How does a down payment change monthly mortgage costs?',
        a: 'Every dollar added to your down payment directly reduces principal P, lowering both monthly P&I payments and cumulative lifetime interest.',
      },
      {
        q: 'Why is interest highest in the first year?',
        a: 'Monthly interest equals remaining balance times r. Because principal is highest at origination, interest dominates early payments before flipping toward principal later in the term.',
      },
    ],
    inputs: [
      { id: 'price', label: 'Home Price', val: 450000, min: 50000, max: 3000000, step: 5000, unit: '$' },
      { id: 'downPct', label: 'Down Payment (%)', val: 20, min: 0, max: 80, step: 1, unit: '%' },
      { id: 'rate', label: 'Interest Rate (APR)', val: 6.5, min: 0.5, max: 15, step: 0.1, unit: '%' },
      { id: 'years', label: 'Loan Term (Years)', val: 30, min: 5, max: 40, step: 1, unit: 'yr' },
      { id: 'taxAnnual', label: 'Annual Property Tax', val: 5400, min: 0, max: 40000, step: 100, unit: '$/yr' },
    ],
    calc: (v, cur) => {
      const price = Math.max(0, v.price ?? 450000);
      const downPct = Math.min(99, Math.max(0, v.downPct ?? 20));
      const principal = price * (1 - downPct / 100);
      const annualRate = Math.max(0, v.rate ?? 6.5) / 100;
      const r = annualRate / 12;
      const years = Math.max(1, Math.round(v.years ?? 30));
      const n = years * 12;
      const monthlyPI = r === 0 ? principal / n : (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      const monthlyTax = Math.max(0, v.taxAnnual ?? 0) / 12;
      const totalMonthly = monthlyPI + monthlyTax;
      const totalInterest = monthlyPI * n - principal;

      const schedule: ScheduleRow[] = [];
      let bal = principal;
      for (let yr = 1; yr <= years; yr++) {
        let yrPrincipal = 0;
        let yrInterest = 0;
        for (let m = 0; m < 12; m++) {
          const interestM = bal * r;
          const principalM = Math.min(bal, monthlyPI - interestM);
          yrInterest += interestM;
          yrPrincipal += principalM;
          bal = Math.max(0, bal - principalM);
        }
        schedule.push({
          period: `Year ${yr}`,
          payment: fmtMoney(yrPrincipal + yrInterest, cur, 0),
          principal: fmtMoney(yrPrincipal, cur, 0),
          interest: fmtMoney(yrInterest, cur, 0),
          balance: fmtMoney(bal, cur, 0),
        });
      }

      return {
        primary: fmtMoney(totalMonthly, cur),
        primaryLabel: 'Estimated Monthly Payment',
        details: [
          { label: 'Principal & Interest', val: fmtMoney(monthlyPI, cur) },
          { label: 'Monthly Property Tax', val: fmtMoney(monthlyTax, cur) },
          { label: 'Loan Amount', val: fmtMoney(principal, cur, 0) },
          { label: 'Total Lifetime Interest', val: fmtMoney(totalInterest, cur, 0) },
          { label: 'Total Cost of Loan', val: fmtMoney(principal + totalInterest, cur, 0) },
        ],
        breakdown: [
          { label: 'Loan Principal', value: principal, color: '#4f46e5' },
          { label: 'Total Interest', value: Math.max(0, totalInterest), color: '#0ea5e9' },
        ],
        schedule,
      };
    },
  },
  {
    id: 'loan',
    name: 'Personal & Auto Loan',
    category: 'Finance',
    desc: 'Determine monthly installments, total interest expense, and payoff schedule for fixed-term installment loans.',
    formulaExplanation: 'PMT = P · r / [1 - (1 + r)^(-n)]',
    methodology:
      'Uses standard monthly compounding amortization for personal, auto, or student loans with zero prepayment penalties assumed.',
    faqs: [
      {
        q: 'Does shortening a loan term always save money?',
        a: 'Yes. Even though monthly payments rise when n decreases, total interest drops significantly because the balance is outstanding for fewer compounding months.',
      },
      {
        q: 'What happens at 0% APR financing?',
        a: 'When APR is 0%, the formula reduces to simple division: Loan Amount divided by total months.',
      },
    ],
    inputs: [
      { id: 'amount', label: 'Loan Amount', val: 25000, min: 500, max: 500000, step: 500, unit: '$' },
      { id: 'rate', label: 'Annual Interest Rate', val: 7.2, min: 0, max: 36, step: 0.1, unit: '%' },
      { id: 'months', label: 'Term (Months)', val: 60, min: 6, max: 120, step: 6, unit: 'mo' },
    ],
    calc: (v, cur) => {
      const P = Math.max(0, v.amount ?? 25000);
      const r = Math.max(0, v.rate ?? 7.2) / 100 / 12;
      const n = Math.max(1, Math.round(v.months ?? 60));
      const pmt = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
      const totalPaid = pmt * n;
      const totalInterest = totalPaid - P;

      const schedule: ScheduleRow[] = [];
      let bal = P;
      for (let m = 1; m <= n; m++) {
        const interestM = bal * r;
        const principalM = Math.min(bal, pmt - interestM);
        bal = Math.max(0, bal - principalM);
        if (m <= 12 || m % 6 === 0 || m === n) {
          schedule.push({
            period: `Month ${m}`,
            payment: fmtMoney(pmt, cur),
            principal: fmtMoney(principalM, cur),
            interest: fmtMoney(interestM, cur),
            balance: fmtMoney(bal, cur),
          });
        }
      }

      return {
        primary: fmtMoney(pmt, cur),
        primaryLabel: 'Monthly Payment',
        details: [
          { label: 'Total Repaid', val: fmtMoney(totalPaid, cur) },
          { label: 'Total Interest', val: fmtMoney(totalInterest, cur) },
          { label: 'Interest / Principal Ratio', val: `${P > 0 ? ((totalInterest / P) * 100).toFixed(1) : '0.0'}%` },
        ],
        breakdown: [
          { label: 'Principal', value: P, color: '#4f46e5' },
          { label: 'Total Interest', value: Math.max(0, totalInterest), color: '#f59e0b' },
        ],
        schedule,
      };
    },
  },
  {
    id: 'compound',
    name: 'Compound Interest & Wealth Growth',
    category: 'Finance',
    desc: 'Project long-term investment value with initial capital, monthly contributions, and compounding frequency.',
    formulaExplanation: 'A = P(1 + r/n)^(nt) + PMT · [((1 + r/n)^(nt) - 1) / (r/n)]',
    methodology:
      'Simulates monthly compounding with end-of-month recurring contributions, separating total principal deposited from compounded investment earnings.',
    faqs: [
      {
        q: 'Why does compounding accelerate in later years?',
        a: 'Returns earned in earlier years remain invested and generate returns of their own, creating exponential rather than linear portfolio growth.',
      },
      {
        q: 'How much do monthly contributions matter compared to starting capital?',
        a: 'Over 15–30 year horizons, consistent monthly contributions often contribute more to ending wealth than the initial lump sum.',
      },
    ],
    inputs: [
      { id: 'initial', label: 'Starting Principal', val: 10000, min: 0, max: 1000000, step: 500, unit: '$' },
      { id: 'monthly', label: 'Monthly Contribution', val: 500, min: 0, max: 25000, step: 50, unit: '$/mo' },
      { id: 'rate', label: 'Annual Return', val: 8, min: 0, max: 25, step: 0.2, unit: '%' },
      { id: 'years', label: 'Investment Horizon', val: 20, min: 1, max: 50, step: 1, unit: 'yr' },
    ],
    calc: (v, cur) => {
      const P = Math.max(0, v.initial ?? 10000);
      const PMT = Math.max(0, v.monthly ?? 500);
      const r = Math.max(0, v.rate ?? 8) / 100 / 12;
      const years = Math.max(1, Math.round(v.years ?? 20));
      let bal = P;
      const schedule: ScheduleRow[] = [];

      for (let yr = 1; yr <= years; yr++) {
        let yrContrib = 0;
        let yrGrowth = 0;
        for (let m = 0; m < 12; m++) {
          const interest = bal * r;
          bal += interest + PMT;
          yrGrowth += interest;
          yrContrib += PMT;
        }
        schedule.push({
          period: `Year ${yr}`,
          principal: fmtMoney(yrContrib, cur, 0),
          interest: fmtMoney(yrGrowth, cur, 0),
          balance: fmtMoney(bal, cur, 0),
        });
      }

      const totalContributed = P + PMT * years * 12;
      const totalGain = bal - totalContributed;
      return {
        primary: fmtMoney(bal, cur, 0),
        primaryLabel: `Future Value (Year ${years})`,
        details: [
          { label: 'Total Principal Contributed', val: fmtMoney(totalContributed, cur, 0) },
          { label: 'Compounded Interest Earned', val: fmtMoney(totalGain, cur, 0) },
          { label: 'Growth Multiple', val: `${totalContributed > 0 ? (bal / totalContributed).toFixed(2) : '0.00'}×` },
        ],
        breakdown: [
          { label: 'Total Contributions', value: totalContributed, color: '#4f46e5' },
          { label: 'Investment Gains', value: Math.max(0, totalGain), color: '#10b981' },
        ],
        schedule,
      };
    },
  },
  {
    id: 'roi',
    name: 'Return on Investment (ROI & CAGR)',
    category: 'Finance',
    desc: 'Measure absolute percentage return, net profit, and annualized compound growth rate (CAGR).',
    formulaExplanation: 'ROI = (Final - Cost) / Cost  |  CAGR = (Final / Cost)^(1/t) - 1',
    methodology:
      'Separates raw return on investment from annualized CAGR so multi-year holdings can be fairly compared against annual benchmarks.',
    faqs: [
      {
        q: 'What is the difference between ROI and CAGR?',
        a: 'ROI measures total cumulative percentage gain regardless of time, whereas CAGR normalizes that gain into an equivalent annual rate.',
      },
      {
        q: 'Can ROI be negative?',
        a: 'Yes. If final value is below initial cost, both ROI and CAGR are negative, representing capital loss.',
      },
    ],
    inputs: [
      { id: 'cost', label: 'Initial Investment', val: 15000, min: 1, max: 5000000, step: 500, unit: '$' },
      { id: 'finalVal', label: 'Final Value', val: 28500, min: 0, max: 10000000, step: 500, unit: '$' },
      { id: 'years', label: 'Holding Period (Years)', val: 4, min: 0.25, max: 50, step: 0.25, unit: 'yr' },
    ],
    calc: (v, cur) => {
      const cost = Math.max(1, v.cost ?? 15000);
      const finalVal = Math.max(0, v.finalVal ?? 28500);
      const t = Math.max(0.1, v.years ?? 4);
      const profit = finalVal - cost;
      const roiPct = (profit / cost) * 100;
      const cagr = finalVal > 0 ? (Math.pow(finalVal / cost, 1 / t) - 1) * 100 : -100;
      return {
        primary: `${roiPct >= 0 ? '+' : ''}${roiPct.toFixed(2)}%`,
        primaryLabel: 'Total ROI',
        details: [
          { label: 'Net Profit / Loss', val: fmtMoney(profit, cur) },
          { label: 'Annualized CAGR', val: `${cagr >= 0 ? '+' : ''}${cagr.toFixed(2)}% / yr` },
          { label: 'Return Multiple', val: `${(finalVal / cost).toFixed(2)}×` },
        ],
      };
    },
  },
  {
    id: 'creditcard',
    name: 'Credit Card Payoff Planner',
    category: 'Finance',
    desc: 'Find exact months to debt freedom and total interest paid under a fixed monthly payment.',
    formulaExplanation: 'B_{k+1} = B_k · (1 + APR/12) - Payment',
    methodology:
      'Iterates month-by-month balance amortization up to 600 months and detects when a payment is too small to cover monthly interest charges.',
    faqs: [
      {
        q: 'What happens if my payment is below monthly interest?',
        a: 'Your balance grows every month instead of shrinking (negative amortization), so the debt can never be paid off without raising the payment.',
      },
      {
        q: 'How can I pay off high-APR cards faster?',
        a: 'Adding even $50–$100 above the minimum payment directly attacks principal and sharply reduces compounding interest.',
      },
    ],
    inputs: [
      { id: 'balance', label: 'Card Balance', val: 6500, min: 100, max: 200000, step: 100, unit: '$' },
      { id: 'apr', label: 'Card APR', val: 21.9, min: 0, max: 40, step: 0.1, unit: '%' },
      { id: 'payment', label: 'Monthly Payment', val: 250, min: 10, max: 10000, step: 10, unit: '$/mo' },
    ],
    calc: (v, cur) => {
      let bal = Math.max(0, v.balance ?? 6500);
      const initialBal = bal;
      const r = Math.max(0, v.apr ?? 21.9) / 100 / 12;
      const pmt = Math.max(1, v.payment ?? 250);
      const firstMonthInterest = bal * r;

      if (pmt <= firstMonthInterest && bal > 0) {
        return {
          primary: 'Never (Payment Too Low)',
          primaryLabel: 'Payoff Timeline',
          details: [
            { label: 'Minimum Payment to Cover Interest', val: fmtMoney(firstMonthInterest + 1, cur) },
            { label: 'First Month Interest', val: fmtMoney(firstMonthInterest, cur) },
            { label: 'Status', val: 'Balance grows each month at current payment' },
          ],
        };
      }

      let months = 0;
      let totalInterest = 0;
      const schedule: ScheduleRow[] = [];

      while (bal > 0.01 && months < 600) {
        months++;
        const interestM = bal * r;
        const actualPmt = Math.min(bal + interestM, pmt);
        const principalM = actualPmt - interestM;
        totalInterest += interestM;
        bal = Math.max(0, bal - principalM);
        if (months <= 12 || months % 6 === 0 || bal === 0) {
          schedule.push({
            period: `Month ${months}`,
            payment: fmtMoney(actualPmt, cur),
            principal: fmtMoney(principalM, cur),
            interest: fmtMoney(interestM, cur),
            balance: fmtMoney(bal, cur),
          });
        }
      }

      const exceededCap = months >= 600 && bal > 0.01;
      return {
        primary: exceededCap ? '600+ Months (50+ yrs)' : `${months} Months`,
        primaryLabel: 'Time to Debt Freedom',
        details: [
          { label: 'Years to Payoff', val: exceededCap ? '50+ years' : `${(months / 12).toFixed(1)} years` },
          { label: 'Total Interest Paid', val: fmtMoney(totalInterest, cur) },
          { label: 'Total Amount Paid', val: fmtMoney(initialBal + totalInterest, cur) },
        ],
        schedule,
      };
    },
  },
  {
    id: 'retirement',
    name: 'Retirement Savings & 4% Rule',
    category: 'Finance',
    desc: 'Estimate your retirement nest egg at target age and sustainable annual withdrawal via the 4% safe withdrawal rate.',
    formulaExplanation: 'Safe Annual Income = Nest Egg × 0.04',
    methodology:
      'Compounds monthly retirement contributions until target retirement age, then applies the Trinity Study 4% safe withdrawal guideline.',
    faqs: [
      {
        q: 'What is the 4% safe withdrawal rule?',
        a: 'Based on historical market simulations, withdrawing 4% of your initial portfolio annually (adjusted for inflation) has historically lasted 30+ years.',
      },
      {
        q: 'Does this include Social Security or pensions?',
        a: 'No—this models personal invested portfolio assets only, so guaranteed benefits add further cushion.',
      },
    ],
    inputs: [
      { id: 'currentAge', label: 'Current Age', val: 30, min: 18, max: 75, step: 1, unit: 'yr' },
      { id: 'retireAge', label: 'Target Retirement Age', val: 65, min: 30, max: 85, step: 1, unit: 'yr' },
      { id: 'saved', label: 'Current Savings', val: 45000, min: 0, max: 5000000, step: 1000, unit: '$' },
      { id: 'monthly', label: 'Monthly Contribution', val: 1000, min: 0, max: 25000, step: 50, unit: '$/mo' },
      { id: 'rate', label: 'Expected Return', val: 7.5, min: 1, max: 15, step: 0.25, unit: '%' },
    ],
    calc: (v, cur) => {
      const years = Math.max(1, (v.retireAge ?? 65) - (v.currentAge ?? 30));
      let bal = Math.max(0, v.saved ?? 45000);
      const pmt = Math.max(0, v.monthly ?? 1000);
      const r = Math.max(0, v.rate ?? 7.5) / 100 / 12;
      for (let m = 0; m < years * 12; m++) {
        bal = bal * (1 + r) + pmt;
      }
      const annualIncome = bal * 0.04;
      const monthlyIncome = annualIncome / 12;
      return {
        primary: fmtMoney(bal, cur, 0),
        primaryLabel: `Projected Nest Egg (Age ${Math.round(v.retireAge ?? 65)})`,
        details: [
          { label: 'Sustainable Monthly Income (4%)', val: fmtMoney(monthlyIncome, cur, 0) },
          { label: 'Sustainable Annual Income (4%)', val: fmtMoney(annualIncome, cur, 0) },
          { label: 'Years to Compound', val: `${years} years` },
        ],
      };
    },
  },
  {
    id: 'inflation',
    name: 'Inflation & Purchasing Power',
    category: 'Finance',
    desc: 'Project how annual inflation erodes real purchasing power or raises future nominal prices.',
    formulaExplanation: 'Real Value = Nominal / (1 + i)^t',
    methodology:
      'Applies geometric annual CPI discounting over t years to quantify both the nominal equivalent needed to maintain lifestyle and real purchasing power loss.',
    faqs: [
      {
        q: 'Why does 3% inflation matter over 20 years?',
        a: 'At 3% annual inflation, prices roughly double every 24 years—cutting uninvested cash purchasing power nearly in half.',
      },
      {
        q: 'How do I beat inflation?',
        a: 'Assets whose nominal return exceeds the inflation rate preserve and expand real purchasing power.',
      },
    ],
    inputs: [
      { id: 'amount', label: 'Current Amount', val: 10000, min: 1, max: 10000000, step: 100, unit: '$' },
      { id: 'inflation', label: 'Annual Inflation Rate', val: 3.2, min: 0, max: 25, step: 0.1, unit: '%' },
      { id: 'years', label: 'Years Ahead', val: 15, min: 1, max: 60, step: 1, unit: 'yr' },
    ],
    calc: (v, cur) => {
      const amt = Math.max(0, v.amount ?? 10000);
      const i = Math.max(0, v.inflation ?? 3.2) / 100;
      const t = Math.max(1, v.years ?? 15);
      const futureCost = amt * Math.pow(1 + i, t);
      const realValue = amt / Math.pow(1 + i, t);
      const powerLostPct = ((amt - realValue) / (amt || 1)) * 100;
      return {
        primary: fmtMoney(realValue, cur),
        primaryLabel: `Purchasing Power in ${t} Years`,
        details: [
          { label: 'Equivalent Future Cost', val: fmtMoney(futureCost, cur) },
          { label: 'Purchasing Power Lost', val: `${powerLostPct.toFixed(1)}%` },
          { label: 'Cumulative Inflation', val: `${((Math.pow(1 + i, t) - 1) * 100).toFixed(1)}%` },
        ],
      };
    },
  },
  {
    id: 'salary',
    name: 'Salary to Hourly & Tax Estimator',
    category: 'Finance',
    desc: 'Convert annual gross salary into hourly, weekly, and monthly rates with estimated after-tax take-home pay.',
    formulaExplanation: 'Hourly = Annual / (Hours/Week × 52)',
    methodology:
      'Divides annual compensation across standard 52-week schedules and subtracts an effective combined tax percentage to show net take-home pay.',
    faqs: [
      {
        q: 'How many working hours are in a standard year?',
        a: 'A full-time 40-hour schedule over 52 weeks equals 2,080 paid hours per year.',
      },
      {
        q: 'Is effective tax rate the same as marginal tax bracket?',
        a: 'No. Your effective rate is total tax divided by total income, which is lower than your top marginal bracket under progressive taxation.',
      },
    ],
    inputs: [
      { id: 'annual', label: 'Annual Gross Salary', val: 95000, min: 1000, max: 2000000, step: 1000, unit: '$' },
      { id: 'hoursWeek', label: 'Hours per Week', val: 40, min: 5, max: 80, step: 1, unit: 'hr' },
      { id: 'taxPct', label: 'Effective Tax Rate', val: 22, min: 0, max: 60, step: 0.5, unit: '%' },
    ],
    calc: (v, cur) => {
      const annual = Math.max(0, v.annual ?? 95000);
      const hrs = Math.max(1, v.hoursWeek ?? 40) * 52;
      const taxPct = Math.min(90, Math.max(0, v.taxPct ?? 22)) / 100;
      const netAnnual = annual * (1 - taxPct);
      const hourlyGross = annual / hrs;
      const hourlyNet = netAnnual / hrs;
      return {
        primary: fmtMoney(netAnnual / 12, cur),
        primaryLabel: 'Estimated Monthly Net Pay',
        details: [
          { label: 'Annual Net Take-Home', val: fmtMoney(netAnnual, cur, 0) },
          { label: 'Gross Hourly Rate', val: fmtMoney(hourlyGross, cur) },
          { label: 'Net Hourly Rate', val: fmtMoney(hourlyNet, cur) },
          { label: 'Biweekly Net Paycheck', val: fmtMoney(netAnnual / 26, cur) },
        ],
      };
    },
  },
  {
    id: 'savings',
    name: 'Savings Goal Timeline',
    category: 'Finance',
    desc: 'Calculate exact months required to reach a financial target with interest-bearing monthly deposits.',
    formulaExplanation: 'S_{k+1} = S_k(1 + r/12) + Deposit',
    methodology:
      'Simulates monthly compounding growth from your starting balance until your target goal is reached or surpassed.',
    faqs: [
      {
        q: 'How does APY affect short-term goals?',
        a: 'For goals under 2 years, monthly deposit size drives most of the timeline; for 5+ year goals, APY compounds significantly.',
      },
      {
        q: 'What if I start with zero savings?',
        a: 'Set Starting Balance to 0 to calculate the timeline purely from monthly contributions.',
      },
    ],
    inputs: [
      { id: 'goal', label: 'Target Savings Goal', val: 50000, min: 100, max: 5000000, step: 500, unit: '$' },
      { id: 'start', label: 'Starting Balance', val: 5000, min: 0, max: 1000000, step: 500, unit: '$' },
      { id: 'monthly', label: 'Monthly Deposit', val: 800, min: 10, max: 50000, step: 50, unit: '$/mo' },
      { id: 'apy', label: 'Annual Yield (APY)', val: 4.5, min: 0, max: 15, step: 0.1, unit: '%' },
    ],
    calc: (v, cur) => {
      const goal = Math.max(0, v.goal ?? 50000);
      let bal = Math.max(0, v.start ?? 5000);
      const dep = Math.max(1, v.monthly ?? 800);
      const r = Math.max(0, v.apy ?? 4.5) / 100 / 12;
      let months = 0;
      let interestEarned = 0;
      while (bal < goal && months < 1200) {
        months++;
        const i = bal * r;
        interestEarned += i;
        bal += i + dep;
      }
      return {
        primary: months === 0 ? 'Goal Already Met' : `${months} Months`,
        primaryLabel: 'Time to Reach Goal',
        details: [
          { label: 'Years Required', val: `${(months / 12).toFixed(1)} years` },
          { label: 'Interest Earned', val: fmtMoney(interestEarned, cur) },
          { label: 'Final Balance', val: fmtMoney(bal, cur) },
        ],
      };
    },
  },
  {
    id: 'breakeven',
    name: 'Business Break-Even Analysis',
    category: 'Finance',
    desc: 'Determine exact unit sales and revenue needed to cover fixed overhead and variable production costs.',
    formulaExplanation: 'Break-Even Units = Fixed Costs / (Price - Variable Cost)',
    methodology:
      'Divides total monthly fixed costs by contribution margin per unit (Selling Price minus Variable Cost per Unit).',
    faqs: [
      {
        q: 'What is contribution margin?',
        a: 'Contribution margin is the dollar amount each sold unit contributes toward fixed overhead after covering its direct variable cost.',
      },
      {
        q: 'What if variable cost exceeds selling price?',
        a: 'Every unit sold loses money, meaning fixed costs can never be recovered without raising price or lowering unit costs.',
      },
    ],
    inputs: [
      { id: 'fixed', label: 'Monthly Fixed Costs', val: 12000, min: 0, max: 1000000, step: 500, unit: '$' },
      { id: 'price', label: 'Unit Selling Price', val: 75, min: 1, max: 10000, step: 1, unit: '$' },
      { id: 'variable', label: 'Variable Cost per Unit', val: 30, min: 0, max: 10000, step: 1, unit: '$' },
    ],
    calc: (v, cur) => {
      const fixed = Math.max(0, v.fixed ?? 12000);
      const price = Math.max(0, v.price ?? 75);
      const variable = Math.max(0, v.variable ?? 30);
      const cm = price - variable;
      if (cm <= 0) {
        return {
          primary: 'No Break-Even',
          primaryLabel: 'Contribution Margin <= 0',
          details: [
            { label: 'Unit Contribution Margin', val: fmtMoney(cm, cur) },
            { label: 'Action Needed', val: 'Price must exceed variable cost per unit' },
          ],
        };
      }
      const units = Math.ceil(fixed / cm);
      const rev = units * price;
      return {
        primary: `${fmtNum(units, 0)} Units`,
        primaryLabel: 'Break-Even Sales Volume',
        details: [
          { label: 'Break-Even Revenue', val: fmtMoney(rev, cur, 0) },
          { label: 'Contribution Margin / Unit', val: fmtMoney(cm, cur) },
          { label: 'Contribution Margin Ratio', val: `${((cm / price) * 100).toFixed(1)}%` },
        ],
      };
    },
  },
  {
    id: 'margin',
    name: 'Profit Margin & Markup',
    category: 'Finance',
    desc: 'Convert between wholesale cost, selling price, gross margin percentage, and markup percentage.',
    formulaExplanation: 'Margin = (Price - Cost) / Price  |  Markup = (Price - Cost) / Cost',
    methodology:
      'Computes gross profit from cost and revenue, clearly distinguishing gross margin (share of selling price) from markup (percentage added onto cost).',
    faqs: [
      {
        q: 'Why is a 50% markup not a 50% margin?',
        a: 'A $100 item marked up 50% sells for $150; the $50 profit divided by the $150 selling price equals a 33.3% gross margin.',
      },
      {
        q: 'Can gross margin exceed 100%?',
        a: 'No, provided cost is positive. Profit can never exceed total selling price.',
      },
    ],
    inputs: [
      { id: 'cost', label: 'Unit Cost', val: 60, min: 0.01, max: 100000, step: 1, unit: '$' },
      { id: 'price', label: 'Selling Price', val: 100, min: 0.01, max: 200000, step: 1, unit: '$' },
    ],
    calc: (v, cur) => {
      const cost = Math.max(0.01, v.cost ?? 60);
      const price = Math.max(0.01, v.price ?? 100);
      const profit = price - cost;
      const margin = (profit / price) * 100;
      const markup = (profit / cost) * 100;
      return {
        primary: `${margin.toFixed(2)}%`,
        primaryLabel: 'Gross Profit Margin',
        details: [
          { label: 'Gross Profit per Unit', val: fmtMoney(profit, cur) },
          { label: 'Markup Percentage', val: `${markup.toFixed(2)}%` },
          { label: 'Cost-to-Price Ratio', val: `${((cost / price) * 100).toFixed(1)}%` },
        ],
      };
    },
  },
  {
    id: 'tip',
    name: 'Tip & Bill Split Calculator',
    category: 'Finance',
    desc: 'Split restaurant or service bills accurately with custom tip percentages and per-person totals.',
    formulaExplanation: 'Per Person = [Bill × (1 + Tip%)] / People',
    methodology:
      'Calculates gratuity on the pre-split subtotal and divides total payable evenly across all guests.',
    faqs: [
      {
        q: 'Should tip be calculated before or after tax?',
        a: 'Etiquette typically applies tip to the pre-tax subtotal, though entering the post-tax bill works identically if preferred.',
      },
      {
        q: 'Does this round per-person shares?',
        a: 'Values are shown to the nearest cent so the group total sums cleanly.',
      },
    ],
    inputs: [
      { id: 'bill', label: 'Bill Amount', val: 120, min: 1, max: 50000, step: 1, unit: '$' },
      { id: 'tipPct', label: 'Tip Percentage', val: 18, min: 0, max: 50, step: 1, unit: '%' },
      { id: 'people', label: 'Number of People', val: 4, min: 1, max: 50, step: 1, unit: 'ppl' },
    ],
    calc: (v, cur) => {
      const bill = Math.max(0, v.bill ?? 120);
      const tip = bill * (Math.max(0, v.tipPct ?? 18) / 100);
      const total = bill + tip;
      const ppl = Math.max(1, Math.round(v.people ?? 4));
      return {
        primary: fmtMoney(total / ppl, cur),
        primaryLabel: 'Total per Person',
        details: [
          { label: 'Total Tip', val: fmtMoney(tip, cur) },
          { label: 'Tip per Person', val: fmtMoney(tip / ppl, cur) },
          { label: 'Grand Total', val: fmtMoney(total, cur) },
        ],
      };
    },
  },
  {
    id: 'discount',
    name: 'Sale Discount & Tax Savings',
    category: 'Finance',
    desc: 'Calculate final checkout price after percentage discounts and local sales tax.',
    formulaExplanation: 'Final = Price × (1 - Discount%) × (1 + Tax%)',
    methodology:
      'Applies markdown discount first to establish the taxable sale price, then adds sales tax to compute final out-the-door cost.',
    faqs: [
      {
        q: 'Is sales tax applied before or after a store discount?',
        a: 'In nearly all jurisdictions, sales tax applies to the discounted transaction price rather than the original sticker price.',
      },
      {
        q: 'How do stacked discounts work?',
        a: 'Two 20% discounts equal 1 - (0.8 × 0.8) = 36% total discount, not 40%.',
      },
    ],
    inputs: [
      { id: 'price', label: 'Original Price', val: 249, min: 0, max: 100000, step: 1, unit: '$' },
      { id: 'discount', label: 'Discount (%)', val: 25, min: 0, max: 95, step: 1, unit: '%' },
      { id: 'tax', label: 'Sales Tax (%)', val: 8.25, min: 0, max: 30, step: 0.25, unit: '%' },
    ],
    calc: (v, cur) => {
      const price = Math.max(0, v.price ?? 249);
      const disc = price * (Math.min(100, Math.max(0, v.discount ?? 25)) / 100);
      const salePrice = price - disc;
      const taxAmt = salePrice * (Math.max(0, v.tax ?? 8.25) / 100);
      const finalPrice = salePrice + taxAmt;
      return {
        primary: fmtMoney(finalPrice, cur),
        primaryLabel: 'Final Checkout Price',
        details: [
          { label: 'Discount Savings', val: fmtMoney(disc, cur) },
          { label: 'Pre-Tax Sale Price', val: fmtMoney(salePrice, cur) },
          { label: 'Sales Tax', val: fmtMoney(taxAmt, cur) },
        ],
      };
    },
  },
  {
    id: 'apr',
    name: 'Effective Annual Rate (APY / EAR)',
    category: 'Finance',
    desc: 'Convert nominal APR into true Annual Percentage Yield across daily, monthly, or quarterly compounding.',
    formulaExplanation: 'APY = (1 + APR / n)^n - 1',
    methodology:
      'Evaluates discrete compounding across n periods per year (1=Annual, 4=Quarterly, 12=Monthly, 365=Daily) to reveal true effective annual return.',
    faqs: [
      {
        q: 'Why is APY higher than APR?',
        a: 'Because interest earned mid-year earns additional interest during remaining compounding periods of the same year.',
      },
      {
        q: 'How much difference does daily vs monthly compounding make?',
        a: 'At 5% APR, monthly compounding yields 5.116% APY while daily compounding yields 5.127% APY.',
      },
    ],
    inputs: [
      { id: 'apr', label: 'Nominal Rate (APR)', val: 5.25, min: 0, max: 50, step: 0.05, unit: '%' },
      {
        id: 'freq',
        label: 'Compounding Frequency',
        val: 12,
        min: 1,
        max: 365,
        step: 1,
        options: [
          { label: 'Annual (1×)', value: 1 },
          { label: 'Quarterly (4×)', value: 4 },
          { label: 'Monthly (12×)', value: 12 },
          { label: 'Daily (365×)', value: 365 },
        ],
      },
    ],
    calc: (v) => {
      const apr = Math.max(0, v.apr ?? 5.25) / 100;
      const n = Math.max(1, v.freq ?? 12);
      const apy = (Math.pow(1 + apr / n, n) - 1) * 100;
      const continuous = (Math.exp(apr) - 1) * 100;
      return {
        primary: `${apy.toFixed(3)}%`,
        primaryLabel: 'Effective Annual Yield (APY)',
        details: [
          { label: 'Nominal APR', val: `${(apr * 100).toFixed(3)}%` },
          { label: 'Compounding Lift', val: `+${(apy - apr * 100).toFixed(3)}%` },
          { label: 'Continuous Limit (e^r - 1)', val: `${continuous.toFixed(3)}%` },
        ],
      };
    },
  },
  {
    id: 'rule72',
    name: 'Rule of 72 Doubling Time',
    category: 'Finance',
    desc: 'Compare the classic Rule of 72 mental estimate against exact logarithmic doubling time.',
    formulaExplanation: 'Exact Years = ln(2) / ln(1 + r)',
    methodology:
      'Computes both the quick 72/rate approximation and the exact continuous-compound logarithmic solution for capital doubling and quadrupling.',
    faqs: [
      {
        q: 'When is the Rule of 72 most accurate?',
        a: 'It is accurate within 0.1–0.3 years for annual return rates between 5% and 12%.',
      },
      {
        q: 'Can Rule of 72 also measure inflation?',
        a: 'Yes—dividing 72 by an annual inflation rate estimates how many years it takes for prices to double.',
      },
    ],
    inputs: [{ id: 'rate', label: 'Annual Return / Growth Rate', val: 8, min: 0.5, max: 50, step: 0.25, unit: '%' }],
    calc: (v) => {
      const rPct = Math.max(0.1, v.rate ?? 8);
      const r = rPct / 100;
      const approx = 72 / rPct;
      const exact = Math.log(2) / Math.log(1 + r);
      return {
        primary: `${exact.toFixed(2)} Years`,
        primaryLabel: 'Exact Doubling Time',
        details: [
          { label: 'Rule of 72 Estimate', val: `${approx.toFixed(2)} years` },
          { label: 'Time to 4× Capital', val: `${(exact * 2).toFixed(2)} years` },
          { label: 'Time to 10× Capital', val: `${(Math.log(10) / Math.log(1 + r)).toFixed(2)} years` },
        ],
      };
    },
  },
  {
    id: 'carlease',
    name: 'Auto Lease Monthly Cost',
    category: 'Finance',
    desc: 'Calculate vehicle lease depreciation, money-factor finance charge, and monthly payment.',
    formulaExplanation: 'Payment = (CapCost - Residual)/n + (CapCost + Residual) × MoneyFactor',
    methodology:
      'Implements standard automotive lease pricing using Residual Value (% of MSRP), Capitalized Cost, and Money Factor (APR ÷ 2400).',
    faqs: [
      {
        q: 'How do I convert APR to Money Factor?',
        a: 'Divide the equivalent lease APR by 2,400 (for example, 6.0% APR equals a 0.00250 money factor).',
      },
      {
        q: 'What lowers a lease payment the most?',
        a: 'Negotiating a lower capitalized price and choosing models with high 36-month residual percentages.',
      },
    ],
    inputs: [
      { id: 'msrp', label: 'Vehicle MSRP', val: 42000, min: 10000, max: 250000, step: 500, unit: '$' },
      { id: 'capCost', label: 'Negotiated Price', val: 39500, min: 5000, max: 250000, step: 500, unit: '$' },
      { id: 'residualPct', label: 'Residual Value (%)', val: 58, min: 20, max: 85, step: 1, unit: '%' },
      { id: 'apr', label: 'Lease APR', val: 5.5, min: 0, max: 20, step: 0.25, unit: '%' },
      { id: 'months', label: 'Lease Term (Months)', val: 36, min: 12, max: 60, step: 6, unit: 'mo' },
    ],
    calc: (v, cur) => {
      const msrp = Math.max(0, v.msrp ?? 42000);
      const cap = Math.max(0, v.capCost ?? 39500);
      const residual = msrp * (Math.min(95, Math.max(10, v.residualPct ?? 58)) / 100);
      const mf = Math.max(0, v.apr ?? 5.5) / 2400;
      const n = Math.max(1, Math.round(v.months ?? 36));
      const depFee = (cap - residual) / n;
      const finFee = (cap + residual) * mf;
      const monthly = depFee + finFee;
      return {
        primary: fmtMoney(monthly, cur),
        primaryLabel: 'Monthly Pre-Tax Lease',
        details: [
          { label: 'Monthly Depreciation', val: fmtMoney(depFee, cur) },
          { label: 'Monthly Finance Charge', val: fmtMoney(finFee, cur) },
          { label: 'Residual Buyout Value', val: fmtMoney(residual, cur, 0) },
          { label: 'Money Factor', val: mf.toFixed(5) },
        ],
      };
    },
  },
  {
    id: 'caprate',
    name: 'Real Estate Cap Rate & NOI',
    category: 'Finance',
    desc: 'Evaluate investment property Net Operating Income (NOI), Capitalization Rate, and cash-on-cash yield.',
    formulaExplanation: 'Cap Rate = NOI / Property Value',
    methodology:
      'Subtracts annual operating expenses from gross rental income to establish NOI, then divides by purchase price independent of financing.',
    faqs: [
      {
        q: 'What is a good real estate cap rate?',
        a: 'Core urban assets often trade at 4%–6% cap rates, while value-add or secondary-market properties typically target 6.5%–9%.',
      },
      {
        q: 'Does NOI include mortgage payments?',
        a: 'No. Cap rate measures unlevered property performance prior to debt service.',
      },
    ],
    inputs: [
      { id: 'price', label: 'Property Price', val: 350000, min: 25000, max: 10000000, step: 5000, unit: '$' },
      { id: 'monthlyRent', label: 'Monthly Gross Rent', val: 2800, min: 200, max: 100000, step: 50, unit: '$/mo' },
      { id: 'expensesYr', label: 'Annual Operating Expenses', val: 9600, min: 0, max: 500000, step: 200, unit: '$/yr' },
    ],
    calc: (v, cur) => {
      const price = Math.max(1, v.price ?? 350000);
      const grossYr = Math.max(0, v.monthlyRent ?? 2800) * 12;
      const exp = Math.max(0, v.expensesYr ?? 9600);
      const noi = grossYr - exp;
      const capRate = (noi / price) * 100;
      const grm = grossYr > 0 ? price / grossYr : 0;
      return {
        primary: `${capRate.toFixed(2)}%`,
        primaryLabel: 'Capitalization Rate',
        details: [
          { label: 'Net Operating Income (NOI)', val: fmtMoney(noi, cur, 0) },
          { label: 'Annual Gross Rent', val: fmtMoney(grossYr, cur, 0) },
          { label: 'Gross Rent Multiplier (GRM)', val: `${grm.toFixed(1)}×` },
        ],
      };
    },
  },
  {
    id: 'dti',
    name: 'Debt-to-Income (DTI) Ratio',
    category: 'Finance',
    desc: 'Check mortgage and lender qualification thresholds with front-end and back-end DTI percentages.',
    formulaExplanation: 'Back-End DTI = (Housing + Monthly Debts) / Gross Monthly Income',
    methodology:
      'Compares housing obligations (front-end) and total recurring debt obligations (back-end) against gross monthly household income.',
    faqs: [
      {
        q: 'What DTI do mortgage lenders prefer?',
        a: 'Conventional underwriters commonly look for front-end DTI ≤ 28% and total back-end DTI ≤ 36%–43%.',
      },
      {
        q: 'Which debts count toward DTI?',
        a: 'Housing costs, auto loans, student loans, minimum credit card payments, and personal loans—not groceries or utilities.',
      },
    ],
    inputs: [
      { id: 'income', label: 'Gross Monthly Income', val: 8500, min: 500, max: 200000, step: 100, unit: '$/mo' },
      { id: 'housing', label: 'Monthly Housing Cost', val: 2100, min: 0, max: 50000, step: 50, unit: '$/mo' },
      { id: 'otherDebt', label: 'Other Monthly Debts', val: 650, min: 0, max: 50000, step: 50, unit: '$/mo' },
    ],
    calc: (v) => {
      const inc = Math.max(1, v.income ?? 8500);
      const housing = Math.max(0, v.housing ?? 2100);
      const other = Math.max(0, v.otherDebt ?? 650);
      const front = (housing / inc) * 100;
      const back = ((housing + other) / inc) * 100;
      const tier = back <= 36 ? 'Strong (<=36%)' : back <= 43 ? 'Qualified Limit (<=43%)' : 'Elevated (>43%)';
      return {
        primary: `${back.toFixed(1)}%`,
        primaryLabel: 'Total Back-End DTI',
        details: [
          { label: 'Front-End (Housing) DTI', val: `${front.toFixed(1)}%` },
          { label: 'Underwriting Tier', val: tier },
          { label: 'Remaining Gross Income', val: `${(100 - back).toFixed(1)}%` },
        ],
      };
    },
  },

  // ===================== FITNESS (10) =====================
  {
    id: 'bmi',
    name: 'Body Mass Index (BMI) & Prime',
    category: 'Fitness',
    desc: 'Compute BMI, BMI Prime ratio, and healthy target weight range for your height.',
    formulaExplanation: 'BMI = Weight(kg) / Height(m)²',
    methodology:
      'Applies WHO adult BMI classifications alongside BMI Prime (BMI ÷ 25), displaying the corresponding healthy 18.5–24.9 weight range.',
    faqs: [
      {
        q: 'What are the limitations of BMI?',
        a: 'BMI does not distinguish muscle mass from adipose tissue, so athletic individuals with high lean mass may score higher despite low body fat.',
      },
      {
        q: 'What is BMI Prime?',
        a: 'BMI Prime divides your BMI by 25.0 (the upper healthy boundary); values between 0.74 and 1.00 represent the standard healthy range.',
      },
    ],
    inputs: [
      { id: 'weight', label: 'Weight (kg)', val: 74, min: 25, max: 250, step: 0.5, unit: 'kg' },
      { id: 'height', label: 'Height (cm)', val: 175, min: 100, max: 230, step: 1, unit: 'cm' },
    ],
    calc: (v) => {
      const w = Math.max(1, v.weight ?? 74);
      const h = Math.max(0.5, (v.height ?? 175) / 100);
      const bmi = w / (h * h);
      const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy Weight' : bmi < 30 ? 'Overweight' : 'Obese';
      const minW = 18.5 * h * h;
      const maxW = 24.9 * h * h;
      return {
        primary: bmi.toFixed(1),
        primaryLabel: `BMI (${cat})`,
        details: [
          { label: 'BMI Prime Ratio', val: (bmi / 25).toFixed(2) },
          { label: 'Healthy Weight Range', val: `${minW.toFixed(1)} – ${maxW.toFixed(1)} kg` },
          { label: 'Ponderal Index', val: `${(w / Math.pow(h, 3)).toFixed(1)} kg/m³` },
        ],
      };
    },
  },
  {
    id: 'bmr',
    name: 'Basal Metabolic Rate (Mifflin-St Jeor)',
    category: 'Fitness',
    desc: 'Estimate daily resting caloric burn required to sustain vital physiological functions.',
    formulaExplanation: 'BMR = 10·W + 6.25·H - 5·A + (+5 Male / -161 Female)',
    methodology:
      'Implements the validated Mifflin-St Jeor clinical equation using body weight in kilograms, stature in centimeters, and age.',
    faqs: [
      {
        q: 'Should I eat below my BMR to lose weight?',
        a: 'Generally no—caloric targets are set below Total Daily Energy Expenditure (TDEE), not below resting BMR, to protect lean tissue.',
      },
      {
        q: 'How accurate is Mifflin-St Jeor?',
        a: 'Clinical studies show it predicts resting metabolic rate within ±10% for most non-athlete adults.',
      },
    ],
    inputs: [
      {
        id: 'sex',
        label: 'Biological Sex',
        val: 1,
        min: 0,
        max: 1,
        step: 1,
        options: [
          { label: 'Male', value: 1 },
          { label: 'Female', value: 0 },
        ],
      },
      { id: 'weight', label: 'Weight (kg)', val: 75, min: 30, max: 250, step: 0.5, unit: 'kg' },
      { id: 'height', label: 'Height (cm)', val: 176, min: 110, max: 230, step: 1, unit: 'cm' },
      { id: 'age', label: 'Age', val: 30, min: 14, max: 100, step: 1, unit: 'yr' },
    ],
    calc: (v) => {
      const s = (v.sex ?? 1) === 1 ? 5 : -161;
      const bmr = 10 * (v.weight ?? 75) + 6.25 * (v.height ?? 176) - 5 * (v.age ?? 30) + s;
      return {
        primary: `${Math.round(bmr)} kcal`,
        primaryLabel: 'Resting Basal Burn / Day',
        details: [
          { label: 'Hourly Resting Burn', val: `${(bmr / 24).toFixed(1)} kcal/hr` },
          { label: 'Weekly Resting Burn', val: `${fmtNum(Math.round(bmr * 7), 0)} kcal` },
        ],
      };
    },
  },
  {
    id: 'tdee',
    name: 'Total Daily Energy Expenditure (TDEE)',
    category: 'Fitness',
    desc: 'Calculate daily maintenance calories plus sustainable fat-loss and lean-gain targets.',
    formulaExplanation: 'TDEE = BMR × Activity Multiplier',
    methodology:
      'Combines Mifflin-St Jeor BMR with standard PAL (Physical Activity Level) multipliers from 1.2 (sedentary) to 1.9 (athlete).',
    faqs: [
      {
        q: 'How big of a deficit equals 0.5 kg fat loss per week?',
        a: 'Approximately 500 kcal below maintenance TDEE per day (~3,500 kcal per week).',
      },
      {
        q: 'Which activity level should I choose?',
        a: 'Most office workers who lift or run 3–4× per week match Moderately Active (1.55).',
      },
    ],
    inputs: [
      {
        id: 'sex',
        label: 'Biological Sex',
        val: 1,
        min: 0,
        max: 1,
        step: 1,
        options: [
          { label: 'Male', value: 1 },
          { label: 'Female', value: 0 },
        ],
      },
      { id: 'weight', label: 'Weight (kg)', val: 76, min: 30, max: 250, step: 0.5, unit: 'kg' },
      { id: 'height', label: 'Height (cm)', val: 178, min: 110, max: 230, step: 1, unit: 'cm' },
      { id: 'age', label: 'Age', val: 29, min: 14, max: 100, step: 1, unit: 'yr' },
      {
        id: 'activity',
        label: 'Activity Level',
        val: 1.55,
        min: 1.2,
        max: 1.9,
        step: 0.05,
        options: [
          { label: 'Sedentary (1.2×)', value: 1.2 },
          { label: 'Light Exercise (1.375×)', value: 1.375 },
          { label: 'Moderate (1.55×)', value: 1.55 },
          { label: 'Very Active (1.725×)', value: 1.725 },
          { label: 'Athlete (1.9×)', value: 1.9 },
        ],
      },
    ],
    calc: (v) => {
      const s = (v.sex ?? 1) === 1 ? 5 : -161;
      const bmr = 10 * (v.weight ?? 76) + 6.25 * (v.height ?? 178) - 5 * (v.age ?? 29) + s;
      const tdee = bmr * (v.activity ?? 1.55);
      return {
        primary: `${Math.round(tdee)} kcal`,
        primaryLabel: 'Daily Maintenance Calories',
        details: [
          { label: 'Basal Metabolic Rate', val: `${Math.round(bmr)} kcal/day` },
          { label: 'Fat Loss (-500 kcal)', val: `${Math.round(tdee - 500)} kcal/day` },
          { label: 'Lean Surplus (+300 kcal)', val: `${Math.round(tdee + 300)} kcal/day` },
        ],
      };
    },
  },
  {
    id: 'macros',
    name: 'Daily Macronutrient Split',
    category: 'Fitness',
    desc: 'Convert daily calorie goals into exact grams of protein, carbohydrates, and dietary fats.',
    formulaExplanation: 'Protein = 4 kcal/g · Carbs = 4 kcal/g · Fat = 9 kcal/g',
    methodology:
      'Divides total daily energy target across customizable macronutrient ratios using Atwater caloric conversion factors.',
    faqs: [
      {
        q: 'Why do fats carry 9 kcal per gram?',
        a: 'Dietary lipids are more energy-dense than proteins and carbohydrates, which yield 4 kcal per gram.',
      },
      {
        q: 'What is a balanced athletic macro split?',
        a: 'A 30% protein / 40% carbohydrate / 30% fat split supports recovery while sustaining glycogen.',
      },
    ],
    inputs: [
      { id: 'calories', label: 'Daily Calorie Target', val: 2400, min: 800, max: 7000, step: 50, unit: 'kcal' },
      { id: 'protPct', label: 'Protein (%)', val: 30, min: 10, max: 60, step: 5, unit: '%' },
      { id: 'fatPct', label: 'Fat (%)', val: 30, min: 10, max: 60, step: 5, unit: '%' },
    ],
    calc: (v) => {
      const cal = Math.max(500, v.calories ?? 2400);
      const pPct = Math.min(80, Math.max(5, v.protPct ?? 30));
      const fPct = Math.min(90 - pPct, Math.max(5, v.fatPct ?? 30));
      const cPct = Math.max(0, 100 - pPct - fPct);
      const pGrams = (cal * (pPct / 100)) / 4;
      const fGrams = (cal * (fPct / 100)) / 9;
      const cGrams = (cal * (cPct / 100)) / 4;
      return {
        primary: `${Math.round(pGrams)}P · ${Math.round(cGrams)}C · ${Math.round(fGrams)}F`,
        primaryLabel: 'Daily Grams (Protein / Carbs / Fat)',
        details: [
          { label: `Protein (${pPct}%)`, val: `${Math.round(pGrams)} g (${Math.round(pGrams * 4)} kcal)` },
          { label: `Carbohydrates (${cPct}%)`, val: `${Math.round(cGrams)} g (${Math.round(cGrams * 4)} kcal)` },
          { label: `Dietary Fat (${fPct}%)`, val: `${Math.round(fGrams)} g (${Math.round(fGrams * 9)} kcal)` },
        ],
      };
    },
  },
  {
    id: 'bodyfat',
    name: 'U.S. Navy Body Fat Estimator',
    category: 'Fitness',
    desc: 'Estimate body fat percentage and lean body mass using circumference tape measurements.',
    formulaExplanation: 'BF% = 495 / (1.0324 - 0.19077·log10(waist - neck) + 0.15456·log10(height)) - 450',
    methodology:
      'Applies the U.S. Department of Defense circumference-based logarithmic density equation in centimeters.',
    faqs: [
      {
        q: 'Where should waist circumference be measured?',
        a: 'Measure horizontally around the abdomen at the level of the navel without pulling the tape tight.',
      },
      {
        q: 'How accurate is the Navy tape method?',
        a: 'Typically within ±3%–4% of DEXA scans when measurements are taken consistently in the morning.',
      },
    ],
    inputs: [
      { id: 'height', label: 'Height (cm)', val: 178, min: 120, max: 230, step: 0.5, unit: 'cm' },
      { id: 'neck', label: 'Neck Circumference (cm)', val: 38, min: 25, max: 60, step: 0.5, unit: 'cm' },
      { id: 'waist', label: 'Waist Circumference (cm)', val: 84, min: 50, max: 160, step: 0.5, unit: 'cm' },
      { id: 'weight', label: 'Body Weight (kg)', val: 78, min: 35, max: 220, step: 0.5, unit: 'kg' },
    ],
    calc: (v) => {
      const h = Math.max(100, v.height ?? 178);
      const neck = Math.max(20, v.neck ?? 38);
      const waist = Math.max(neck + 2, v.waist ?? 84);
      const weight = Math.max(30, v.weight ?? 78);
      const bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
      const clamped = Math.max(2, Math.min(60, bf));
      const fatMass = weight * (clamped / 100);
      return {
        primary: `${clamped.toFixed(1)}%`,
        primaryLabel: 'Estimated Body Fat',
        details: [
          { label: 'Lean Body Mass', val: `${(weight - fatMass).toFixed(1)} kg` },
          { label: 'Fat Mass', val: `${fatMass.toFixed(1)} kg` },
          { label: 'Waist-to-Height Ratio', val: (waist / h).toFixed(2) },
        ],
      };
    },
  },
  {
    id: 'onerm',
    name: 'One-Rep Max (1RM) Strength Estimator',
    category: 'Fitness',
    desc: 'Predict maximum single-rep lift capacity and working-set load percentages from submaximal reps.',
    formulaExplanation: '1RM = Weight × (1 + Reps / 30)  [Epley]',
    methodology:
      'Computes both Epley and Brzycki 1RM predictions and outputs training zone percentages from 60% hypertrophy to 95% peaking.',
    faqs: [
      {
        q: 'Which rep range gives the best 1RM estimate?',
        a: 'Sets of 2 to 8 repetitions produce the tightest correlation with true maximal single-rep strength.',
      },
      {
        q: 'Why show both Epley and Brzycki?',
        a: 'Brzycki is slightly more conservative above 8 reps; comparing both avoids over-programming training loads.',
      },
    ],
    inputs: [
      { id: 'weight', label: 'Lifted Weight', val: 100, min: 5, max: 600, step: 2.5, unit: 'kg/lb' },
      { id: 'reps', label: 'Completed Reps', val: 5, min: 1, max: 20, step: 1, unit: 'reps' },
    ],
    calc: (v) => {
      const w = Math.max(1, v.weight ?? 100);
      const reps = Math.max(1, Math.round(v.reps ?? 5));
      const epley = reps === 1 ? w : w * (1 + reps / 30);
      const brzycki = reps === 1 ? w : w * (36 / Math.max(1, 37 - reps));
      return {
        primary: `${epley.toFixed(1)}`,
        primaryLabel: 'Estimated 1RM (Epley)',
        details: [
          { label: 'Brzycki Estimate', val: brzycki.toFixed(1) },
          { label: '90% (Heavy Doubles/Triples)', val: (epley * 0.9).toFixed(1) },
          { label: '80% (Strength 5×5)', val: (epley * 0.8).toFixed(1) },
          { label: '70% (Hypertrophy 8–12)', val: (epley * 0.7).toFixed(1) },
        ],
      };
    },
  },
  {
    id: 'heartrate',
    name: 'Target Heart Rate Zones (Karvonen)',
    category: 'Fitness',
    desc: 'Compute personalized Zone 1–5 aerobic and anaerobic heart rate training bands.',
    formulaExplanation: 'Target HR = [(HR_max - HR_rest) × %Intensity] + HR_rest',
    methodology:
      'Uses the Tanaka maximum heart rate equation (208 - 0.7 × age) combined with your resting heart rate reserve (Karvonen method).',
    faqs: [
      {
        q: 'Why use Karvonen instead of simple % of Max HR?',
        a: 'Incorporating resting heart rate accounts for cardiovascular fitness, producing much more accurate Zone 2 thresholds.',
      },
      {
        q: 'What is Zone 2 training?',
        a: 'Zone 2 (60%–70% Heart Rate Reserve) builds mitochondrial density and aerobic base without excessive recovery debt.',
      },
    ],
    inputs: [
      { id: 'age', label: 'Age', val: 32, min: 12, max: 90, step: 1, unit: 'yr' },
      { id: 'restHr', label: 'Resting Heart Rate', val: 60, min: 35, max: 110, step: 1, unit: 'bpm' },
    ],
    calc: (v) => {
      const age = Math.max(10, v.age ?? 32);
      const rest = Math.max(35, v.restHr ?? 60);
      const maxHr = Math.round(208 - 0.7 * age);
      const reserve = Math.max(20, maxHr - rest);
      const zone = (p: number) => Math.round(reserve * p + rest);
      return {
        primary: `${zone(0.6)}–${zone(0.7)} bpm`,
        primaryLabel: 'Zone 2 Aerobic Base',
        details: [
          { label: 'Estimated Max HR (Tanaka)', val: `${maxHr} bpm` },
          { label: 'Zone 3 Tempo (70–80%)', val: `${zone(0.7)}–${zone(0.8)} bpm` },
          { label: 'Zone 4 Threshold (80–90%)', val: `${zone(0.8)}–${zone(0.9)} bpm` },
          { label: 'Zone 5 VO2 Max (90–100%)', val: `${zone(0.9)}–${maxHr} bpm` },
        ],
      };
    },
  },
  {
    id: 'pace',
    name: 'Running Pace & Race Finish Predictor',
    category: 'Fitness',
    desc: 'Convert distance and elapsed time into min/km pace, speed, and 5K / 10K / Marathon finish estimates.',
    formulaExplanation: 'Pace = Total Minutes / Distance(km)',
    methodology:
      'Calculates exact average pace per kilometer and mile, then scales finish times for standard race distances.',
    faqs: [
      {
        q: 'How is min/mile converted from min/km?',
        a: 'Multiply min/km by 1.60934 to get pace per mile.',
      },
      {
        q: 'Does linear scaling predict marathons accurately?',
        a: 'This uses constant-pace splits; beginners should allow 5%–10% slowdown for distances beyond their long-run training base.',
      },
    ],
    inputs: [
      { id: 'distance', label: 'Distance (km)', val: 10, min: 0.5, max: 100, step: 0.5, unit: 'km' },
      { id: 'minutes', label: 'Elapsed Time (min)', val: 50, min: 1, max: 600, step: 1, unit: 'min' },
    ],
    calc: (v) => {
      const dist = Math.max(0.1, v.distance ?? 10);
      const mins = Math.max(0.5, v.minutes ?? 50);
      const paceKm = mins / dist;
      const paceMi = paceKm * 1.60934;
      const fmtTime = (totalM: number) => {
        const hrs = Math.floor(totalM / 60);
        const m = Math.floor(totalM % 60);
        const s = Math.round((totalM - Math.floor(totalM)) * 60);
        const mm = String(m).padStart(2, '0');
        const ss = String(s === 60 ? 0 : s).padStart(2, '0');
        return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${m}:${ss}`;
      };
      return {
        primary: `${fmtTime(paceKm)} /km`,
        primaryLabel: 'Average Running Pace',
        details: [
          { label: 'Pace per Mile', val: `${fmtTime(paceMi)} /mi` },
          { label: 'Average Speed', val: `${(dist / (mins / 60)).toFixed(2)} km/h` },
          { label: 'Projected Half Marathon (21.1k)', val: fmtTime(paceKm * 21.0975) },
          { label: 'Projected Marathon (42.2k)', val: fmtTime(paceKm * 42.195) },
        ],
      };
    },
  },
  {
    id: 'water',
    name: 'Daily Hydration Requirement',
    category: 'Fitness',
    desc: 'Estimate optimal daily water intake adjusted for body mass and exercise duration.',
    formulaExplanation: 'Base Water = Weight(kg) × 35 mL + Exercise(min) × 12 mL',
    methodology:
      'Combines baseline 35 mL/kg physiological hydration need with additional sweat replacement per minute of moderate-to-vigorous exercise.',
    faqs: [
      {
        q: 'Does hydration include water from food?',
        a: 'Roughly 20% of daily fluid comes from fruits, vegetables, and meals; the remaining 80% comes from beverages.',
      },
      {
        q: 'Should I drink more in hot climates?',
        a: 'Yes—high heat or altitude can increase daily fluid requirements by 15%–30%.',
      },
    ],
    inputs: [
      { id: 'weight', label: 'Body Weight (kg)', val: 72, min: 30, max: 200, step: 1, unit: 'kg' },
      { id: 'exerciseMin', label: 'Daily Exercise (min)', val: 45, min: 0, max: 240, step: 5, unit: 'min' },
    ],
    calc: (v) => {
      const ml = (v.weight ?? 72) * 35 + (v.exerciseMin ?? 45) * 12;
      const liters = ml / 1000;
      const oz = ml / 29.5735;
      return {
        primary: `${liters.toFixed(2)} L`,
        primaryLabel: 'Recommended Daily Intake',
        details: [
          { label: 'Fluid Ounces', val: `${Math.round(oz)} fl oz` },
          { label: '250 mL Glasses', val: `${Math.round(ml / 250)} glasses` },
        ],
      };
    },
  },
  {
    id: 'idealweight',
    name: 'Ideal Body Weight (Devine & Robinson)',
    category: 'Fitness',
    desc: 'Compare clinical height-based reference weight formulas (Devine, Robinson, and Miller).',
    formulaExplanation: 'Devine (Male) = 50 + 2.3 × (Inches over 60)',
    methodology:
      'Calculates anthropometric reference weights across three established medical equations using height in centimeters above 5 feet (152.4 cm).',
    faqs: [
      {
        q: 'Where is the Devine formula used?',
        a: 'Originally published for clinical drug dosing, it remains a standard anthropometric benchmark.',
      },
      {
        q: 'Why do the formulas differ slightly?',
        a: 'Each equation was calibrated on different population cohorts with slightly varying slopes per inch of height.',
      },
    ],
    inputs: [
      {
        id: 'sex',
        label: 'Biological Sex',
        val: 1,
        min: 0,
        max: 1,
        step: 1,
        options: [
          { label: 'Male', value: 1 },
          { label: 'Female', value: 0 },
        ],
      },
      { id: 'height', label: 'Height (cm)', val: 175, min: 140, max: 220, step: 1, unit: 'cm' },
    ],
    calc: (v) => {
      const isMale = (v.sex ?? 1) === 1;
      const inchesOver60 = Math.max(0, (v.height ?? 175) / 2.54 - 60);
      const devine = (isMale ? 50 : 45.5) + 2.3 * inchesOver60;
      const robinson = (isMale ? 52 : 49) + (isMale ? 1.9 : 1.7) * inchesOver60;
      const miller = (isMale ? 56.2 : 53.1) + (isMale ? 1.41 : 1.36) * inchesOver60;
      return {
        primary: `${devine.toFixed(1)} kg`,
        primaryLabel: 'Devine Reference Weight',
        details: [
          { label: 'Robinson Formula', val: `${robinson.toFixed(1)} kg` },
          { label: 'Miller Formula', val: `${miller.toFixed(1)} kg` },
          { label: 'Pounds Equivalent', val: `${(devine * 2.20462).toFixed(1)} lb` },
        ],
      };
    },
  },

  // ===================== MATH (12) =====================
  {
    id: 'percentage',
    name: 'Percentage & Percent Change',
    category: 'Math',
    desc: 'Calculate percentage of a base value, percentage increase/decrease, and relative difference.',
    formulaExplanation: '% Change = [(B - A) / |A|] × 100',
    methodology:
      'Computes both P% of value A and the directional percentage shift from A to B with absolute difference.',
    faqs: [
      {
        q: 'Why is percentage increase from 50 to 75 not equal to decrease from 75 to 50?',
        a: 'From 50 to 75 is +50% (25/50), while from 75 to 50 is -33.3% (25/75) because the denominator changes.',
      },
      {
        q: 'How do I compute X% of Y quickly?',
        a: 'Multiply Y by X and divide by 100.',
      },
    ],
    inputs: [
      { id: 'a', label: 'Base Value (A)', val: 250, min: -1000000, max: 1000000, step: 1 },
      { id: 'b', label: 'Comparison Value / Percent (B)', val: 310, min: -1000000, max: 1000000, step: 1 },
    ],
    calc: (v) => {
      const a = v.a ?? 250;
      const b = v.b ?? 310;
      const pctChange = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
      const bPctOfA = (a * b) / 100;
      return {
        primary: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`,
        primaryLabel: 'Percentage Change (A → B)',
        details: [
          { label: 'Absolute Difference (B - A)', val: fmtNum(b - a, 4) },
          { label: `${b}% of ${a}`, val: fmtNum(bPctOfA, 4) },
          { label: `Ratio (B / A)`, val: a !== 0 ? fmtNum(b / a, 4) : 'Undefined' },
        ],
      };
    },
  },
  {
    id: 'fraction',
    name: 'Fraction Arithmetic & Simplifier',
    category: 'Math',
    desc: 'Add, subtract, multiply, and divide two fractions with automatic GCD simplification.',
    formulaExplanation: 'a/b + c/d = (ad + bc) / bd',
    methodology:
      'Computes exact integer numerator/denominator arithmetic reduced by the Euclidean Greatest Common Divisor (GCD), guarding cleanly against zero denominators.',
    faqs: [
      {
        q: 'What happens if a denominator is 0?',
        a: 'Division by zero is undefined in arithmetic, so the calculator warns you instead of silently altering your input.',
      },
      {
        q: 'How does reduction work?',
        a: 'Both numerator and denominator are divided by their Greatest Common Divisor.',
      },
    ],
    inputs: [
      { id: 'n1', label: 'Fraction 1 Numerator', val: 3, min: -10000, max: 10000, step: 1 },
      { id: 'd1', label: 'Fraction 1 Denominator', val: 4, min: -10000, max: 10000, step: 1 },
      { id: 'n2', label: 'Fraction 2 Numerator', val: 2, min: -10000, max: 10000, step: 1 },
      { id: 'd2', label: 'Fraction 2 Denominator', val: 5, min: -10000, max: 10000, step: 1 },
    ],
    calc: (v) => {
      const n1 = Math.round(v.n1 ?? 3);
      const d1 = Math.round(v.d1 ?? 4);
      const n2 = Math.round(v.n2 ?? 2);
      const d2 = Math.round(v.d2 ?? 5);
      if (d1 === 0 || d2 === 0) {
        return {
          primary: 'Undefined (÷ 0)',
          primaryLabel: 'Invalid Denominator',
          details: [{ label: 'Error', val: 'Denominator cannot be zero.' }],
        };
      }
      const reduce = (num: number, den: number) => {
        const sign = den < 0 ? -1 : 1;
        const g = gcd(num, den);
        return `${(num * sign) / g}/${(den * sign) / g}`;
      };
      const sumN = n1 * d2 + n2 * d1;
      const sumD = d1 * d2;
      const diffN = n1 * d2 - n2 * d1;
      const prodN = n1 * n2;
      const quot = n2 !== 0 ? reduce(n1 * d2, d1 * n2) : 'Undefined (÷ 0)';
      return {
        primary: reduce(sumN, sumD),
        primaryLabel: 'Reduced Sum (F1 + F2)',
        details: [
          { label: 'Decimal Value of Sum', val: (sumN / sumD).toFixed(5) },
          { label: 'Difference (F1 - F2)', val: reduce(diffN, sumD) },
          { label: 'Product (F1 × F2)', val: reduce(prodN, sumD) },
          { label: 'Quotient (F1 ÷ F2)', val: quot },
        ],
      };
    },
  },
  {
    id: 'quadratic',
    name: 'Quadratic Equation Solver',
    category: 'Math',
    desc: 'Solve ax² + bx + c = 0 for real or complex roots, discriminant, and parabolic vertex.',
    formulaExplanation: 'x = [-b ± √(b² - 4ac)] / (2a)',
    methodology:
      'Evaluates discriminant Δ = b² - 4ac to handle two real roots, repeated vertex roots, complex conjugate pairs, or linear fallback when a = 0.',
    faqs: [
      {
        q: 'What does a negative discriminant mean?',
        a: 'The parabola does not intersect the real x-axis; its roots are a complex conjugate pair α ± βi.',
      },
      {
        q: 'How is the vertex calculated?',
        a: 'The vertex sits at x = -b / (2a) and y = c - b² / (4a).',
      },
    ],
    inputs: [
      { id: 'a', label: 'Coefficient a', val: 1, min: -1000, max: 1000, step: 0.5 },
      { id: 'b', label: 'Coefficient b', val: -5, min: -1000, max: 1000, step: 0.5 },
      { id: 'c', label: 'Constant c', val: 6, min: -1000, max: 1000, step: 0.5 },
    ],
    calc: (v) => {
      const a = v.a ?? 1;
      const b = v.b ?? -5;
      const c = v.c ?? 6;
      if (a === 0) {
        const root = b !== 0 ? (-c / b).toFixed(4) : 'No unique root';
        return {
          primary: `x = ${root}`,
          primaryLabel: 'Linear Equation (a = 0)',
          details: [{ label: 'Note', val: 'With a = 0, equation reduces to bx + c = 0.' }],
        };
      }
      const disc = b * b - 4 * a * c;
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      if (disc >= 0) {
        const r1 = (-b + Math.sqrt(disc)) / (2 * a);
        const r2 = (-b - Math.sqrt(disc)) / (2 * a);
        return {
          primary: disc === 0 ? `x = ${r1.toFixed(4)}` : `x₁=${r1.toFixed(3)}, x₂=${r2.toFixed(3)}`,
          primaryLabel: disc === 0 ? 'Repeated Real Root' : 'Two Real Roots',
          details: [
            { label: 'Discriminant (Δ)', val: fmtNum(disc, 4) },
            { label: 'Parabolic Vertex', val: `(${vx.toFixed(3)}, ${vy.toFixed(3)})` },
          ],
        };
      }
      const real = (-b / (2 * a)).toFixed(3);
      const imag = (Math.sqrt(-disc) / Math.abs(2 * a)).toFixed(3);
      return {
        primary: `${real} ± ${imag}i`,
        primaryLabel: 'Complex Conjugate Roots',
        details: [
          { label: 'Discriminant (Δ)', val: fmtNum(disc, 4) },
          { label: 'Parabolic Vertex', val: `(${vx.toFixed(3)}, ${vy.toFixed(3)})` },
        ],
      };
    },
  },
  {
    id: 'pythagorean',
    name: 'Right Triangle & Pythagorean Theorem',
    category: 'Math',
    desc: 'Compute hypotenuse length, interior angles, area, and perimeter from right-triangle legs a and b.',
    formulaExplanation: 'c = √(a² + b²)',
    methodology:
      'Applies the Euclidean Pythagorean theorem and inverse tangent trigonometry to solve all sides and angles.',
    faqs: [
      {
        q: 'What is a Pythagorean triple?',
        a: 'Integer solutions like (3, 4, 5) or (5, 12, 13) where a² + b² equals an exact integer square c².',
      },
      {
        q: 'Do the two acute angles always add to 90°?',
        a: 'Yes, because total interior angles of any Euclidean triangle equal 180° and the right angle takes 90°.',
      },
    ],
    inputs: [
      { id: 'a', label: 'Leg a', val: 3, min: 0.01, max: 10000, step: 0.5 },
      { id: 'b', label: 'Leg b', val: 4, min: 0.01, max: 10000, step: 0.5 },
    ],
    calc: (v) => {
      const a = Math.max(0.001, v.a ?? 3);
      const b = Math.max(0.001, v.b ?? 4);
      const c = Math.hypot(a, b);
      const angA = (Math.atan2(a, b) * 180) / Math.PI;
      return {
        primary: c.toFixed(4),
        primaryLabel: 'Hypotenuse (c)',
        details: [
          { label: 'Area (½ab)', val: fmtNum(0.5 * a * b, 4) },
          { label: 'Perimeter', val: fmtNum(a + b + c, 4) },
          { label: 'Angle α / Angle β', val: `${angA.toFixed(2)}° / ${(90 - angA).toFixed(2)}°` },
        ],
      };
    },
  },
  {
    id: 'circle',
    name: 'Circle Area, Circumference & Sector',
    category: 'Math',
    desc: 'Compute circle diameter, circumference, area, and arc/sector geometry from radius.',
    formulaExplanation: 'A = πr²  |  C = 2πr',
    methodology:
      'Uses full IEEE-754 double-precision Math.PI to evaluate circular area, circumference, and sector arc length for any central angle.',
    faqs: [
      {
        q: 'What happens to area if radius doubles?',
        a: 'Area scales quadratically with radius—doubling radius quadruples total circular area.',
      },
      {
        q: 'How is arc length computed?',
        a: 'Arc length equals circumference multiplied by (Central Angle ÷ 360°).',
      },
    ],
    inputs: [
      { id: 'r', label: 'Radius (r)', val: 10, min: 0.01, max: 10000, step: 0.5 },
      { id: 'deg', label: 'Sector Angle (°)', val: 90, min: 1, max: 360, step: 5, unit: '°' },
    ],
    calc: (v) => {
      const r = Math.max(0.001, v.r ?? 10);
      const deg = Math.min(360, Math.max(0, v.deg ?? 90));
      const area = Math.PI * r * r;
      const circ = 2 * Math.PI * r;
      return {
        primary: fmtNum(area, 4),
        primaryLabel: 'Total Circle Area',
        details: [
          { label: 'Circumference', val: fmtNum(circ, 4) },
          { label: 'Diameter (2r)', val: fmtNum(2 * r, 4) },
          { label: `Sector Area (${deg}°)`, val: fmtNum(area * (deg / 360), 4) },
          { label: `Arc Length (${deg}°)`, val: fmtNum(circ * (deg / 360), 4) },
        ],
      };
    },
  },
  {
    id: 'sphere',
    name: 'Sphere Volume & Surface Area',
    category: 'Math',
    desc: 'Calculate 3D spherical volume, surface area, and equatorial great-circle circumference.',
    formulaExplanation: 'V = (4/3)πr³  |  SA = 4πr²',
    methodology:
      'Computes exact Euclidean 3-sphere geometry from radius r.',
    faqs: [
      {
        q: 'Why does volume grow faster than surface area?',
        a: 'Volume scales with r³ while surface area scales with r², which governs heat dissipation and buoyancy in physics.',
      },
      {
        q: 'What is a great circle?',
        a: 'The largest circle drawable on a sphere, sharing the exact radius and center of the sphere.',
      },
    ],
    inputs: [{ id: 'r', label: 'Radius (r)', val: 5, min: 0.01, max: 10000, step: 0.25 }],
    calc: (v) => {
      const r = Math.max(0.001, v.r ?? 5);
      const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
      const sa = 4 * Math.PI * r * r;
      return {
        primary: fmtNum(vol, 4),
        primaryLabel: 'Sphere Volume',
        details: [
          { label: 'Surface Area', val: fmtNum(sa, 4) },
          { label: 'Great Circle Circumference', val: fmtNum(2 * Math.PI * r, 4) },
        ],
      };
    },
  },
  {
    id: 'cylinder',
    name: 'Cylinder Volume & Surface Area',
    category: 'Math',
    desc: 'Solve right circular cylinder volume, lateral surface area, and total surface area.',
    formulaExplanation: 'V = πr²h  |  Total SA = 2πr(r + h)',
    methodology:
      'Separates curved lateral wall area (2πrh) from top and bottom circular caps (2πr²).',
    faqs: [
      {
        q: 'How do I find tank capacity in liters?',
        a: 'If radius and height are measured in centimeters, divide the resulting cm³ volume by 1,000 to get liters.',
      },
      {
        q: 'What is lateral surface area used for?',
        a: 'Label sizing on cans, sheet metal wrapping, and pipe insulation calculations.',
      },
    ],
    inputs: [
      { id: 'r', label: 'Radius (r)', val: 4, min: 0.01, max: 5000, step: 0.25 },
      { id: 'h', label: 'Height (h)', val: 12, min: 0.01, max: 5000, step: 0.5 },
    ],
    calc: (v) => {
      const r = Math.max(0.001, v.r ?? 4);
      const h = Math.max(0.001, v.h ?? 12);
      const vol = Math.PI * r * r * h;
      const lateral = 2 * Math.PI * r * h;
      const total = lateral + 2 * Math.PI * r * r;
      return {
        primary: fmtNum(vol, 4),
        primaryLabel: 'Cylinder Volume',
        details: [
          { label: 'Total Surface Area', val: fmtNum(total, 4) },
          { label: 'Lateral Area (Side)', val: fmtNum(lateral, 4) },
          { label: 'Base Area (πr²)', val: fmtNum(Math.PI * r * r, 4) },
        ],
      };
    },
  },
  {
    id: 'slope',
    name: 'Linear Slope, Distance & Midpoint',
    category: 'Math',
    desc: 'Find the slope m, y-intercept b, Euclidean distance, and midpoint between two Cartesian coordinates.',
    formulaExplanation: 'm = (y₂ - y₁) / (x₂ - x₁)',
    methodology:
      'Computes Cartesian coordinate geometry for points (x₁, y₁) and (x₂, y₂), guarding vertical lines where Δx = 0.',
    faqs: [
      {
        q: 'What is the slope of a vertical line?',
        a: 'Undefined, because x₂ - x₁ = 0 and division by zero is undefined.',
      },
      {
        q: 'How is line angle computed?',
        a: 'Angle in degrees equals atan2(Δy, Δx) converted from radians.',
      },
    ],
    inputs: [
      { id: 'x1', label: 'x₁', val: 2, min: -1000, max: 1000, step: 1 },
      { id: 'y1', label: 'y₁', val: 3, min: -1000, max: 1000, step: 1 },
      { id: 'x2', label: 'x₂', val: 8, min: -1000, max: 1000, step: 1 },
      { id: 'y2', label: 'y₂', val: 15, min: -1000, max: 1000, step: 1 },
    ],
    calc: (v) => {
      const x1 = v.x1 ?? 2, y1 = v.y1 ?? 3, x2 = v.x2 ?? 8, y2 = v.y2 ?? 15;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const mid = `(${((x1 + x2) / 2).toFixed(2)}, ${((y1 + y2) / 2).toFixed(2)})`;
      if (dx === 0) {
        return {
          primary: 'Undefined (Vertical)',
          primaryLabel: `Line x = ${x1}`,
          details: [
            { label: 'Distance', val: fmtNum(dist, 4) },
            { label: 'Midpoint', val: mid },
          ],
        };
      }
      const m = dy / dx;
      const b = y1 - m * x1;
      return {
        primary: `m = ${m.toFixed(4)}`,
        primaryLabel: `y = ${m.toFixed(2)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}`,
        details: [
          { label: 'Euclidean Distance', val: fmtNum(dist, 4) },
          { label: 'Midpoint', val: mid },
          { label: 'Angle from +X Axis', val: `${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2)}°` },
        ],
      };
    },
  },
  {
    id: 'statistics',
    name: 'Standard Deviation & Z-Score',
    category: 'Math',
    desc: 'Compute Z-score, percentile approximation, variance, and coefficient of variation.',
    formulaExplanation: 'Z = (x - μ) / σ',
    methodology:
      'Normalizes observation x against mean μ and standard deviation σ, applying the Abramowitz-Stegun normal CDF approximation for cumulative percentile.',
    faqs: [
      {
        q: 'What does a Z-score of +2.0 indicate?',
        a: 'The value lies 2 standard deviations above the mean—roughly the 97.7th percentile in a normal distribution.',
      },
      {
        q: 'What is Coefficient of Variation (CV)?',
        a: 'σ / μ expresses relative dispersion as a percentage, useful when comparing datasets with different units.',
      },
    ],
    inputs: [
      { id: 'x', label: 'Observed Value (x)', val: 85, min: -10000, max: 10000, step: 0.5 },
      { id: 'mean', label: 'Mean (μ)', val: 72, min: -10000, max: 10000, step: 0.5 },
      { id: 'sd', label: 'Std Deviation (σ)', val: 8, min: 0.01, max: 5000, step: 0.25 },
    ],
    calc: (v) => {
      const x = v.x ?? 85;
      const mu = v.mean ?? 72;
      const sd = Math.max(0.001, v.sd ?? 8);
      const z = (x - mu) / sd;
      // Normal CDF approximation
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989423 * Math.exp((-z * z) / 2);
      const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      const cdf = z > 0 ? 1 - p : p;
      return {
        primary: `Z = ${z >= 0 ? '+' : ''}${z.toFixed(3)}`,
        primaryLabel: 'Standardized Z-Score',
        details: [
          { label: 'Approx. Normal Percentile', val: `${(cdf * 100).toFixed(2)}%` },
          { label: 'Population Variance (σ²)', val: fmtNum(sd * sd, 4) },
          { label: 'Coefficient of Variation', val: mu !== 0 ? `${((sd / Math.abs(mu)) * 100).toFixed(2)}%` : '—' },
        ],
      };
    },
  },
  {
    id: 'probability',
    name: 'Combinations (nCr) & Permutations (nPr)',
    category: 'Math',
    desc: 'Calculate exact unordered combinations and ordered permutations for discrete sample spaces.',
    formulaExplanation: 'nCr = n! / [r!(n - r)!]  |  nPr = n! / (n - r)!',
    methodology:
      'Computes combinatorics for n total items choosing r items, highlighting both order-independent combinations and order-dependent permutations.',
    faqs: [
      {
        q: 'When should I use nCr vs nPr?',
        a: 'Use nCr when order does not matter (lottery tickets, committees) and nPr when sequence matters (PIN codes, race rankings).',
      },
      {
        q: 'What if r exceeds n?',
        a: 'You cannot choose more distinct items than exist without replacement, so r is clamped to n.',
      },
    ],
    inputs: [
      { id: 'n', label: 'Total Items (n)', val: 12, min: 1, max: 50, step: 1 },
      { id: 'r', label: 'Selected Items (r)', val: 4, min: 0, max: 50, step: 1 },
    ],
    calc: (v) => {
      const n = Math.max(1, Math.min(100, Math.round(v.n ?? 12)));
      const r = Math.max(0, Math.min(n, Math.round(v.r ?? 4)));
      const nPr = factorial(n) / factorial(n - r);
      const nCr = nPr / factorial(r);
      return {
        primary: fmtNum(nCr, 0),
        primaryLabel: `Combinations C(${n}, ${r})`,
        details: [
          { label: `Permutations P(${n}, ${r})`, val: fmtNum(nPr, 0) },
          { label: 'Single-Pick Probability (1 / nCr)', val: `${((1 / nCr) * 100).toExponential(3)}%` },
        ],
      };
    },
  },
  {
    id: 'logarithm',
    name: 'Logarithm Base-b & Natural Log',
    category: 'Math',
    desc: 'Evaluate log_b(x), natural logarithm ln(x), common log₁₀(x), and binary log₂(x).',
    formulaExplanation: 'log_b(x) = ln(x) / ln(b)',
    methodology:
      'Uses the change-of-base identity via double-precision natural logarithms for any positive x and positive base b ≠ 1.',
    faqs: [
      {
        q: 'Why must logarithm base b not equal 1?',
        a: 'Because 1 raised to any exponent always equals 1, so ln(1) = 0 causes division by zero.',
      },
      {
        q: 'Where is log₂ used?',
        a: 'Information theory (bits of entropy) and binary search tree depth O(log₂ n).',
      },
    ],
    inputs: [
      { id: 'x', label: 'Argument (x)', val: 1024, min: 0.0001, max: 10000000, step: 1 },
      { id: 'base', label: 'Base (b)', val: 2, min: 0.1, max: 1000, step: 0.5 },
    ],
    calc: (v) => {
      const x = Math.max(0.000001, v.x ?? 1024);
      const b = Math.max(0.000001, v.base ?? 2);
      if (b === 1) {
        return {
          primary: 'Undefined (Base = 1)',
          primaryLabel: 'Invalid Base',
          details: [{ label: 'Note', val: 'Logarithm base cannot equal 1.' }],
        };
      }
      const res = Math.log(x) / Math.log(b);
      return {
        primary: res.toFixed(6),
        primaryLabel: `log_${b}(${x})`,
        details: [
          { label: 'Natural Log ln(x)', val: Math.log(x).toFixed(6) },
          { label: 'Common Log₁₀(x)', val: Math.log10(x).toFixed(6) },
          { label: 'Binary Log₂(x)', val: Math.log2(x).toFixed(6) },
        ],
      };
    },
  },
  {
    id: 'random',
    name: 'Cryptographic Random Number Generator',
    category: 'Math',
    desc: 'Generate uniform integer samples within an inclusive [min, max] range using browser CSPRNG.',
    formulaExplanation: 'Sample ∈ [Min, Max] via Uint32 CSPRNG',
    methodology:
      'Draws uniform 32-bit unsigned integers from window.crypto.getRandomValues when running in the browser.',
    faqs: [
      {
        q: 'Why use window.crypto instead of Math.random()?',
        a: 'Cryptographic PRNGs avoid predictable seed patterns when sampling dice, raffles, or test indices.',
      },
      {
        q: 'How do I trigger a new roll?',
        a: 'Adjust either bound or click Save Snapshot / Randomize to sample a fresh integer.',
      },
    ],
    inputs: [
      { id: 'minVal', label: 'Minimum Value', val: 1, min: -100000, max: 100000, step: 1 },
      { id: 'maxVal', label: 'Maximum Value', val: 100, min: -100000, max: 100000, step: 1 },
      { id: 'seed', label: 'Draw Trigger', val: 1, min: 1, max: 9999, step: 1 },
    ],
    calc: (v) => {
      const lo = Math.ceil(Math.min(v.minVal ?? 1, v.maxVal ?? 100));
      const hi = Math.floor(Math.max(v.minVal ?? 1, v.maxVal ?? 100));
      const span = hi - lo + 1;
      let val = lo;
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        val = lo + (arr[0] % span);
      } else {
        val = lo + (((v.seed ?? 1) * 7919) % span);
      }
      return {
        primary: String(val),
        primaryLabel: `Random Integer [${lo}, ${hi}]`,
        details: [
          { label: 'Sample Space Size', val: fmtNum(span, 0) },
          { label: 'Single Outcome Odds', val: `1 in ${fmtNum(span, 0)}` },
        ],
      };
    },
  },

  // ===================== ENGINEERING (11) =====================
  {
    id: 'subnet',
    name: 'IPv4 CIDR Subnetting & Host Range',
    category: 'Engineering',
    desc: 'Compute subnet mask, wildcard mask, total addresses, and usable host capacity from CIDR prefix.',
    formulaExplanation: 'Usable Hosts = 2^(32 - prefix) - 2  (for prefix ≤ 30)',
    methodology:
      'Converts a CIDR bitmask prefix (/1 through /32) into dotted-decimal subnet and wildcard masks with RFC 3021 /31 and /32 edge handling.',
    faqs: [
      {
        q: 'Why does a /24 subnet have 254 usable hosts instead of 256?',
        a: 'Two IPv4 addresses are reserved: the all-zeros Network ID and the all-ones Broadcast address.',
      },
      {
        q: 'What is a wildcard mask?',
        a: 'The bitwise inverse of the subnet mask (255.255.255.255 minus subnet mask), commonly used in router ACLs and OSPF.',
      },
    ],
    inputs: [
      { id: 'cidr', label: 'CIDR Prefix (/)', val: 24, min: 8, max: 32, step: 1, unit: '/bits' },
      { id: 'oct1', label: 'Base Octet 1', val: 192, min: 0, max: 255, step: 1 },
      { id: 'oct2', label: 'Base Octet 2', val: 168, min: 0, max: 255, step: 1 },
      { id: 'oct3', label: 'Base Octet 3', val: 1, min: 0, max: 255, step: 1 },
      { id: 'oct4', label: 'Base Octet 4', val: 0, min: 0, max: 255, step: 1 },
    ],
    calc: (v) => {
      const prefix = Math.min(32, Math.max(0, Math.round(v.cidr ?? 24)));
      const ipInt =
        (((v.oct1 ?? 192) & 255) << 24) |
        (((v.oct2 ?? 168) & 255) << 16) |
        (((v.oct3 ?? 1) & 255) << 8) |
        ((v.oct4 ?? 0) & 255);
      const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      const wildInt = (~maskInt) >>> 0;
      const netInt = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | wildInt) >>> 0;
      const toIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
      const total = Math.pow(2, 32 - prefix);
      const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.max(0, total - 2);
      return {
        primary: `${toIp(netInt)}/${prefix}`,
        primaryLabel: 'Network Address',
        details: [
          { label: 'Subnet Mask', val: toIp(maskInt) },
          { label: 'Wildcard Mask', val: toIp(wildInt) },
          { label: 'Broadcast Address', val: toIp(bcastInt) },
          { label: 'Usable Host Range', val: prefix <= 30 ? `${toIp(netInt + 1)} – ${toIp(bcastInt - 1)}` : toIp(netInt) },
          { label: 'Usable Hosts', val: fmtNum(usable, 0) },
        ],
      };
    },
  },
  {
    id: 'ohmslaw',
    name: "Ohm's Law & DC Power Dissipation",
    category: 'Engineering',
    desc: 'Solve current, electrical power dissipation, and minimum recommended resistor wattage rating.',
    formulaExplanation: 'I = V / R  |  P = V · I = V² / R',
    methodology:
      'Applies Ohm’s linear circuit law and Joule heating wattage, including a 2× thermal derating recommendation for resistor sizing.',
    faqs: [
      {
        q: 'Why size resistors at 2× calculated wattage?',
        a: 'Running a 0.25 W resistor at 0.24 W causes high surface temperatures; 2× derating keeps components cool and reliable.',
      },
      {
        q: 'How does doubling voltage affect power?',
        a: 'Because P = V² / R, doubling voltage quadruples heat dissipation across a fixed resistor.',
      },
    ],
    inputs: [
      { id: 'voltage', label: 'Voltage (V)', val: 12, min: 0.1, max: 1000, step: 0.5, unit: 'V' },
      { id: 'resistance', label: 'Resistance (Ω)', val: 470, min: 0.1, max: 1000000, step: 10, unit: 'Ω' },
    ],
    calc: (v) => {
      const V = Math.max(0, v.voltage ?? 12);
      const R = Math.max(0.001, v.resistance ?? 470);
      const I = V / R;
      const P = V * I;
      return {
        primary: I < 1 ? `${(I * 1000).toFixed(2)} mA` : `${I.toFixed(3)} A`,
        primaryLabel: 'Circuit Current (I)',
        details: [
          { label: 'Power Dissipation (P)', val: P < 1 ? `${(P * 1000).toFixed(2)} mW` : `${P.toFixed(3)} W` },
          { label: '2× Derated Resistor Spec', val: `${(P * 2).toFixed(3)} W min` },
          { label: 'Conductance (G)', val: `${(1000 / R).toFixed(3)} mS` },
        ],
      };
    },
  },
  {
    id: 'resistor',
    name: 'Series & Parallel Resistance',
    category: 'Engineering',
    desc: 'Compute equivalent resistance for two resistors wired in both series and parallel configurations.',
    formulaExplanation: 'R_series = R₁ + R₂  |  R_parallel = (R₁ · R₂) / (R₁ + R₂)',
    methodology:
      'Evaluates both network topologies simultaneously and reports current sharing ratio in parallel branches.',
    faqs: [
      {
        q: 'Is parallel resistance always smaller than the smallest resistor?',
        a: 'Yes. Adding a second parallel path reduces total opposition to current flow below either individual branch.',
      },
      {
        q: 'What happens with two identical resistors in parallel?',
        a: 'Equivalent resistance equals exactly half of one resistor (R / 2).',
      },
    ],
    inputs: [
      { id: 'r1', label: 'Resistor R₁ (Ω)', val: 1000, min: 0.1, max: 10000000, step: 10, unit: 'Ω' },
      { id: 'r2', label: 'Resistor R₂ (Ω)', val: 2200, min: 0.1, max: 10000000, step: 10, unit: 'Ω' },
    ],
    calc: (v) => {
      const r1 = Math.max(0.001, v.r1 ?? 1000);
      const r2 = Math.max(0.001, v.r2 ?? 2200);
      const rPar = (r1 * r2) / (r1 + r2);
      const rSer = r1 + r2;
      return {
        primary: `${fmtNum(rPar, 2)} Ω`,
        primaryLabel: 'Parallel Equivalent (R₁ ∥ R₂)',
        details: [
          { label: 'Series Equivalent (R₁ + R₂)', val: `${fmtNum(rSer, 2)} Ω` },
          { label: 'Current Share in R₁', val: `${((r2 / (r1 + r2)) * 100).toFixed(1)}%` },
          { label: 'Current Share in R₂', val: `${((r1 / (r1 + r2)) * 100).toFixed(1)}%` },
        ],
      };
    },
  },
  {
    id: 'voltage',
    name: 'Voltage Divider Output',
    category: 'Engineering',
    desc: 'Determine unloaded output voltage V_out, attenuation ratio, and quiescent divider current.',
    formulaExplanation: 'V_out = V_in · [R₂ / (R₁ + R₂)]',
    methodology:
      'Calculates steady-state resistive voltage division assuming high-impedance load sensing.',
    faqs: [
      {
        q: 'When does a resistive divider sag under load?',
        a: 'Whenever load impedance is not at least 10×–100× larger than R₂, parallel loading lowers V_out.',
      },
      {
        q: 'How do I minimize standby power draw?',
        a: 'Scale R₁ and R₂ up proportionally (e.g., 10 kΩ / 20 kΩ instead of 100 Ω / 200 Ω) when feeding high-impedance ADC pins.',
      },
    ],
    inputs: [
      { id: 'vin', label: 'Input Voltage (V_in)', val: 5, min: 0.1, max: 500, step: 0.1, unit: 'V' },
      { id: 'r1', label: 'Top Resistor R₁ (Ω)', val: 10000, min: 1, max: 10000000, step: 100, unit: 'Ω' },
      { id: 'r2', label: 'Bottom Resistor R₂ (Ω)', val: 10000, min: 1, max: 10000000, step: 100, unit: 'Ω' },
    ],
    calc: (v) => {
      const vin = Math.max(0, v.vin ?? 5);
      const r1 = Math.max(0.01, v.r1 ?? 10000);
      const r2 = Math.max(0.01, v.r2 ?? 10000);
      const vout = vin * (r2 / (r1 + r2));
      const iq = vin / (r1 + r2);
      return {
        primary: `${vout.toFixed(3)} V`,
        primaryLabel: 'Output Voltage (V_out)',
        details: [
          { label: 'Attenuation Ratio', val: `${((vout / (vin || 1)) * 100).toFixed(2)}%` },
          { label: 'Quiescent Current', val: `${(iq * 1000).toFixed(3)} mA` },
          { label: 'Thevenin Equivalent R', val: `${fmtNum((r1 * r2) / (r1 + r2), 1)} Ω` },
        ],
      };
    },
  },
  {
    id: 'rc',
    name: 'RC Filter Cutoff & Time Constant',
    category: 'Engineering',
    desc: 'Compute -3 dB cutoff frequency, RC time constant τ, and 5τ full settling time.',
    formulaExplanation: 'f_c = 1 / (2πRC)  |  τ = R · C',
    methodology:
      'Models first-order passive RC low-pass and high-pass filters using R in ohms and capacitance C in microfarads.',
    faqs: [
      {
        q: 'What happens at the -3 dB cutoff frequency?',
        a: 'Signal amplitude drops to 70.7% (-3.01 dB) and phase shifts by 45°.',
      },
      {
        q: 'How long does a capacitor take to charge?',
        a: 'One time constant τ reaches 63.2% of final voltage; 5τ reaches 99.3%.',
      },
    ],
    inputs: [
      { id: 'r', label: 'Resistance (Ω)', val: 1000, min: 1, max: 10000000, step: 100, unit: 'Ω' },
      { id: 'cUf', label: 'Capacitance (µF)', val: 0.1, min: 0.0001, max: 10000, step: 0.01, unit: 'µF' },
    ],
    calc: (v) => {
      const R = Math.max(0.01, v.r ?? 1000);
      const C = Math.max(1e-12, (v.cUf ?? 0.1) * 1e-6);
      const tau = R * C;
      const fc = 1 / (2 * Math.PI * tau);
      return {
        primary: fc >= 1000 ? `${(fc / 1000).toFixed(2)} kHz` : `${fc.toFixed(2)} Hz`,
        primaryLabel: '-3 dB Cutoff Frequency',
        details: [
          { label: 'Time Constant (τ)', val: tau < 0.001 ? `${(tau * 1e6).toFixed(2)} µs` : `${(tau * 1000).toFixed(3)} ms` },
          { label: '99.3% Settling Time (5τ)', val: tau * 5 < 0.001 ? `${(tau * 5e6).toFixed(2)} µs` : `${(tau * 5000).toFixed(3)} ms` },
        ],
      };
    },
  },
  {
    id: 'led',
    name: 'LED Current-Limiting Resistor',
    category: 'Engineering',
    desc: 'Size the exact series resistor and wattage rating for an LED from supply and forward voltage.',
    formulaExplanation: 'R = (V_supply - V_forward) / I_led',
    methodology:
      'Subtracts diode forward voltage drop from supply voltage and divides by target forward current in milliamps.',
    faqs: [
      {
        q: 'What are typical LED forward voltages?',
        a: 'Red/amber LEDs drop ~1.8–2.1 V, while blue, white, and emerald-green LEDs drop ~3.0–3.4 V.',
      },
      {
        q: 'Which standard E12 resistor should I pick?',
        a: 'Always round up to the next higher standard resistor value to protect the LED from overcurrent.',
      },
    ],
    inputs: [
      { id: 'vs', label: 'Supply Voltage (V)', val: 5, min: 1, max: 48, step: 0.1, unit: 'V' },
      { id: 'vf', label: 'LED Forward Voltage (V)', val: 2.1, min: 0.5, max: 12, step: 0.1, unit: 'V' },
      { id: 'ma', label: 'Target Current (mA)', val: 20, min: 1, max: 1000, step: 1, unit: 'mA' },
    ],
    calc: (v) => {
      const vs = Math.max(0, v.vs ?? 5);
      const vf = Math.max(0, v.vf ?? 2.1);
      const I = Math.max(0.001, (v.ma ?? 20) / 1000);
      if (vs <= vf) {
        return {
          primary: 'Supply Too Low',
          primaryLabel: 'V_supply must exceed V_forward',
          details: [{ label: 'Voltage Headroom', val: `${(vs - vf).toFixed(2)} V` }],
        };
      }
      const R = (vs - vf) / I;
      const P = (vs - vf) * I;
      return {
        primary: `${Math.round(R)} Ω`,
        primaryLabel: 'Minimum Series Resistor',
        details: [
          { label: 'Resistor Power Dissipation', val: `${(P * 1000).toFixed(1)} mW` },
          { label: 'LED Power Consumption', val: `${(vf * I * 1000).toFixed(1)} mW` },
        ],
      };
    },
  },
  {
    id: 'kinematics',
    name: 'Kinematics & Constant Acceleration',
    category: 'Engineering',
    desc: 'Compute displacement, final velocity, and average velocity under uniform linear acceleration.',
    formulaExplanation: 's = v₀t + ½at²  |  v = v₀ + at',
    methodology:
      'Applies Newton’s constant-acceleration SUVAT equations for initial velocity v₀, acceleration a, and elapsed time t.',
    faqs: [
      {
        q: 'Can I model free-fall gravity?',
        a: 'Yes—set initial velocity v₀ = 0 and acceleration a = 9.81 m/s² to compute free-fall drop distance.',
      },
      {
        q: 'What if acceleration is negative?',
        a: 'Negative acceleration models braking or deceleration against initial motion.',
      },
    ],
    inputs: [
      { id: 'v0', label: 'Initial Velocity v₀ (m/s)', val: 0, min: -1000, max: 1000, step: 1, unit: 'm/s' },
      { id: 'a', label: 'Acceleration a (m/s²)', val: 9.81, min: -100, max: 100, step: 0.1, unit: 'm/s²' },
      { id: 't', label: 'Time t (s)', val: 4, min: 0, max: 1000, step: 0.25, unit: 's' },
    ],
    calc: (v) => {
      const v0 = v.v0 ?? 0;
      const a = v.a ?? 9.81;
      const t = Math.max(0, v.t ?? 4);
      const vf = v0 + a * t;
      const disp = v0 * t + 0.5 * a * t * t;
      return {
        primary: `${disp.toFixed(2)} m`,
        primaryLabel: 'Displacement (s)',
        details: [
          { label: 'Final Velocity (v)', val: `${vf.toFixed(2)} m/s (${(vf * 3.6).toFixed(1)} km/h)` },
          { label: 'Average Velocity', val: `${((v0 + vf) / 2).toFixed(2)} m/s` },
        ],
      };
    },
  },
  {
    id: 'kinetic',
    name: 'Kinetic & Potential Energy',
    category: 'Engineering',
    desc: 'Solve translational kinetic energy, gravitational potential energy, and linear momentum.',
    formulaExplanation: 'KE = ½mv²  |  PE = mgh',
    methodology:
      'Uses standard classical mechanics assuming g = 9.80665 m/s² near Earth’s surface.',
    faqs: [
      {
        q: 'Why does speed affect kinetic energy so strongly?',
        a: 'Kinetic energy depends on velocity squared, so doubling speed increases kinetic energy fourfold.',
      },
      {
        q: 'How is joule related to watt-hours?',
        a: 'One watt-hour equals exactly 3,600 joules.',
      },
    ],
    inputs: [
      { id: 'mass', label: 'Mass (kg)', val: 1500, min: 0.01, max: 1000000, step: 10, unit: 'kg' },
      { id: 'vel', label: 'Velocity (m/s)', val: 25, min: 0, max: 10000, step: 1, unit: 'm/s' },
      { id: 'height', label: 'Elevation (m)', val: 10, min: 0, max: 10000, step: 1, unit: 'm' },
    ],
    calc: (v) => {
      const m = Math.max(0, v.mass ?? 1500);
      const vel = Math.max(0, v.vel ?? 25);
      const h = Math.max(0, v.height ?? 10);
      const ke = 0.5 * m * vel * vel;
      const pe = m * 9.80665 * h;
      return {
        primary: ke >= 1000 ? `${(ke / 1000).toFixed(2)} kJ` : `${ke.toFixed(2)} J`,
        primaryLabel: 'Kinetic Energy (KE)',
        details: [
          { label: 'Gravitational Potential (PE)', val: pe >= 1000 ? `${(pe / 1000).toFixed(2)} kJ` : `${pe.toFixed(2)} J` },
          { label: 'Linear Momentum (p = mv)', val: `${fmtNum(m * vel, 1)} kg·m/s` },
          { label: 'Total Mechanical Energy', val: `${((ke + pe) / 1000).toFixed(2)} kJ` },
        ],
      };
    },
  },
  {
    id: 'torque',
    name: 'Mechanical Torque, RPM & Horsepower',
    category: 'Engineering',
    desc: 'Convert shaft torque (N·m or lb-ft) and rotational speed (RPM) into mechanical kW and HP.',
    formulaExplanation: 'Power (kW) = (Torque_Nm × RPM) / 9549.3',
    methodology:
      'Relates angular velocity ω = 2π·RPM/60 with shaft torque to calculate continuous mechanical power output.',
    faqs: [
      {
        q: 'Where does the 5,252 constant come from in horsepower?',
        a: 'One mechanical horsepower equals 33,000 ft·lb/min; dividing by 2π yields 5,252, so HP and lb-ft torque always cross at 5,252 RPM.',
      },
      {
        q: 'How do kW and mechanical HP convert?',
        a: '1 kW equals approximately 1.34102 mechanical horsepower.',
      },
    ],
    inputs: [
      { id: 'torqueNm', label: 'Shaft Torque (N·m)', val: 320, min: 0.1, max: 50000, step: 5, unit: 'N·m' },
      { id: 'rpm', label: 'Rotational Speed (RPM)', val: 3500, min: 1, max: 50000, step: 100, unit: 'RPM' },
    ],
    calc: (v) => {
      const tq = Math.max(0, v.torqueNm ?? 320);
      const rpm = Math.max(0, v.rpm ?? 3500);
      const kw = (tq * rpm) / 9549.2966;
      const hp = kw * 1.341022;
      const lbft = tq * 0.737562;
      return {
        primary: `${hp.toFixed(1)} HP`,
        primaryLabel: 'Mechanical Power Output',
        details: [
          { label: 'Kilowatts (kW)', val: `${kw.toFixed(2)} kW` },
          { label: 'Imperial Torque', val: `${lbft.toFixed(1)} lb-ft` },
          { label: 'Angular Velocity (ω)', val: `${((rpm * 2 * Math.PI) / 60).toFixed(1)} rad/s` },
        ],
      };
    },
  },
  {
    id: 'datasize',
    name: 'Bandwidth Transfer Time & Storage Units',
    category: 'Engineering',
    desc: 'Estimate exact file transfer duration across Mbps/Gbps links and convert GB vs GiB storage units.',
    formulaExplanation: 'Time(s) = (Size_GB × 8,000) / Speed_Mbps',
    methodology:
      'Accounts for the 8-bits-per-byte factor between decimal storage (GB) and network line rate (Mbps), plus binary IEC GiB conversion.',
    faqs: [
      {
        q: 'Why does a 1 Gbps connection transfer ~125 MB/s instead of 1,000 MB/s?',
        a: 'Network speeds are measured in megabits (Mb), whereas file sizes use megabytes (MB), where 1 byte = 8 bits.',
      },
      {
        q: 'What is the difference between GB and GiB?',
        a: 'GB uses decimal powers of 1000³ bytes, while GiB uses binary powers of 1024³ bytes (~7.37% larger).',
      },
    ],
    inputs: [
      { id: 'sizeGb', label: 'File Size (GB)', val: 25, min: 0.01, max: 100000, step: 1, unit: 'GB' },
      { id: 'mbps', label: 'Network Speed (Mbps)', val: 250, min: 1, max: 100000, step: 10, unit: 'Mbps' },
    ],
    calc: (v) => {
      const gb = Math.max(0, v.sizeGb ?? 25);
      const mbps = Math.max(0.1, v.mbps ?? 250);
      const secs = (gb * 8000) / mbps;
      const mins = secs / 60;
      const gib = (gb * 1e9) / Math.pow(1024, 3);
      return {
        primary: secs >= 60 ? `${mins.toFixed(2)} min` : `${secs.toFixed(1)} sec`,
        primaryLabel: 'Estimated Transfer Time',
        details: [
          { label: 'Effective Throughput', val: `${(mbps / 8).toFixed(2)} MB/s` },
          { label: 'Binary Size (GiB)', val: `${gib.toFixed(3)} GiB` },
          { label: 'Total Megabits', val: `${fmtNum(gb * 8000, 0)} Mb` },
        ],
      };
    },
  },
  {
    id: 'password',
    name: 'Password Entropy & Brute-Force Strength',
    category: 'Engineering',
    desc: 'Calculate cryptographic bit entropy and generate random high-entropy passwords locally.',
    formulaExplanation: 'Entropy (bits) = Length × log₂(Character Pool Size)',
    methodology:
      'Computes information-theoretic entropy in bits across lowercase, uppercase, digits, and symbol alphabets without transmitting anything over the network.',
    faqs: [
      {
        q: 'How many bits of entropy are considered strong?',
        a: 'At least 70–80 bits for standard accounts and 100+ bits for master vaults and cryptographic keys.',
      },
      {
        q: 'Is length or character complexity more important?',
        a: 'Length grows the search space exponentially, making a 16-character passphrase far stronger than a complex 8-character string.',
      },
    ],
    inputs: [
      { id: 'length', label: 'Password Length', val: 16, min: 4, max: 64, step: 1, unit: 'chars' },
      {
        id: 'pool',
        label: 'Character Set Size',
        val: 94,
        min: 26,
        max: 94,
        step: 1,
        options: [
          { label: 'Lowercase Only (26)', value: 26 },
          { label: 'Alphanumeric (62)', value: 62 },
          { label: 'Full Printable ASCII (94)', value: 94 },
        ],
      },
    ],
    calc: (v) => {
      const len = Math.max(4, Math.min(64, Math.round(v.length ?? 16)));
      const pool = Math.max(26, Math.round(v.pool ?? 94));
      const entropy = len * Math.log2(pool);
      const tier = entropy < 50 ? 'Weak' : entropy < 75 ? 'Moderate' : entropy < 100 ? 'Strong' : 'Very Strong (100+ bits)';

      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const syms = '!@#$%^&*()-_=+[]{}|;:,.<>?';
      const charset = pool <= 26 ? lower : pool <= 62 ? lower + upper + nums : lower + upper + nums + syms;

      let sample = '';
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const arr = new Uint32Array(len);
        window.crypto.getRandomValues(arr);
        for (let i = 0; i < len; i++) {
          sample += charset[arr[i] % charset.length];
        }
      } else {
        for (let i = 0; i < len; i++) {
          sample += charset[(i * 17 + len) % charset.length];
        }
      }

      return {
        primary: `${entropy.toFixed(1)} bits`,
        primaryLabel: `Password Entropy (${tier})`,
        details: [
          { label: 'Sample Generated String', val: sample },
          { label: 'Search Space Combinations', val: `2^${entropy.toFixed(1)}` },
        ],
      };
    },
  },
];

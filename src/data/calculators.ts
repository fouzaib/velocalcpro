import { Calculator, ScheduleItem, CurrencyKey } from '../types';
import { formatCurrency, formatNumber, gcd } from '../utils/format';

function generateLoanSchedule(principal: number, monthlyRate: number, totalMonths: number, emi: number, currency: CurrencyKey): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  let balance = principal;
  let yearlyInterest = 0;
  let yearlyPrincipal = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interest = balance * monthlyRate;
    const princ = Math.min(balance, emi - interest);
    balance = Math.max(0, balance - princ);
    yearlyInterest += interest;
    yearlyPrincipal += princ;

    if (m % 12 === 0 || m === totalMonths) {
      schedule.push({
        year: Math.ceil(m / 12),
        principalPaid: formatCurrency(yearlyPrincipal, currency),
        interestPaid: formatCurrency(yearlyInterest, currency),
        balanceRemaining: formatCurrency(balance, currency),
      });
      yearlyInterest = 0;
      yearlyPrincipal = 0;
    }
  }
  return schedule;
}

export const calculators: Calculator[] = [
  // ================= 1. FINANCIAL (19) =================
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    category: 'Financial',
    desc: 'Calculate monthly principal and interest, total loan cost, and full amortization.',
    formulaExplanation: 'M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]',
    inputs: [
      { id: 'homeVal', label: 'Home Purchase Value', val: 400000, step: 5000, min: 1000 },
      { id: 'downPay', label: 'Down Payment', val: 80000, step: 5000, min: 0 },
      { id: 'rate', label: 'Annual Interest Rate (%)', val: 6.5, step: 0.1, min: 0.01, max: 25 },
      { id: 'term', label: 'Loan Term (Years)', val: 30, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const P = Math.max(0, (v.homeVal || 0) - (v.downPay || 0));
      const r = Math.max(0, (v.rate || 0) / 100) / 12;
      const n = Math.max(1, Math.min(600, (v.term || 1) * 12));
      const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalCost = emi * n;
      const totalInterest = Math.max(0, totalCost - P);
      return {
        primary: `${formatCurrency(emi, curr)} /mo`,
        details: [
          { label: 'Financed Principal', val: formatCurrency(P, curr) },
          { label: 'Total Interest Paid', val: formatCurrency(totalInterest, curr) },
          { label: 'Total Lifetime Repayment', val: formatCurrency(totalCost, curr) },
          { label: 'Loan-to-Value (LTV)', val: `${formatNumber(((P / (v.homeVal || 1)) * 100), 1)}%` },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Principal Financed', 'Total Interest'],
          data: [P, totalInterest],
        },
        schedule: generateLoanSchedule(P, r, n, emi, curr),
      };
    },
  },
  {
    id: 'loan',
    name: 'Personal Loan Calculator',
    category: 'Financial',
    desc: 'Compute fixed monthly loan installments and overall borrowing charges.',
    formulaExplanation: 'Standard fixed-rate compound annuity formula',
    inputs: [
      { id: 'amount', label: 'Loan Amount', val: 15000, step: 500, min: 100 },
      { id: 'rate', label: 'Annual APR (%)', val: 8.5, step: 0.1, min: 0.1, max: 40 },
      { id: 'months', label: 'Repayment Term (Months)', val: 36, step: 6, min: 6, max: 120 },
    ],
    calc: (v, curr) => {
      const amt = Math.max(0, v.amount || 0);
      const r = Math.max(0, (v.rate || 0) / 100) / 12;
      const n = Math.max(1, Math.min(360, v.months || 1));
      const emi = r === 0 ? amt / n : (amt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalCost = emi * n;
      const totalInterest = Math.max(0, totalCost - amt);
      return {
        primary: `${formatCurrency(emi, curr)} /mo`,
        details: [
          { label: 'Total Interest Fee', val: formatCurrency(totalInterest, curr) },
          { label: 'Total Sum Repaid', val: formatCurrency(totalCost, curr) },
          { label: 'Interest-to-Principal Ratio', val: `${formatNumber((totalInterest / (amt || 1)) * 100, 1)}%` },
        ],
        schedule: generateLoanSchedule(amt, r, n, emi, curr),
      };
    },
  },
  {
    id: 'tip',
    name: 'Tip & Bill Split Calculator',
    category: 'Financial',
    desc: 'Calculate restaurant gratuity, total check, and fair per-person splits.',
    formulaExplanation: 'Per Person = (Bill + (Bill * Tip%)) / People',
    inputs: [
      { id: 'bill', label: 'Bill Subtotal', val: 85.50, step: 1, min: 0 },
      { id: 'tipPct', label: 'Tip Percentage (%)', val: 18, step: 1, min: 0, max: 100 },
      { id: 'people', label: 'Party Size (People)', val: 3, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const bill = Math.max(0, v.bill || 0);
      const tipPct = Math.max(0, v.tipPct || 0);
      const people = Math.max(1, Math.round(v.people || 1));
      const tipTotal = bill * (tipPct / 100);
      const grandTotal = bill + tipTotal;
      return {
        primary: `${formatCurrency(grandTotal / people, curr)} /person`,
        details: [
          { label: 'Total Gratuity', val: formatCurrency(tipTotal, curr) },
          { label: 'Grand Total Bill', val: formatCurrency(grandTotal, curr) },
          { label: 'Tip Per Person', val: formatCurrency(tipTotal / people, curr) },
        ],
      };
    },
  },
  {
    id: 'creditcard',
    name: 'Credit Card Payoff',
    category: 'Financial',
    desc: 'Determine months and interest required to pay off revolving credit balances.',
    formulaExplanation: 'Compounded monthly balance reduction loop',
    inputs: [
      { id: 'balance', label: 'Current Card Balance', val: 6500, step: 100, min: 50 },
      { id: 'apr', label: 'Annual APR (%)', val: 21.9, step: 0.1, min: 1, max: 50 },
      { id: 'monthly', label: 'Monthly Payment', val: 250, step: 25, min: 10 },
    ],
    calc: (v, curr) => {
      const bal = Math.max(0, v.balance || 0);
      const r = (Math.max(0, v.apr || 0) / 100) / 12;
      const pmt = Math.max(1, v.monthly || 0);
      if (r > 0 && pmt <= bal * r) {
        return {
          primary: 'Payoff Impossible',
          details: [
            { label: 'Alert', val: 'Payment must exceed monthly interest accrual' },
            { label: 'Minimum Required Payment', val: formatCurrency(bal * r + 1, curr) },
          ],
        };
      }
      let months = 0;
      let tempBal = bal;
      let totalInterest = 0;
      while (tempBal > 0 && months < 600) {
        const interest = tempBal * r;
        totalInterest += interest;
        tempBal = tempBal + interest - pmt;
        months++;
      }
      return {
        primary: `${months} Months (${(months / 12).toFixed(1)} yrs)`,
        details: [
          { label: 'Total Interest Accrued', val: formatCurrency(totalInterest, curr) },
          { label: 'Total Lifetime Repayment', val: formatCurrency(bal + totalInterest, curr) },
        ],
      };
    },
  },
  {
    id: 'emergencyfund',
    name: 'Emergency Fund Builder',
    category: 'Financial',
    desc: 'Calculate baseline liquidity reserve recommended for non-discretionary expenses.',
    formulaExplanation: 'Target Reserve = Sum of Essential Expenses * Months Needed',
    inputs: [
      { id: 'rent', label: 'Housing & Utilities', val: 1800, step: 50, min: 0 },
      { id: 'groceries', label: 'Food & Household', val: 600, step: 25, min: 0 },
      { id: 'bills', label: 'Healthcare, Debt & Insurance', val: 500, step: 25, min: 0 },
      { id: 'monthsTarget', label: 'Months of Protection', val: 6, step: 1, min: 1, max: 24 },
    ],
    calc: (v, curr) => {
      const monthly = Math.max(0, v.rent || 0) + Math.max(0, v.groceries || 0) + Math.max(0, v.bills || 0);
      const target = Math.max(1, v.monthsTarget || 3);
      return {
        primary: formatCurrency(monthly * target, curr),
        details: [
          { label: 'Monthly Essential Spend', val: formatCurrency(monthly, curr) },
          { label: '3-Month Lean Reserve', val: formatCurrency(monthly * 3, curr) },
          { label: '6-Month Robust Reserve', val: formatCurrency(monthly * 6, curr) },
          { label: '12-Month Fortress Reserve', val: formatCurrency(monthly * 12, curr) },
        ],
      };
    },
  },
  {
    id: 'dca',
    name: 'DCA Investment Calculator',
    category: 'Financial',
    desc: 'Simulate Dollar-Cost Averaging strategy with monthly compounding.',
    formulaExplanation: 'FV = PMT * [ ((1 + r)^n - 1) / r ]',
    inputs: [
      { id: 'monthly', label: 'Monthly Regular Deposit', val: 400, step: 25, min: 10 },
      { id: 'roi', label: 'Expected Annual Growth (%)', val: 9, step: 0.5, min: 0, max: 30 },
      { id: 'years', label: 'Investment Timeframe (Years)', val: 10, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const pmt = Math.max(0, v.monthly || 0);
      const r = Math.max(0, (v.roi || 0) / 100) / 12;
      const n = Math.max(1, (v.years || 1) * 12);
      const fv = r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r);
      const totalInvested = pmt * n;
      const interestEarned = Math.max(0, fv - totalInvested);
      return {
        primary: formatCurrency(fv, curr),
        details: [
          { label: 'Total Out-of-Pocket Principal', val: formatCurrency(totalInvested, curr) },
          { label: 'Compounded Capital Gains', val: formatCurrency(interestEarned, curr) },
          { label: 'Multiple on Investment (MOIC)', val: `${formatNumber(fv / (totalInvested || 1), 2)}x` },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Principal Invested', 'Compounded Returns'],
          data: [totalInvested, interestEarned],
        },
      };
    },
  },
  {
    id: 'autoloan',
    name: 'Auto Loan Calculator',
    category: 'Financial',
    desc: 'Calculate monthly vehicle financing including trade-in and sales tax.',
    formulaExplanation: 'Financed = (Vehicle Price - Trade-in) * (1 + Sales Tax)',
    inputs: [
      { id: 'price', label: 'Vehicle Agreed Price', val: 32000, step: 500, min: 1000 },
      { id: 'trade', label: 'Trade-in / Cash Down', val: 5000, step: 250, min: 0 },
      { id: 'taxRate', label: 'Sales Tax (%)', val: 7, step: 0.25, min: 0, max: 20 },
      { id: 'rate', label: 'Loan APR (%)', val: 5.9, step: 0.1, min: 0, max: 25 },
      { id: 'term', label: 'Term (Months)', val: 60, step: 12, min: 12, max: 96 },
    ],
    calc: (v, curr) => {
      const taxable = Math.max(0, (v.price || 0) - (v.trade || 0));
      const totalFinanced = taxable * (1 + Math.max(0, v.taxRate || 0) / 100);
      const r = Math.max(0, (v.rate || 0) / 100) / 12;
      const n = Math.max(1, Math.min(120, v.term || 1));
      const emi = r === 0 ? totalFinanced / n : (totalFinanced * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return {
        primary: `${formatCurrency(emi, curr)} /mo`,
        details: [
          { label: 'Net Financed Amount', val: formatCurrency(totalFinanced, curr) },
          { label: 'Total Financing Fees', val: formatCurrency(Math.max(0, emi * n - totalFinanced), curr) },
          { label: 'Total Car Cost (All-in)', val: formatCurrency(emi * n + (v.trade || 0), curr) },
        ],
      };
    },
  },
  {
    id: 'interest',
    name: 'Simple vs Compound Interest',
    category: 'Financial',
    desc: 'Direct comparison between linear simple interest and compounding interest.',
    formulaExplanation: 'Simple: P(1 + rt) | Compound: P(1 + r)^t',
    inputs: [
      { id: 'p', label: 'Initial Deposit (P)', val: 10000, step: 500, min: 100 },
      { id: 'r', label: 'Annual Rate (%)', val: 5, step: 0.1, min: 0.1, max: 30 },
      { id: 't', label: 'Duration (Years)', val: 5, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const p = Math.max(0, v.p || 0);
      const r = Math.max(0, v.r || 0) / 100;
      const t = Math.max(0, Math.min(100, v.t || 0));
      const simple = p * (1 + r * t);
      const compound = p * Math.pow(1 + r, t);
      const diff = compound - simple;
      return {
        primary: formatCurrency(compound, curr),
        details: [
          { label: 'Compound Final Balance', val: formatCurrency(compound, curr) },
          { label: 'Simple Interest Balance', val: formatCurrency(simple, curr) },
          { label: 'Compounding Advantage (Bonus)', val: `+${formatCurrency(diff, curr)}` },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Simple Interest Equivalent', 'Compounding Surplus'],
          data: [simple, Math.max(0, diff)],
        },
      };
    },
  },
  {
    id: 'payment',
    name: 'Target Amortization Payment',
    category: 'Financial',
    desc: 'Target flat monthly payment to completely retire outstanding principal.',
    formulaExplanation: 'Payment = Balance / Months',
    inputs: [
      { id: 'balance', label: 'Outstanding Balance', val: 20000, step: 500, min: 100 },
      { id: 'months', label: 'Target Months to Zero', val: 24, step: 1, min: 1, max: 120 },
    ],
    calc: (v, curr) => {
      const m = Math.max(1, v.months || 1);
      const b = Math.max(0, v.balance || 0);
      return {
        primary: `${formatCurrency(b / m, curr)} /mo`,
        details: [
          { label: 'Total Debt Retired', val: formatCurrency(b, curr) },
          { label: 'Target Payoff Time', val: `${m} months (${(m / 12).toFixed(1)} yrs)` },
        ],
      };
    },
  },
  {
    id: 'retirement',
    name: 'Retirement Nest Egg Projector',
    category: 'Financial',
    desc: 'Forecast nest egg wealth accumulated by your targeted retirement age.',
    formulaExplanation: 'FV = PV(1+r)^n + PMT [ ((1+r)^n - 1) / r ]',
    inputs: [
      { id: 'age', label: 'Current Age', val: 30, step: 1, min: 18, max: 80 },
      { id: 'retireAge', label: 'Desired Retirement Age', val: 65, step: 1, min: 30, max: 90 },
      { id: 'current', label: 'Existing Savings Balance', val: 25000, step: 1000, min: 0 },
      { id: 'monthly', label: 'Monthly Future Savings', val: 500, step: 50, min: 0 },
      { id: 'roi', label: 'Annual Portfolio Return (%)', val: 7, step: 0.25, min: 0, max: 20 },
    ],
    calc: (v, curr) => {
      const years = Math.min(80, Math.max(0, (v.retireAge || 0) - (v.age || 0)));
      const n = years * 12;
      const r = Math.max(0, (v.roi || 0) / 100) / 12;
      const curSave = Math.max(0, v.current || 0);
      const monthly = Math.max(0, v.monthly || 0);
      let future = curSave * Math.pow(1 + r, n);
      if (r > 0) future += monthly * ((Math.pow(1 + r, n) - 1) / r);
      else future += monthly * n;
      const totalContributed = curSave + monthly * n;
      return {
        primary: formatCurrency(future, curr),
        details: [
          { label: 'Accumulation Timeframe', val: `${years} Years (${n} Months)` },
          { label: 'Total Self-Contributed', val: formatCurrency(totalContributed, curr) },
          { label: 'Pure Investment Growth', val: formatCurrency(Math.max(0, future - totalContributed), curr) },
          { label: 'Safe 4% Annual Drawdown', val: `${formatCurrency(future * 0.04, curr)} /yr` },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Contributed Capital', 'Compound Wealth'],
          data: [totalContributed, Math.max(0, future - totalContributed)],
        },
      };
    },
  },
  {
    id: 'amortization',
    name: 'Amortization Schedule Analyzer',
    category: 'Financial',
    desc: 'Analyze full amortization breakdown between interest and principal over time.',
    formulaExplanation: 'Detailed yearly amortization timeline',
    inputs: [
      { id: 'p', label: 'Loan Principal', val: 200000, step: 5000, min: 5000 },
      { id: 'r', label: 'Annual Rate (%)', val: 6, step: 0.1, min: 0.1, max: 20 },
      { id: 'years', label: 'Loan Duration (Years)', val: 15, step: 1, min: 1, max: 40 },
    ],
    calc: (v, curr) => {
      const p = Math.max(0, v.p || 0);
      const r = Math.max(0, (v.r || 0) / 100) / 12;
      const n = Math.max(1, Math.min(50, v.years || 1) * 12);
      const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPaid = emi * n;
      const totalInterest = Math.max(0, totalPaid - p);
      return {
        primary: `${formatCurrency(emi, curr)} /mo`,
        details: [
          { label: 'Total Lifetime Interest', val: formatCurrency(totalInterest, curr) },
          { label: 'Total Repayment', val: formatCurrency(totalPaid, curr) },
        ],
        schedule: generateLoanSchedule(p, r, n, emi, curr),
      };
    },
  },
  {
    id: 'investment',
    name: 'Annual Investment Growth',
    category: 'Financial',
    desc: 'Forecast long-range portfolio wealth with annual contributions.',
    formulaExplanation: 'Compound growth formula with annuity end-of-year compounding',
    inputs: [
      { id: 'start', label: 'Starting Principal', val: 10000, step: 500, min: 0 },
      { id: 'contrib', label: 'Annual Contribution', val: 6000, step: 250, min: 0 },
      { id: 'rate', label: 'Expected Annual Return (%)', val: 8, step: 0.5, min: 0, max: 30 },
      { id: 'years', label: 'Horizon (Years)', val: 10, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const P = Math.max(0, v.start || 0);
      const PMT = Math.max(0, v.contrib || 0);
      const r = Math.max(0, (v.rate || 0) / 100);
      const t = Math.min(100, Math.max(0, Math.floor(v.years || 0)));
      const total = r === 0 ? P + PMT * t : P * Math.pow(1 + r, t) + PMT * ((Math.pow(1 + r, t) - 1) / r) * (1 + r);
      const totalContributed = P + PMT * t;
      return {
        primary: formatCurrency(total, curr),
        details: [
          { label: 'Total Capital Deposited', val: formatCurrency(totalContributed, curr) },
          { label: 'Compounded Capital Growth', val: formatCurrency(Math.max(0, total - totalContributed), curr) },
        ],
      };
    },
  },
  {
    id: 'inflation',
    name: 'Inflation & Purchasing Power',
    category: 'Financial',
    desc: 'Measure purchasing power decay of money over time due to inflation.',
    formulaExplanation: 'Future Cost = PV * (1 + i)^t | Equivalent Value = PV / (1 + i)^t',
    inputs: [
      { id: 'amount', label: 'Current Monetary Amount', val: 1000, step: 50, min: 1 },
      { id: 'rate', label: 'Average Annual Inflation (%)', val: 3.2, step: 0.1, min: 0, max: 50 },
      { id: 'years', label: 'Years Forward', val: 10, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const amt = Math.max(0, v.amount || 0);
      const r = Math.max(0, (v.rate || 0) / 100);
      const y = Math.min(100, Math.max(0, v.years || 0));
      const factor = Math.pow(1 + r, y);
      const futureCost = amt * factor;
      const todayEquivalent = factor > 0 ? amt / factor : 0;
      return {
        primary: formatCurrency(futureCost, curr),
        details: [
          { label: `Future Cost for same goods in ${y}y`, val: formatCurrency(futureCost, curr) },
          { label: `Today's Equivalent Purchasing Power`, val: formatCurrency(todayEquivalent, curr) },
          { label: 'Purchasing Power Loss', val: `-${formatNumber(((amt - todayEquivalent) / amt) * 100, 1)}%` },
        ],
      };
    },
  },
  {
    id: 'finance',
    name: 'Time Value of Money (TVM)',
    category: 'Financial',
    desc: 'Calculate Future Value (FV) using discrete compounding interest periods.',
    formulaExplanation: 'FV = PV * (1 + r)^n',
    inputs: [
      { id: 'pv', label: 'Present Value (PV)', val: 5000, step: 250, min: 0 },
      { id: 'rate', label: 'Annual Discount/Yield (%)', val: 7, step: 0.25, min: 0, max: 50 },
      { id: 'periods', label: 'Time Horizon (Years)', val: 5, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const pv = Math.max(0, v.pv || 0);
      const r = Math.max(0, (v.rate || 0) / 100);
      const p = Math.min(100, Math.max(0, v.periods || 0));
      const fv = pv * Math.pow(1 + r, p);
      return {
        primary: formatCurrency(fv, curr),
        details: [
          { label: 'Initial Principal (PV)', val: formatCurrency(pv, curr) },
          { label: 'Total Value Accretion', val: formatCurrency(Math.max(0, fv - pv), curr) },
        ],
      };
    },
  },
  {
    id: 'incometax',
    name: 'Effective Income Tax',
    category: 'Financial',
    desc: 'Calculate estimated take-home pay based on effective tax rate brackets.',
    formulaExplanation: 'Net = Gross - (Gross * Effective Tax %)',
    inputs: [
      { id: 'income', label: 'Gross Annual Income', val: 75000, step: 1000, min: 0 },
      { id: 'rate', label: 'Effective Tax Rate (%)', val: 18, step: 0.5, min: 0, max: 60 },
    ],
    calc: (v, curr) => {
      const inc = Math.max(0, v.income || 0);
      const rate = Math.min(100, Math.max(0, v.rate || 0));
      const tax = inc * (rate / 100);
      const net = Math.max(0, inc - tax);
      return {
        primary: `${formatCurrency(net, curr)} Net`,
        details: [
          { label: 'Estimated Annual Tax Liability', val: formatCurrency(tax, curr) },
          { label: 'Monthly Take-Home Pay', val: formatCurrency(net / 12, curr) },
          { label: 'Bi-Weekly Paycheck Take-Home', val: formatCurrency(net / 26, curr) },
        ],
      };
    },
  },
  {
    id: 'compound',
    name: 'Compound Interest Calculator',
    category: 'Financial',
    desc: 'Calculate exponential wealth compounding with monthly recurring additions.',
    formulaExplanation: 'A = P(1 + r/n)^(nt) + PMT * [ ((1 + r/n)^(nt) - 1) / (r/n) ]',
    inputs: [
      { id: 'principal', label: 'Initial Principal Deposit', val: 5000, step: 250, min: 0 },
      { id: 'monthly', label: 'Monthly Contribution', val: 200, step: 25, min: 0 },
      { id: 'rate', label: 'Annual Interest Rate (%)', val: 8, step: 0.25, min: 0, max: 30 },
      { id: 'years', label: 'Investment Horizon (Years)', val: 10, step: 1, min: 1, max: 50 },
    ],
    calc: (v, curr) => {
      const P = Math.max(0, v.principal || 0);
      const PMT = Math.max(0, v.monthly || 0);
      const r = Math.max(0, (v.rate || 0) / 100) / 12;
      const t = Math.min(1200, Math.max(0, (v.years || 0) * 12));
      const fv = r === 0 ? P + PMT * t : P * Math.pow(1 + r, t) + PMT * ((Math.pow(1 + r, t) - 1) / r);
      const totalDeposited = P + PMT * t;
      return {
        primary: formatCurrency(fv, curr),
        details: [
          { label: 'Total Personal Deposits', val: formatCurrency(totalDeposited, curr) },
          { label: 'Compound Interest Earned', val: formatCurrency(Math.max(0, fv - totalDeposited), curr) },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Total Deposits', 'Compound Interest'],
          data: [totalDeposited, Math.max(0, fv - totalDeposited)],
        },
      };
    },
  },
  {
    id: 'salary',
    name: 'Salary & Hourly Converter',
    category: 'Financial',
    desc: 'Seamlessly convert hourly pay into annual, monthly, and bi-weekly salaries.',
    formulaExplanation: 'Annual = Hourly * Hours/Week * 52 Weeks',
    inputs: [
      { id: 'hourly', label: 'Hourly Pay Rate', val: 35, step: 0.5, min: 0 },
      { id: 'hours', label: 'Hours Worked per Week', val: 40, step: 1, min: 1, max: 100 },
    ],
    calc: (v, curr) => {
      const wage = Math.max(0, v.hourly || 0);
      const hrs = Math.min(168, Math.max(0, v.hours || 0));
      const annual = wage * hrs * 52;
      return {
        primary: `${formatCurrency(annual, curr)} /yr`,
        details: [
          { label: 'Monthly Equivalent', val: formatCurrency(annual / 12, curr) },
          { label: 'Bi-Weekly Paycheck', val: formatCurrency(annual / 26, curr) },
          { label: 'Weekly Gross Pay', val: formatCurrency(annual / 52, curr) },
        ],
      };
    },
  },
  {
    id: 'interestrate',
    name: 'Implied Simple Loan Rate',
    category: 'Financial',
    desc: 'Calculate the nominal simple annual interest rate given total payments.',
    formulaExplanation: 'Rate = ((Total Repaid - Principal) / (Principal * Years)) * 100',
    inputs: [
      { id: 'principal', label: 'Principal Borrowed', val: 10000, step: 250, min: 100 },
      { id: 'totalPaid', label: 'Total Sum Repaid', val: 12000, step: 250, min: 100 },
      { id: 'years', label: 'Duration (Years)', val: 2, step: 0.5, min: 0.1, max: 30 },
    ],
    calc: (v, curr) => {
      const p = Math.max(0, v.principal || 0);
      const tp = Math.max(0, v.totalPaid || 0);
      const y = Math.max(0.1, v.years || 1);
      const rate = p > 0 ? ((tp - p) / (p * y)) * 100 : 0;
      return {
        primary: `${formatNumber(Math.max(0, rate), 2)}% Annual`,
        details: [
          { label: 'Total Financing Charge', val: formatCurrency(Math.max(0, tp - p), curr) },
          { label: 'Annual Financing Cost', val: formatCurrency(Math.max(0, (tp - p) / y), curr) },
        ],
      };
    },
  },
  {
    id: 'salestax',
    name: 'Sales Tax & VAT Calculator',
    category: 'Financial',
    desc: 'Calculate total purchase cost including statutory sales tax or VAT.',
    formulaExplanation: 'Total = Net Price * (1 + Tax Rate / 100)',
    inputs: [
      { id: 'net', label: 'Net Item Price', val: 129.99, step: 1, min: 0 },
      { id: 'tax', label: 'Sales Tax / VAT Rate (%)', val: 8.25, step: 0.25, min: 0, max: 50 },
    ],
    calc: (v, curr) => {
      const net = Math.max(0, v.net || 0);
      const taxRate = Math.max(0, v.tax || 0);
      const taxAmt = net * (taxRate / 100);
      return {
        primary: formatCurrency(net + taxAmt, curr),
        details: [
          { label: 'Net Pre-Tax Subtotal', val: formatCurrency(net, curr) },
          { label: 'Sales Tax / VAT Added', val: formatCurrency(taxAmt, curr) },
        ],
      };
    },
  },

  // ================= 2. FITNESS & HEALTH (13) =================
  {
    id: 'water',
    name: 'Hydration Intake Calculator',
    category: 'Fitness & Health',
    desc: 'Personalized daily fluid requirement based on body weight, exercise, and climate.',
    formulaExplanation: 'Liters = (Weight_kg * 0.033) + (Exercise_min / 30 * 0.35) + Climate Bonus',
    inputs: [
      { id: 'weight', label: 'Body Weight (kg)', val: 75, step: 1, min: 20, max: 250 },
      { id: 'workout', label: 'Daily Exercise (Minutes)', val: 45, step: 5, min: 0, max: 240 },
      { id: 'temp', label: 'Hot / Humid Environment (1 = Yes, 0 = No)', val: 0, step: 1, min: 0, max: 1 },
    ],
    calc: (v) => {
      const w = Math.max(20, v.weight || 0);
      let liters = w * 0.033 + (Math.max(0, v.workout || 0) / 30) * 0.35;
      if (v.temp) liters += 0.5;
      return {
        primary: `${formatNumber(liters, 2)} Liters /day`,
        details: [
          { label: 'US Fluid Ounces', val: `${formatNumber(liters * 33.814, 0)} fl oz` },
          { label: 'Standard 250ml Glasses', val: `${Math.round(liters / 0.25)} glasses` },
        ],
      };
    },
  },
  {
    id: 'macros',
    name: 'Macronutrient Split',
    category: 'Fitness & Health',
    desc: 'Target gram split for Protein, Carbohydrates, and Fats based on calorie goals.',
    formulaExplanation: 'Protein & Carbs: 4 kcal/g | Fats: 9 kcal/g',
    inputs: [
      { id: 'calories', label: 'Target Daily Calories (kcal)', val: 2200, step: 50, min: 800, max: 8000 },
      { id: 'proteinPct', label: 'Protein Ratio (%)', val: 30, step: 5, min: 10, max: 60 },
      { id: 'fatPct', label: 'Fat Ratio (%)', val: 30, step: 5, min: 10, max: 60 },
    ],
    calc: (v) => {
      const cal = Math.max(500, v.calories || 2000);
      const pPct = Math.min(60, Math.max(10, v.proteinPct || 30));
      const fPct = Math.min(60, Math.max(10, v.fatPct || 30));
      const cPct = Math.max(0, 100 - pPct - fPct);
      const pGrams = Math.round((cal * (pPct / 100)) / 4);
      const cGrams = Math.round((cal * (cPct / 100)) / 4);
      const fGrams = Math.round((cal * (fPct / 100)) / 9);
      return {
        primary: `${pGrams}g P · ${cGrams}g C · ${fGrams}g F`,
        details: [
          { label: 'Protein Grams (4 kcal/g)', val: `${pGrams}g (${pPct}%)` },
          { label: 'Carb Grams (4 kcal/g)', val: `${cGrams}g (${cPct}%)` },
          { label: 'Fat Grams (9 kcal/g)', val: `${fGrams}g (${fPct}%)` },
        ],
        chart: {
          type: 'doughnut',
          labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
          data: [pGrams * 4, cGrams * 4, fGrams * 9],
        },
      };
    },
  },
  {
    id: 'onerepmax',
    name: 'One Rep Max (1RM) Estimator',
    category: 'Fitness & Health',
    desc: 'Estimate maximal strength benchmark using the Epley and Brzycki equations.',
    formulaExplanation: 'Average of Epley: W*(1 + r/30) and Brzycki: W*(36/(37-r))',
    inputs: [
      { id: 'weight', label: 'Weight Lifted (kg or lbs)', val: 100, step: 2.5, min: 1 },
      { id: 'reps', label: 'Reps Completed (1 - 15)', val: 5, step: 1, min: 1, max: 15 },
    ],
    calc: (v) => {
      const w = Math.max(1, v.weight || 0);
      const r = Math.min(15, Math.max(1, v.reps || 1));
      if (r === 1) {
        return {
          primary: `${w} (Direct 1RM)`,
          details: [
            { label: '90% Working Set (3-4 Reps)', val: formatNumber(w * 0.9, 1) },
            { label: '80% Hypertrophy (7-8 Reps)', val: formatNumber(w * 0.8, 1) },
            { label: '70% Endurance (10-12 Reps)', val: formatNumber(w * 0.7, 1) },
          ],
        };
      }
      const epley = w * (1 + r / 30);
      const brzycki = w * (36 / (37 - r));
      const avg1rm = (epley + brzycki) / 2;
      return {
        primary: `${formatNumber(avg1rm, 1)} Estimated 1RM`,
        details: [
          { label: 'Epley Formula', val: formatNumber(epley, 1) },
          { label: 'Brzycki Formula', val: formatNumber(brzycki, 1) },
          { label: '90% 1RM (Heavy Triple)', val: formatNumber(avg1rm * 0.9, 1) },
          { label: '80% 1RM (Working Sets)', val: formatNumber(avg1rm * 0.8, 1) },
        ],
      };
    },
  },
  {
    id: 'heartrate',
    name: 'Cardiovascular Heart Rate Zones',
    category: 'Fitness & Health',
    desc: 'Target aerobic and anaerobic training zones via Karvonen Heart Rate Reserve.',
    formulaExplanation: 'Target HR = RHR + (Max HR - RHR) * Zone%',
    inputs: [
      { id: 'age', label: 'Age (Years)', val: 32, step: 1, min: 10, max: 95 },
      { id: 'rhr', label: 'Resting Heart Rate (BPM)', val: 65, step: 1, min: 40, max: 120 },
    ],
    calc: (v) => {
      const age = Math.min(100, Math.max(10, v.age || 30));
      const rhr = Math.min(120, Math.max(40, v.rhr || 60));
      const maxHr = 220 - age;
      const hrr = maxHr - rhr;
      const z2Low = Math.round(rhr + hrr * 0.6);
      const z2High = Math.round(rhr + hrr * 0.7);
      return {
        primary: `Zone 2: ${z2Low} - ${z2High} BPM`,
        details: [
          { label: 'Estimated Max HR', val: `${maxHr} BPM` },
          { label: 'Zone 1 (Recovery, 50-60%)', val: `${Math.round(rhr + hrr * 0.5)} - ${z2Low} BPM` },
          { label: 'Zone 2 (Aerobic Base, 60-70%)', val: `${z2Low} - ${z2High} BPM` },
          { label: 'Zone 3 (Tempo, 70-80%)', val: `${z2High} - ${Math.round(rhr + hrr * 0.8)} BPM` },
          { label: 'Zone 4 (Threshold, 80-90%)', val: `${Math.round(rhr + hrr * 0.8)} - ${Math.round(rhr + hrr * 0.9)} BPM` },
        ],
      };
    },
  },
  {
    id: 'bmi',
    name: 'Body Mass Index (BMI)',
    category: 'Fitness & Health',
    desc: 'Assess body weight classification using standard World Health Organization categories.',
    formulaExplanation: 'BMI = Weight (kg) / Height (m)^2',
    inputs: [
      { id: 'weight', label: 'Weight (kg)', val: 72, step: 0.5, min: 20, max: 300 },
      { id: 'height', label: 'Height (cm)', val: 178, step: 1, min: 50, max: 250 },
    ],
    calc: (v) => {
      const hm = Math.max(0.3, (v.height || 0) / 100);
      const w = Math.max(0, v.weight || 0);
      const bmi = hm > 0 ? w / (hm * hm) : 0;
      let cat = 'Normal weight (18.5 - 24.9)';
      if (bmi < 18.5) cat = 'Underweight (< 18.5)';
      else if (bmi >= 25 && bmi < 29.9) cat = 'Overweight (25.0 - 29.9)';
      else if (bmi >= 30) cat = 'Obese (≥ 30.0)';
      return {
        primary: `${formatNumber(bmi, 1)} BMI`,
        details: [
          { label: 'WHO Classification', val: cat },
          { label: 'Normal Weight Range for Height', val: `${formatNumber(18.5 * hm * hm, 1)} - ${formatNumber(24.9 * hm * hm, 1)} kg` },
        ],
      };
    },
  },
  {
    id: 'calorie',
    name: 'Caloric Expenditure (TDEE)',
    category: 'Fitness & Health',
    desc: 'Estimate Total Daily Energy Expenditure using the clinical Mifflin-St Jeor formula.',
    formulaExplanation: 'BMR: 10W + 6.25H - 5A + S | TDEE = BMR * Activity Factor',
    inputs: [
      { id: 'weight', label: 'Weight (kg)', val: 75, step: 0.5, min: 20, max: 250 },
      { id: 'height', label: 'Height (cm)', val: 175, step: 1, min: 80, max: 250 },
      { id: 'age', label: 'Age (Years)', val: 28, step: 1, min: 10, max: 100 },
      { id: 'isFemale', label: 'Gender (0 = Male, 1 = Female)', val: 0, step: 1, min: 0, max: 1 },
      { id: 'mult', label: 'Activity Level (1.2 Sedentary to 1.725 Heavy)', val: 1.4, step: 0.05, min: 1.1, max: 2.0 },
    ],
    calc: (v) => {
      const w = Math.max(10, v.weight || 0);
      const h = Math.max(50, v.height || 0);
      const a = Math.max(1, v.age || 0);
      const bmr = 10 * w + 6.25 * h - 5 * a + (v.isFemale ? -161 : 5);
      const tdee = bmr * (v.mult || 1.2);
      return {
        primary: `${formatNumber(tdee, 0)} kcal /day`,
        details: [
          { label: 'Basal Metabolic Rate (BMR)', val: `${formatNumber(bmr, 0)} kcal` },
          { label: 'Mild Fat Loss Target (-15%)', val: `${formatNumber(tdee * 0.85, 0)} kcal` },
          { label: 'Moderate Fat Loss (-20%)', val: `${formatNumber(tdee * 0.8, 0)} kcal` },
          { label: 'Lean Bulking (+10%)', val: `${formatNumber(tdee * 1.1, 0)} kcal` },
        ],
      };
    },
  },
  {
    id: 'bodyfat',
    name: 'Body Fat % (US Navy Method)',
    category: 'Fitness & Health',
    desc: 'Anthropometric body fat estimation using standard tape measurement circumferences.',
    formulaExplanation: 'US Navy Body Fat Regression based on waist, neck, and height circumferences',
    inputs: [
      { id: 'isFemale', label: 'Gender (0 = Male, 1 = Female)', val: 0, step: 1, min: 0, max: 1 },
      { id: 'height', label: 'Height (cm)', val: 178, step: 1, min: 100, max: 240 },
      { id: 'neck', label: 'Neck Circumference (cm)', val: 38, step: 0.5, min: 20, max: 60 },
      { id: 'waist', label: 'Waist Circumference (cm)', val: 84, step: 0.5, min: 40, max: 160 },
      { id: 'hip', label: 'Hip Circumference (Females Only, cm)', val: 95, step: 0.5, min: 50, max: 180 },
    ],
    calc: (v) => {
      const h = Math.max(50, v.height || 170);
      const neck = Math.max(10, v.neck || 35);
      let bf = v.isFemale
        ? 495 / (1.29579 - 0.35004 * Math.log10(Math.max(1.0, (v.waist || 75) + (v.hip || 90) - neck)) + 0.221 * Math.log10(h)) - 450
        : 495 / (1.0324 - 0.19077 * Math.log10(Math.max(0.5, (v.waist || 80) - neck)) + 0.15456 * Math.log10(h)) - 450;
      bf = Math.min(65, Math.max(3, bf));
      return {
        primary: `${formatNumber(bf, 1)}% Body Fat`,
        details: [
          { label: 'Calculation Model', val: 'US Navy Circumference' },
          { label: 'Category', val: bf < 14 ? 'Athletic / Lean' : bf < 22 ? 'Fitness / Average' : 'Above Average' },
        ],
      };
    },
  },
  {
    id: 'bmr',
    name: 'Basal Metabolic Rate (BMR)',
    category: 'Fitness & Health',
    desc: 'Calories burned daily at complete biological and metabolic rest.',
    formulaExplanation: 'Mifflin-St Jeor: 10 * kg + 6.25 * cm - 5 * age + s',
    inputs: [
      { id: 'w', label: 'Body Weight (kg)', val: 70, step: 0.5, min: 20, max: 250 },
      { id: 'h', label: 'Height (cm)', val: 170, step: 1, min: 60, max: 240 },
      { id: 'a', label: 'Age (Years)', val: 30, step: 1, min: 10, max: 100 },
      { id: 'isFemale', label: 'Gender (0 = Male, 1 = Female)', val: 0, step: 1, min: 0, max: 1 },
    ],
    calc: (v) => {
      const bmr = 10 * Math.max(0, v.w || 0) + 6.25 * Math.max(0, v.h || 0) - 5 * Math.max(0, v.a || 0) + (v.isFemale ? -161 : 5);
      return {
        primary: `${formatNumber(Math.max(0, bmr), 0)} kcal /day`,
        details: [
          { label: 'Hourly Resting Burn', val: `${formatNumber(bmr / 24, 1)} kcal /hr` },
          { label: 'Weekly Base Expenditure', val: `${formatNumber(bmr * 7, 0)} kcal` },
        ],
      };
    },
  },
  {
    id: 'idealweight',
    name: 'Ideal Body Weight (Devine Formula)',
    category: 'Fitness & Health',
    desc: 'Clinical target body mass according to the standardized Devine formula.',
    formulaExplanation: 'Devine: Men: 50kg + 2.3kg/inch over 5ft | Women: 45.5kg + 2.3kg/inch',
    inputs: [
      { id: 'height', label: 'Height (cm)', val: 175, step: 1, min: 120, max: 240 },
      { id: 'isFemale', label: 'Gender (0 = Male, 1 = Female)', val: 0, step: 1, min: 0, max: 1 },
    ],
    calc: (v) => {
      const inches = Math.max(0, (v.height || 0) / 2.54 - 60);
      const base = v.isFemale ? 45.5 : 50.0;
      const devine = base + 2.3 * inches;
      return {
        primary: `${formatNumber(devine, 1)} kg`,
        details: [
          { label: 'Imperial Equivalent', val: `${formatNumber(devine * 2.20462, 1)} lbs` },
          { label: 'Clinical Model', val: 'Devine 1974 Formula' },
        ],
      };
    },
  },
  {
    id: 'pace',
    name: 'Running Pace & Speed',
    category: 'Fitness & Health',
    desc: 'Calculate split pace per kilometer and average kilometers per hour.',
    formulaExplanation: 'Pace = Time / Distance',
    inputs: [
      { id: 'dist', label: 'Distance (km)', val: 10, step: 0.5, min: 0.1, max: 100 },
      { id: 'mins', label: 'Elapsed Time (Minutes)', val: 52, step: 1, min: 1, max: 1000 },
    ],
    calc: (v) => {
      const d = Math.max(0.01, v.dist || 0);
      const mTotal = Math.max(0, v.mins || 0);
      const paceDec = mTotal / d;
      const paceMins = Math.floor(paceDec);
      const paceSecs = Math.round((paceDec % 1) * 60).toString().padStart(2, '0');
      const kmh = d / (mTotal / 60);
      return {
        primary: `${paceMins}:${paceSecs} /km`,
        details: [
          { label: 'Average Velocity', val: `${formatNumber(kmh, 2)} km/h` },
          { label: 'Mile Pace Equivalent', val: `${Math.floor(paceDec * 1.60934)}:${Math.round(((paceDec * 1.60934) % 1) * 60).toString().padStart(2, '0')} /mi` },
        ],
      };
    },
  },
  {
    id: 'pregnancy',
    name: 'Pregnancy Gestational Age',
    category: 'Fitness & Health',
    desc: 'Calculate current gestational trimester and remaining developmental weeks.',
    formulaExplanation: 'Trimester classification from Last Menstrual Period',
    inputs: [
      { id: 'weeks', label: 'Gestational Weeks Elapsed', val: 14, step: 1, min: 1, max: 42 },
    ],
    calc: (v) => {
      const w = Math.min(42, Math.max(0, v.weeks || 0));
      const trim = w < 13 ? 'First Trimester (Weeks 1-12)' : w < 27 ? 'Second Trimester (Weeks 13-26)' : 'Third Trimester (Weeks 27-40+)';
      return {
        primary: `${w} Weeks Gestation`,
        details: [
          { label: 'Current Trimester', val: trim },
          { label: 'Weeks Remaining to Term', val: `${Math.max(0, 40 - w)} weeks` },
        ],
      };
    },
  },
  {
    id: 'pregnancyconception',
    name: 'Ovulation & Conception Window',
    category: 'Fitness & Health',
    desc: 'Calculate estimated fertile window and cycle ovulation point.',
    formulaExplanation: 'Ovulation ≈ Cycle Length - 14 Days',
    inputs: [
      { id: 'cycle', label: 'Average Menstrual Cycle Length (Days)', val: 28, step: 1, min: 20, max: 45 },
    ],
    calc: (v) => {
      const cycle = Math.min(45, Math.max(20, v.cycle || 28));
      const o = Math.max(1, cycle - 14);
      return {
        primary: `Cycle Day ${o}`,
        details: [
          { label: 'Fertile Window Span', val: `Days ${Math.max(1, o - 5)} through Day ${o}` },
          { label: 'Luteal Phase Duration', val: '14 Days Standard' },
        ],
      };
    },
  },
  {
    id: 'duedate',
    name: "Due Date (Naegele's Rule)",
    category: 'Fitness & Health',
    desc: 'Estimate expected date of delivery based on standard 280-day human gestation.',
    formulaExplanation: "Naegele's Rule: 280 days from Last Menstrual Period",
    inputs: [
      { id: 'daysAgo', label: 'Days Elapsed Since LMP', val: 45, step: 1, min: 0, max: 300 },
    ],
    calc: (v) => {
      const rem = Math.max(0, 280 - (v.daysAgo || 0));
      const target = new Date();
      target.setDate(target.getDate() + rem);
      return {
        primary: target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        details: [
          { label: 'Days Remaining to Full Term', val: `${rem} days` },
          { label: 'Standard Gestation Model', val: '280 Days (40 Weeks)' },
        ],
      };
    },
  },

  // ================= 3. MATH (8) =================
  {
    id: 'percentage',
    name: 'Percentage & Proportions',
    category: 'Math',
    desc: 'Calculate percentages, absolute proportions, and fractional ratios.',
    formulaExplanation: 'Result = (Percentage / 100) * Total',
    inputs: [
      { id: 'pct', label: 'Percentage (%)', val: 20, step: 0.5 },
      { id: 'total', label: 'Base Amount', val: 350, step: 1 },
    ],
    calc: (v) => {
      const res = ((v.pct || 0) / 100) * (v.total || 0);
      return {
        primary: formatNumber(res, 2),
        details: [
          { label: 'Portion Value', val: formatNumber(res, 2) },
          { label: 'Remaining Balance (100% - Pct)', val: formatNumber((v.total || 0) - res, 2) },
        ],
      };
    },
  },
  {
    id: 'fraction',
    name: 'Fraction Simplifier & Arithmetic',
    category: 'Math',
    desc: 'Add two fractions and simplify the resulting fraction to lowest common terms.',
    formulaExplanation: 'a/b + c/d = (ad + bc) / bd -> reduced via GCD',
    inputs: [
      { id: 'n1', label: 'Numerator 1', val: 1, step: 1 },
      { id: 'd1', label: 'Denominator 1', val: 3, step: 1, min: 1 },
      { id: 'n2', label: 'Numerator 2', val: 1, step: 1 },
      { id: 'd2', label: 'Denominator 2', val: 6, step: 1, min: 1 },
    ],
    calc: (v) => {
      const d1 = v.d1 || 1;
      const d2 = v.d2 || 1;
      const n = (v.n1 || 0) * d2 + (v.n2 || 0) * d1;
      const d = d1 * d2;
      const div = gcd(n, d);
      return {
        primary: `${n / div} / ${d / div}`,
        details: [
          { label: 'Simplified Lowest Terms', val: `${n / div} / ${d / div}` },
          { label: 'Decimal Approximation', val: formatNumber(n / d, 4) },
        ],
      };
    },
  },
  {
    id: 'scientific',
    name: 'Scientific Trigonometry & Logarithms',
    category: 'Math',
    desc: 'Trigonometric functions, natural logarithms, and square root operations.',
    formulaExplanation: 'Standard IEEE 754 floating point trigonometric algorithms',
    inputs: [
      { id: 'val', label: 'Angle / Value (Degrees)', val: 45, step: 1 },
    ],
    calc: (v) => {
      const rad = ((v.val || 0) * Math.PI) / 180;
      return {
        primary: `sin(${v.val}°) = ${formatNumber(Math.sin(rad), 4)}`,
        details: [
          { label: `cos(${v.val}°)`, val: formatNumber(Math.cos(rad), 4) },
          { label: `tan(${v.val}°)`, val: Math.abs(Math.cos(rad)) < 0.0001 ? 'Undefined' : formatNumber(Math.tan(rad), 4) },
          { label: `Square Root √(${v.val})`, val: (v.val || 0) < 0 ? 'Imaginary' : formatNumber(Math.sqrt(Math.max(0, v.val || 0)), 4) },
        ],
      };
    },
  },
  {
    id: 'triangle',
    name: 'Right Triangle Solver',
    category: 'Math',
    desc: 'Calculate hypotenuse, perimeter, and area via the Pythagorean Theorem.',
    formulaExplanation: 'c = √(a^2 + b^2) | Area = (a * b) / 2',
    inputs: [
      { id: 'base', label: 'Leg A (Base)', val: 6, step: 0.5, min: 0.1 },
      { id: 'height', label: 'Leg B (Height)', val: 8, step: 0.5, min: 0.1 },
    ],
    calc: (v) => {
      const b = Math.max(0, v.base || 0);
      const h = Math.max(0, v.height || 0);
      const hyp = Math.sqrt(b * b + h * h);
      return {
        primary: `Hypotenuse: ${formatNumber(hyp, 2)}`,
        details: [
          { label: 'Total Area', val: formatNumber(0.5 * b * h, 2) },
          { label: 'Perimeter (a + b + c)', val: formatNumber(b + h + hyp, 2) },
        ],
      };
    },
  },
  {
    id: 'standarddeviation',
    name: 'Standard Deviation (Sample & Pop)',
    category: 'Math',
    desc: 'Calculate both Sample (s) and Population (σ) statistical standard deviations.',
    formulaExplanation: 'Sample: √[ Σ(x - μ)^2 / (N - 1) ] | Pop: √[ Σ(x - μ)^2 / N ]',
    inputs: [
      { id: 'a', label: 'Sample Point 1', val: 10, step: 1 },
      { id: 'b', label: 'Sample Point 2', val: 12, step: 1 },
      { id: 'c', label: 'Sample Point 3', val: 23, step: 1 },
      { id: 'd', label: 'Sample Point 4', val: 25, step: 1 },
    ],
    calc: (v) => {
      const arr = [v.a || 0, v.b || 0, v.c || 0, v.d || 0];
      const mean = arr.reduce((acc, c) => acc + c, 0) / arr.length;
      const sumSq = arr.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0);
      const sampleSd = Math.sqrt(sumSq / (arr.length - 1));
      const popSd = Math.sqrt(sumSq / arr.length);
      return {
        primary: `s = ${formatNumber(sampleSd, 2)}`,
        details: [
          { label: 'Sample Mean (μ)', val: formatNumber(mean, 2) },
          { label: 'Population Std Dev (σ)', val: formatNumber(popSd, 2) },
          { label: 'Sample Variance (s²)', val: formatNumber(sampleSd * sampleSd, 2) },
        ],
      };
    },
  },
  {
    id: 'random',
    name: 'Cryptographic Random Number',
    category: 'Math',
    desc: 'Generate hardware-seeded cryptographically secure integers using Web Crypto.',
    formulaExplanation: 'window.crypto.getRandomValues(new Uint32Array(1))',
    inputs: [
      { id: 'min', label: 'Minimum Bound', val: 1, step: 1 },
      { id: 'max', label: 'Maximum Bound', val: 100, step: 1 },
    ],
    calc: (v) => {
      const min = Math.ceil(Math.min(v.min || 0, v.max || 0));
      const max = Math.floor(Math.max(v.min || 0, v.max || 0));
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      const val = min + (arr[0] % (max - min + 1));
      return {
        primary: `${val}`,
        details: [
          { label: 'Selected Range', val: `${min} to ${max}` },
          { label: 'Entropy Source', val: 'OS CSPRNG (WebCrypto)' },
        ],
      };
    },
  },
  {
    id: 'gpa',
    name: 'GPA Calculator (4.0 Standard)',
    category: 'Math',
    desc: 'Calculate standardized Grade Point Average across coursework.',
    formulaExplanation: 'GPA = Average of Grade Points on 4.0 scale',
    inputs: [
      { id: 'g1', label: 'Course 1 (0.0 - 4.0)', val: 3.7, step: 0.1, min: 0, max: 4.0 },
      { id: 'g2', label: 'Course 2 (0.0 - 4.0)', val: 4.0, step: 0.1, min: 0, max: 4.0 },
      { id: 'g3', label: 'Course 3 (0.0 - 4.0)', val: 3.3, step: 0.1, min: 0, max: 4.0 },
    ],
    calc: (v) => {
      const gpa = ((v.g1 || 0) + (v.g2 || 0) + (v.g3 || 0)) / 3;
      return {
        primary: `${formatNumber(gpa, 2)} GPA`,
        details: [
          { label: 'Academic Standing', val: gpa >= 3.8 ? 'Summa Cum Laude' : gpa >= 3.5 ? 'Magna Cum Laude' : 'Good Standing' },
          { label: 'Grading Scale', val: '4.0 Unweighted' },
        ],
      };
    },
  },
  {
    id: 'grade',
    name: 'Final Exam Target Score',
    category: 'Math',
    desc: 'Calculate exam score needed to achieve your target overall course letter grade.',
    formulaExplanation: 'Required = [ Target - (Current * (1 - Weight)) ] / Weight',
    inputs: [
      { id: 'current', label: 'Current Class Grade (%)', val: 82, step: 0.5, min: 0, max: 100 },
      { id: 'target', label: 'Desired Final Grade (%)', val: 85, step: 0.5, min: 0, max: 100 },
      { id: 'weight', label: 'Final Exam Weight (%)', val: 30, step: 1, min: 1, max: 99 },
    ],
    calc: (v) => {
      const w = Math.min(1.0, Math.max(0.01, (v.weight || 1) / 100));
      const req = ((v.target || 0) - (v.current || 0) * (1 - w)) / w;
      return {
        primary: `${formatNumber(req, 1)}%`,
        details: [
          { label: 'Score Needed on Exam', val: `${formatNumber(req, 1)}%` },
          { label: 'Difficulty Assessment', val: req > 100 ? 'Needs Extra Credit' : req <= 70 ? 'Comfortably Achievable' : 'Moderate Study Needed' },
        ],
      };
    },
  },

  // ================= 4. TECH & ENGINEERING (11) =================
  {
    id: 'baseconverter',
    name: 'Base Converter (Bin / Hex / Dec)',
    category: 'Tech & Engineering',
    desc: 'Convert integer decimal numbers into binary, hexadecimal, and octal notations.',
    formulaExplanation: 'Radix numerical conversion',
    inputs: [
      { id: 'decimalVal', label: 'Decimal Integer', val: 255, step: 1, min: 0 },
    ],
    calc: (v) => {
      const d = Math.max(0, Math.floor(v.decimalVal || 0));
      return {
        primary: `0x${d.toString(16).toUpperCase()}`,
        details: [
          { label: 'Binary (Base 2)', val: d.toString(2) },
          { label: 'Hexadecimal (Base 16)', val: `0x${d.toString(16).toUpperCase()}` },
          { label: 'Octal (Base 8)', val: `0o${d.toString(8)}` },
        ],
      };
    },
  },
  {
    id: 'downloadtime',
    name: 'Bandwidth & Download Duration',
    category: 'Tech & Engineering',
    desc: 'Calculate time required to transfer data payloads across connection bandwidths.',
    formulaExplanation: 'Seconds = (Size in Megabits) / Speed in Mbps',
    inputs: [
      { id: 'fileSizeGB', label: 'File Size (GB)', val: 45, step: 1, min: 0.1 },
      { id: 'speedMbps', label: 'Bandwidth Speed (Mbps)', val: 100, step: 10, min: 1 },
    ],
    calc: (v) => {
      const seconds = (Math.max(0.01, v.fileSizeGB || 1) * 8 * 1000) / Math.max(0.1, v.speedMbps || 1);
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.round(seconds % 60);
      const timeStr = hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
      return {
        primary: timeStr,
        details: [
          { label: 'Effective Transfer Speed', val: `${formatNumber((v.speedMbps || 1) / 8, 2)} MB/s` },
          { label: 'Total Bits Transferred', val: `${formatNumber((v.fileSizeGB || 1) * 8, 0)} Gigabits` },
        ],
      };
    },
  },
  {
    id: 'aspectratio',
    name: 'Display Aspect Ratio & Scaler',
    category: 'Tech & Engineering',
    desc: 'Calculate proportional pixel dimensions preserving aspect ratios.',
    formulaExplanation: 'New Height = (Target Width * Original Height) / Original Width',
    inputs: [
      { id: 'origW', label: 'Original Width (px)', val: 1920, step: 10, min: 1 },
      { id: 'origH', label: 'Original Height (px)', val: 1080, step: 10, min: 1 },
      { id: 'newW', label: 'Target Width (px)', val: 1280, step: 10, min: 1 },
    ],
    calc: (v) => {
      const ow = Math.max(1, v.origW || 1);
      const oh = Math.max(1, v.origH || 1);
      const nw = Math.max(1, v.newW || 1);
      const d = gcd(ow, oh);
      const nh = Math.round((nw * oh) / ow);
      return {
        primary: `${nw} × ${nh} px`,
        details: [
          { label: 'Reduced Aspect Ratio', val: `${ow / d}:${oh / d}` },
          { label: 'Original Dimensions', val: `${ow} × ${oh} px` },
        ],
      };
    },
  },
  {
    id: 'unitconvert',
    name: 'Universal Metric & Imperial Units',
    category: 'Tech & Engineering',
    desc: 'Instant conversion between Metric and Imperial standards for length, mass, and temperature.',
    formulaExplanation: 'Standard SI metric conversion multipliers',
    inputs: [
      { id: 'val', label: 'Input Magnitude', val: 100, step: 1 },
      { id: 'mode', label: 'Mode (1: km->mi, 2: kg->lb, 3: °C->°F)', val: 1, step: 1, min: 1, max: 3 },
    ],
    calc: (v) => {
      const val = v.val || 0;
      if (v.mode === 2) {
        return {
          primary: `${formatNumber(val * 2.20462, 2)} lbs`,
          details: [
            { label: 'Input Mass', val: `${val} Kilograms` },
            { label: 'Ounces Equivalent', val: `${formatNumber(val * 35.274, 1)} oz` },
          ],
        };
      }
      if (v.mode === 3) {
        return {
          primary: `${formatNumber((val * 9) / 5 + 32, 1)} °F`,
          details: [
            { label: 'Celsius Temperature', val: `${val} °C` },
            { label: 'Kelvin Scale', val: `${formatNumber(val + 273.15, 2)} K` },
          ],
        };
      }
      return {
        primary: `${formatNumber(val * 0.621371, 2)} Miles`,
        details: [
          { label: 'Input Distance', val: `${val} Kilometers` },
          { label: 'Feet Equivalent', val: `${formatNumber(val * 3280.84, 0)} ft` },
        ],
      };
    },
  },
  {
    id: 'subnet',
    name: 'IPv4 CIDR Subnet Calculator',
    category: 'Tech & Engineering',
    desc: 'Compute subnet masks, usable host capacities, and RFC 3021 /31 allocations.',
    formulaExplanation: 'Usable Hosts = 2^(32 - Prefix) - 2 (with RFC 3021 /31 exceptions)',
    inputs: [
      { id: 'cidr', label: 'CIDR Prefix (/xx, 1 to 32)', val: 24, step: 1, min: 1, max: 32 },
    ],
    calc: (v) => {
      const prefix = Math.min(32, Math.max(1, Math.round(v.cidr || 24)));
      const usable = prefix === 31 ? 2 : prefix === 32 ? 1 : Math.pow(2, 32 - prefix) - 2;
      const mask = [24, 16, 8, 0].map((s) => (((0xffffffff << (32 - prefix)) >>> 0) >>> s) & 255).join('.');
      return {
        primary: `${formatNumber(usable, 0)} Usable Hosts`,
        details: [
          { label: 'Subnet Mask', val: mask },
          { label: 'Total IP Addresses in Block', val: formatNumber(Math.pow(2, 32 - prefix), 0) },
          { label: 'Wildcard Mask', val: [24, 16, 8, 0].map((s) => ((~((0xffffffff << (32 - prefix)) >>> 0)) >>> s) & 255).join('.') },
        ],
      };
    },
  },
  {
    id: 'password',
    name: 'CSPRNG Password Generator',
    category: 'Tech & Engineering',
    desc: 'Hardware-seeded CSPRNG high-entropy random password generator.',
    formulaExplanation: 'Cryptographically Secure Pseudo-Random Number Generation (CSPRNG)',
    inputs: [
      { id: 'len', label: 'Desired Password Length (8 - 64)', val: 16, step: 1, min: 8, max: 64 },
    ],
    calc: (v) => {
      const len = Math.max(8, Math.min(64, Math.round(v.len) || 16));
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=';
      const buf = new Uint32Array(len);
      window.crypto.getRandomValues(buf);
      let p = '';
      for (let i = 0; i < len; i++) {
        p += chars[buf[i] % chars.length];
      }
      const entropy = Math.round(len * Math.log2(chars.length));
      return {
        primary: p,
        details: [
          { label: 'Password Length', val: `${len} characters` },
          { label: 'Shannon Entropy', val: `${entropy} bits (Very Strong)` },
        ],
      };
    },
  },
  {
    id: 'concrete',
    name: 'Concrete Slab Volume',
    category: 'Tech & Engineering',
    desc: 'Estimate required concrete volume in cubic yards and pre-mix bags.',
    formulaExplanation: 'Cubic Yards = (Length_ft * Width_ft * (Thickness_in / 12)) / 27',
    inputs: [
      { id: 'len', label: 'Length (Feet)', val: 20, step: 0.5, min: 1 },
      { id: 'wid', label: 'Width (Feet)', val: 10, step: 0.5, min: 1 },
      { id: 'thick', label: 'Thickness (Inches)', val: 4, step: 0.5, min: 1 },
    ],
    calc: (v) => {
      const cuYds = (Math.max(0, v.len || 0) * Math.max(0, v.wid || 0) * (Math.max(0, v.thick || 0) / 12)) / 27;
      return {
        primary: `${formatNumber(cuYds, 2)} yd³`,
        details: [
          { label: 'Required 80lb Premix Bags', val: `${Math.ceil(cuYds * 45)} bags` },
          { label: 'Required 60lb Premix Bags', val: `${Math.ceil(cuYds * 60)} bags` },
        ],
      };
    },
  },
  {
    id: 'age',
    name: 'Exact Age & Elapsed Days',
    category: 'Tech & Engineering',
    desc: 'Calculate precise calendar age, total lived days, and milestones.',
    formulaExplanation: 'Difference from birth year to current astronomical year',
    inputs: [
      { id: 'birthYear', label: 'Birth Year', val: 1998, step: 1, min: 1900, max: 2026 },
    ],
    calc: (v) => {
      const currentYear = new Date().getFullYear();
      const age = Math.max(0, currentYear - (v.birthYear || 1998));
      const days = age * 365.2425;
      return {
        primary: `${age} Years Old`,
        details: [
          { label: 'Estimated Elapsed Days', val: `${formatNumber(days, 0)} days` },
          { label: 'Total Hours Lived', val: `${formatNumber(days * 24, 0)} hours` },
        ],
      };
    },
  },
  {
    id: 'date',
    name: 'Calendar Date Offset',
    category: 'Tech & Engineering',
    desc: 'Add or subtract discrete calendar days from the current date.',
    formulaExplanation: 'Target = Current Date + Days Offset',
    inputs: [
      { id: 'days', label: 'Offset Days (+ or -)', val: 45, step: 1 },
    ],
    calc: (v) => {
      const target = new Date();
      target.setDate(target.getDate() + (v.days || 0));
      return {
        primary: target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        details: [
          { label: 'Day of Week', val: target.toLocaleDateString('en-US', { weekday: 'long' }) },
          { label: 'Offset Applied', val: `${(v.days || 0) >= 0 ? '+' : ''}${v.days || 0} days` },
        ],
      };
    },
  },
  {
    id: 'time',
    name: 'Minutes to Hours Formatter',
    category: 'Tech & Engineering',
    desc: 'Convert gross minutes into standard hours, minutes, and decimal hours.',
    formulaExplanation: 'Hours = Math.floor(Minutes / 60) | Remainder = Minutes % 60',
    inputs: [
      { id: 'mins', label: 'Total Minutes', val: 275, step: 5, min: 0 },
    ],
    calc: (v) => {
      const m = Math.max(0, v.mins || 0);
      const hrs = Math.floor(m / 60);
      const rem = Math.round(m % 60);
      return {
        primary: `${hrs}h ${rem}m`,
        details: [
          { label: 'Decimal Hours', val: `${formatNumber(m / 60, 2)} hours` },
          { label: 'Total Seconds', val: `${formatNumber(m * 60, 0)} seconds` },
        ],
      };
    },
  },
  {
    id: 'hours',
    name: 'Billable Timesheet Hours',
    category: 'Tech & Engineering',
    desc: 'Calculate billable working hours subtracting unpaid break periods.',
    formulaExplanation: 'Billable = (End Hour - Start Hour) * 60 - Break Minutes',
    inputs: [
      { id: 'start', label: 'Shift Start Hour (24h Clock)', val: 9, step: 0.5, min: 0, max: 24 },
      { id: 'end', label: 'Shift End Hour (24h Clock)', val: 17, step: 0.5, min: 0, max: 24 },
      { id: 'breakMins', label: 'Unpaid Break (Minutes)', val: 45, step: 5, min: 0, max: 240 },
    ],
    calc: (v) => {
      const totalMins = Math.max(0, ((v.end || 0) - (v.start || 0)) * 60 - (v.breakMins || 0));
      return {
        primary: `${formatNumber(totalMins / 60, 2)} Billable Hours`,
        details: [
          { label: 'Net Billable Minutes', val: `${totalMins} minutes` },
          { label: 'Gross Shift Duration', val: `${formatNumber((v.end || 0) - (v.start || 0), 1)} hours` },
        ],
      };
    },
  },
];

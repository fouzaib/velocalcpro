import { Article } from '../types';

export const articles: Article[] = [
  {
    id: 'mortgage-amortization-secret',
    title: 'The Front-Loaded Interest Trap: How Amortization Works',
    category: 'Finance',
    readTime: '4 min read',
    summary: 'Why up to 80% of your initial monthly mortgage payments go directly toward interest rather than principal, and how early principal contributions shift the curve.',
    relatedCalcId: 'mortgage',
    sections: [
      {
        heading: 'The Compound Annuity Mechanics',
        body: 'Fixed-rate mortgage payments are calculated using a compound annuity equation that ensures identical monthly installments throughout the entire term. However, the internal distribution between principal and interest is dynamic. Because interest is charged on the remaining balance, the early years are overwhelmingly dominated by finance charges.',
        formula: 'M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]',
      },
      {
        heading: 'The Power of Early Principal Payments',
        body: 'Because interest in month (t) is calculated purely on the remaining principal from month (t-1), any voluntary capital applied to the principal immediately lowers every subsequent interest charge forever. An extra $100 per month on a $400,000 30-year mortgage can shave over 4 years and $45,000 in interest.',
      },
    ],
  },
  {
    id: 'compound-interest-rule-of-72',
    title: 'The Exponential Engine: Compound Growth & The Rule of 72',
    category: 'Finance',
    readTime: '5 min read',
    summary: 'How regular dollar-cost averaging compounds into multi-decade wealth, and the mental math heuristic used by bankers to calculate doubling time.',
    relatedCalcId: 'compound',
    sections: [
      {
        heading: 'Understanding Compounding Intervals',
        body: 'Simple interest only pays on the initial principal. Compound interest pays on both the principal and previously earned interest. Over short horizons (1-3 years), the difference is modest. Over long horizons (10-30 years), the compounding curve turns exponential.',
        formula: 'A = P(1 + r/n)^(nt)',
      },
      {
        heading: 'The Rule of 72 Heuristic',
        body: 'To mentally estimate how long an investment takes to double at a constant annual yield, divide 72 by the expected interest percentage. At 8% annual return, capital doubles in approximately 9 years (72 / 8 = 9). At 12%, it doubles in just 6 years.',
        formula: 'Doubling Years ≈ 72 / Annual Interest Rate',
      },
    ],
  },
  {
    id: 'bmr-vs-tdee-math',
    title: 'BMR vs. TDEE: The Physiology and Math of Energy Balance',
    category: 'Health',
    readTime: '4 min read',
    summary: 'Why extreme crash dieting triggers metabolic adaptation and how to calculate your true caloric expenditure using the Mifflin-St Jeor formula.',
    relatedCalcId: 'calorie',
    sections: [
      {
        heading: 'Basal Metabolic Rate (BMR)',
        body: 'Your BMR represents the net thermal energy required simply to sustain cellular respiration, blood circulation, and organ function while at complete physical and digestive rest. Clinical studies identify the Mifflin-St Jeor equation as the most accurate non-laboratory method.',
        formula: 'BMR (Men) = 10W + 6.25H - 5A + 5 | BMR (Women) = 10W + 6.25H - 5A - 161',
      },
      {
        heading: 'Total Daily Energy Expenditure (TDEE)',
        body: 'TDEE combines BMR with the thermic effect of food (TEF), non-exercise physical activity (NEAT), and structured exercise. Sustainable fat loss operates best at a measured 15% to 20% deficit below TDEE, preserving lean muscle mass and thyroid function.',
      },
    ],
  },
  {
    id: 'understanding-cidr-subnetting',
    title: 'Demystifying Subnetting: Understanding IPv4 CIDR Prefixes',
    category: 'Tech & Math',
    readTime: '6 min read',
    summary: 'What /24, /27, or /30 actually mean in systems architecture, and how binary masking isolates network identifiers from host allocations.',
    relatedCalcId: 'subnet',
    sections: [
      {
        heading: 'The 32-Bit Address Space',
        body: 'IPv4 addresses consist of 32 bits arranged in four 8-bit octets. Classless Inter-Domain Routing (CIDR) notation denotes how many leading bits are reserved for the network prefix, leaving the remaining bits for unique host assignments.',
        formula: 'Usable Hosts = 2^(32 - Prefix) - 2',
      },
      {
        heading: 'Network & Broadcast Reserves',
        body: 'In standard subnet blocks, two addresses are always reserved: the all-zeroes host address (Network ID) and the all-ones host address (Directed Broadcast). An exception exists under RFC 3021 for /31 point-to-point links, where both addresses are usable.',
      },
    ],
  },
  {
    id: 'onerepmax-mechanics',
    title: 'Strength Metrics: The Biomechanics of One Rep Max (1RM)',
    category: 'Health',
    readTime: '3 min read',
    summary: 'How multi-rep sets predict absolute muscular output without the injury risk of true maximal testing, comparing Epley and Brzycki curves.',
    relatedCalcId: 'onerepmax',
    sections: [
      {
        heading: 'The Epley and Brzycki Equations',
        body: 'Direct 1RM testing carries high central nervous system fatigue and joint strain. Submaximal sets of 3 to 8 repetitions provide highly reliable statistical proxies when plugged into validated biomechanical regression curves.',
        formula: 'Epley: W * (1 + r/30) | Brzycki: W * (36 / (37 - r))',
      },
    ],
  },
  {
    id: 'purchasing-power-inflation',
    title: 'Purchasing Power Decay: The Invisible Drag of Inflation',
    category: 'Finance',
    readTime: '3 min read',
    summary: 'How modest annual inflation rates compound into significant erosion of purchasing power over 10 to 30 year horizons.',
    relatedCalcId: 'inflation',
    sections: [
      {
        heading: 'Real vs Nominal Value',
        body: 'A nominal dollar amount stays fixed, but its real command over physical commodities, healthcare, and housing degrades exponentially. At a historical average of 3.2% annual inflation, purchasing power is halved in approximately 22 years.',
        formula: 'Real Value = Nominal Amount / (1 + i)^t',
      },
    ],
  },
];

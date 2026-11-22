import type { KnowledgeArticle } from '../types.ts';

export const articles: KnowledgeArticle[] = [
  {
    id: 'mortgage-amortization-math',
    title: 'How Fixed-Rate Mortgage Amortization Works',
    category: 'Finance',
    readTime: '4 min read',
    summary:
      'Understand why early mortgage payments go mostly toward interest, how principal paydown accelerates over time, and how extra payments reduce total interest.',
    relatedCalcId: 'mortgage',
    sections: [
      {
        heading: 'The Monthly Payment Formula',
        body: 'Lenders compute fixed monthly principal-and-interest payments using an annuity present-value equation. The periodic interest rate r equals the annual percentage rate divided by 12, and n is the total number of monthly payments.',
        formula: 'M = P · [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]',
      },
      {
        heading: 'Why Interest Front-Loads in Early Years',
        body: 'Each month, interest is charged strictly on the remaining principal balance (Balance × r). Because the balance is highest in year 1, interest consumes the majority of early payments while principal reduction compounds slowly at first and rapidly in the final decade.',
      },
      {
        heading: 'Accelerating Equity',
        body: 'Making even one extra principal payment per year—or shortening a 30-year note to 15 years—cuts remaining balance early, reducing interest accrual across every subsequent month.',
      },
    ],
  },
  {
    id: 'compound-interest-and-rule-of-72',
    title: 'Compound Interest, APY, and the Rule of 72',
    category: 'Finance',
    readTime: '3 min read',
    summary:
      'Compare nominal APR with effective annual yield (APY) and use the logarithmic Rule of 72 to estimate portfolio doubling times mentally.',
    relatedCalcId: 'compound',
    sections: [
      {
        heading: 'Continuous vs. Discrete Compounding',
        body: 'When interest compounds n times per year on principal P with periodic contributions PMT, growth accelerates exponentially because earned interest generates its own return in future periods.',
        formula: 'A = P(1 + r/n)^(nt) + PMT · [ ((1 + r/n)^(nt) - 1) / (r/n) ]',
      },
      {
        heading: 'Deriving the Rule of 72',
        body: 'Solving (1 + r)^t = 2 gives t = ln(2) / ln(1 + r). Because ln(2) ≈ 0.693, dividing 72 by the annual percentage rate approximates doubling time accurately between 4% and 15%, while remaining easy to factor mentally.',
        formula: 'Doubling Years ≈ 72 / Annual Return (%)',
      },
    ],
  },
  {
    id: 'mifflin-st-jeor-tdee',
    title: 'Mifflin-St Jeor BMR & TDEE Energy Modeling',
    category: 'Fitness',
    readTime: '4 min read',
    summary:
      'How clinical dietitians estimate resting basal metabolic expenditure and apply physical activity multipliers to plan sustainable caloric deficits or surpluses.',
    relatedCalcId: 'tdee',
    sections: [
      {
        heading: 'Basal Metabolic Rate (BMR)',
        body: 'Published in 1990, the Mifflin-St Jeor equation remains the clinical standard for estimating resting energy expenditure in healthy adults based on mass, height, age, and biological sex.',
        formula: 'BMR = 10·kg + 6.25·cm - 5·age + s  (s = +5 male, -161 female)',
      },
      {
        heading: 'Activity Multipliers (TDEE)',
        body: 'Multiplying BMR by an activity factor—ranging from 1.2 (sedentary desk work) to 1.9 (high-volume athletic training)—yields Total Daily Energy Expenditure, the maintenance baseline for weight management.',
      },
    ],
  },
  {
    id: 'onerm-strength-models',
    title: 'One-Rep Max (1RM) & Training Load Percentages',
    category: 'Fitness',
    readTime: '3 min read',
    summary:
      'Estimate maximal single-repetition strength safely from submaximal sets of 2–10 reps using the Epley and Brzycki regression models.',
    relatedCalcId: 'onerm',
    sections: [
      {
        heading: 'Epley Linear Estimation',
        body: 'Testing a true 1RM increases neuromuscular fatigue and injury risk. For sets of 2 to 10 repetitions taken close to technical failure, Epley provides a reliable strength projection.',
        formula: '1RM = Weight × (1 + Reps / 30)',
      },
      {
        heading: 'Programming Working Sets',
        body: 'Once 1RM is estimated, strength blocks typically target 80%–90% for 3–5 reps, while hypertrophy blocks target 65%–78% for 8–12 reps.',
      },
    ],
  },
  {
    id: 'cidr-ipv4-subnetting',
    title: 'IPv4 CIDR Subnetting & Bitmask Architecture',
    category: 'Engineering',
    readTime: '5 min read',
    summary:
      'Break down 32-bit IPv4 addresses, CIDR prefix lengths (/8 through /32), wildcard masks, network boundaries, and usable host capacity.',
    relatedCalcId: 'subnet',
    sections: [
      {
        heading: 'Network vs. Host Bits',
        body: 'An IPv4 address consists of 32 bits split by the CIDR prefix /p into p network bits and (32 - p) host bits. Standard subnets reserve the all-zeros address for the Network ID and all-ones for Broadcast.',
        formula: 'Usable Hosts = 2^(32 - p) - 2   (for p ≤ 30)',
      },
      {
        heading: 'Point-to-Point /31 and Host /32 Routes',
        body: 'RFC 3021 allows /31 links (2 addresses) on router point-to-point interfaces without broadcast waste, while /32 denotes a single loopback or host route.',
      },
    ],
  },
  {
    id: 'ohms-law-and-power-dissipation',
    title: 'Ohm’s Law, DC Power & Thermal Derating',
    category: 'Engineering',
    readTime: '3 min read',
    summary:
      'Relate voltage, current, resistance, and wattage across linear circuits to size resistors and prevent thermal overload.',
    relatedCalcId: 'ohmslaw',
    sections: [
      {
        heading: 'Fundamental DC Relationships',
        body: 'Across ohmic conductors, current is directly proportional to applied voltage and inversely proportional to resistance. Power dissipation scales with the square of current.',
        formula: 'V = I · R   |   P = V · I = I² · R = V² / R',
      },
      {
        heading: 'Safety Margin for Component Selection',
        body: 'Always select resistors rated for at least 2× the calculated steady-state wattage (P) so ambient temperature rise does not exceed component ratings.',
      },
    ],
  },
  {
    id: 'quadratic-discriminant-geometry',
    title: 'Quadratic Roots, Discriminants & Parabolic Geometry',
    category: 'Math',
    readTime: '3 min read',
    summary:
      'Interpret the discriminant Δ = b² - 4ac to determine whether a quadratic curve crosses the x-axis twice, touches at a single vertex, or yields complex conjugate roots.',
    relatedCalcId: 'quadratic',
    sections: [
      {
        heading: 'The Quadratic Formula & Vertex',
        body: 'For any second-degree polynomial ax² + bx + c = 0 (with a ≠ 0), the axis of symmetry lies at x = -b / (2a), and the roots sit symmetrically around it.',
        formula: 'x = [ -b ± √(b² - 4ac) ] / (2a)',
      },
      {
        heading: 'Three Regimes of Δ',
        body: 'When Δ > 0 there are two distinct real roots; when Δ = 0 the vertex lies directly on the x-axis (one repeated real root); when Δ < 0 the roots form a complex conjugate pair.',
      },
    ],
  },
  {
    id: 'z-score-normal-distribution',
    title: 'Standard Deviation, Variance & Z-Score Normalization',
    category: 'Math',
    readTime: '4 min read',
    summary:
      'Measure statistical dispersion and convert raw observations into dimensionless standard deviations from the population mean.',
    relatedCalcId: 'statistics',
    sections: [
      {
        heading: 'Z-Score Transformation',
        body: 'A Z-score expresses how many standard deviations σ an observation x sits above or below the mean μ, enabling fair comparison across different scales.',
        formula: 'Z = (x - μ) / σ',
      },
      {
        heading: 'Empirical 68-95-99.7 Rule',
        body: 'In normal distributions, roughly 68.27% of values fall within ±1σ, 95.45% within ±2σ, and 99.73% within ±3σ.',
      },
    ],
  },
];

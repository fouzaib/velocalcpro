import type { KnowledgeArticle } from '../types.ts';

export const articles: KnowledgeArticle[] = [
  {
    id: 'mortgage-amortization-math',
    title: 'How Fixed-Rate Mortgage Amortization Works',
    category: 'Finance',
    readTime: '6 min read',
    summary:
      'Understand why early mortgage payments go mostly toward interest, how principal paydown accelerates over time, and how extra payments reduce total interest by tens of thousands of dollars.',
    relatedCalcId: 'mortgage',
    sections: [
      {
        heading: '1. The Standard Monthly Annuity Formula',
        body: 'Lenders compute fixed monthly principal-and-interest payments using an annuity present-value equation. Here P is the financed loan principal (home price minus down payment), r is the monthly periodic rate (annual interest rate divided by 12), and n is the total number of monthly payments (for example, 360 months on a 30-year note).',
        formula: 'M = P · [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]',
      },
      {
        heading: '2. Worked Example: $360,000 Loan at 6.5% APR',
        body: 'Suppose you purchase a $450,000 home with 20% down ($90,000), leaving P = $360,000 financed over 30 years (n = 360) at 6.5% APR (r = 0.065 / 12 = 0.0054167). Plugging into the formula gives a fixed monthly Principal & Interest payment of $2,275.44. In Month 1, interest equals $360,000 × 0.0054167 = $1,950.00, so only $325.44 reduces principal. By Year 20, the remaining balance has fallen enough that over 65% of each monthly payment goes directly toward equity.',
      },
      {
        heading: '3. Why Interest Front-Loads and How to Cut It',
        body: 'Because interest accrues strictly on the remaining unpaid principal each month, reducing principal early creates a compounding snowball effect. Adding $200/month toward principal or choosing a 15-year term instead of a 30-year term dramatically lowers total interest paid over the life of the loan.',
      },
      {
        heading: '4. Escrow Taxes, Insurance & Common Mistakes',
        body: 'When budgeting for a home, Principal & Interest is only part of your monthly housing obligation. Property taxes, homeowner insurance, HOA dues, and private mortgage insurance (PMI when down payment is below 20%) can add 20%–35% on top of the base mortgage payment.',
      },
    ],
  },
  {
    id: 'compound-interest-and-rule-of-72',
    title: 'Compound Interest, APY, and the Rule of 72',
    category: 'Finance',
    readTime: '5 min read',
    summary:
      'Compare nominal APR with effective annual yield (APY), learn how recurring monthly contributions drive long-term wealth, and use the Rule of 72 to estimate portfolio doubling times.',
    relatedCalcId: 'compound',
    sections: [
      {
        heading: '1. Discrete Compounding with Recurring Contributions',
        body: 'When interest compounds n times per year on initial principal P alongside periodic contributions PMT, growth accelerates exponentially because previously earned returns generate returns of their own in every subsequent compounding cycle.',
        formula: 'A = P(1 + r/n)^(nt) + PMT · [ ((1 + r/n)^(nt) - 1) / (r/n) ]',
      },
      {
        heading: '2. Worked Example: $10,000 Start + $500/Month at 8%',
        body: 'Investing $10,000 upfront and adding $500 monthly for 20 years at an 8% annual return (compounded monthly) results in $130,000 of total out-of-pocket contributions ($10,000 + $120,000) growing to roughly $343,785—meaning $213,785 (over 62% of the ending portfolio) comes purely from compounded investment gains.',
      },
      {
        heading: '3. Deriving the Rule of 72',
        body: 'Solving (1 + r)^t = 2 yields t = ln(2) / ln(1 + r). Since ln(2) ≈ 0.693, dividing 72 by the annual percentage rate approximates doubling time within a fraction of a year for typical 4%–15% returns, while remaining divisible by 2, 3, 4, 6, 8, 9, and 12 mentally.',
        formula: 'Doubling Years ≈ 72 / Annual Return (%)',
      },
    ],
  },
  {
    id: 'mifflin-st-jeor-tdee',
    title: 'Mifflin-St Jeor BMR & TDEE Energy Modeling',
    category: 'Fitness',
    readTime: '5 min read',
    summary:
      'How clinical dietitians estimate resting basal metabolic expenditure and apply physical activity multipliers to plan sustainable caloric deficits or lean muscle surpluses.',
    relatedCalcId: 'tdee',
    sections: [
      {
        heading: '1. Basal Metabolic Rate (BMR)',
        body: 'Published in 1990, the Mifflin-St Jeor equation remains the clinical standard for estimating resting energy expenditure in healthy adults based on body mass (kg), stature (cm), age (years), and biological sex.',
        formula: 'BMR = 10·kg + 6.25·cm - 5·age + s  (s = +5 male, -161 female)',
      },
      {
        heading: '2. Total Daily Energy Expenditure (TDEE)',
        body: 'Multiplying BMR by a Physical Activity Level (PAL) factor—from 1.2 (sedentary desk work) to 1.55 (moderate exercise 3–5 days/week) up to 1.9 (endurance athlete)—estimates total daily calories burned.',
      },
      {
        heading: '3. Practical Fat-Loss & Lean-Gain Targets',
        body: 'A sustainable 300–500 kcal/day deficit below TDEE produces roughly 0.3–0.5 kg of weight loss per week while preserving training performance and lean muscle mass. Eating below resting BMR for prolonged periods is rarely recommended without clinical supervision.',
      },
    ],
  },
  {
    id: 'onerm-strength-models',
    title: 'One-Rep Max (1RM) & Training Load Percentages',
    category: 'Fitness',
    readTime: '4 min read',
    summary:
      'Estimate maximal single-repetition strength safely from submaximal sets of 2–10 reps using the Epley and Brzycki regression models to program strength and hypertrophy blocks.',
    relatedCalcId: 'onerm',
    sections: [
      {
        heading: '1. Epley vs. Brzycki Regression Equations',
        body: 'Testing a true 1RM increases central nervous system fatigue and technical breakdown risk. Submaximal sets of 2–10 repetitions taken near failure correlate closely with maximal strength when modeled via Epley or Brzycki equations.',
        formula: 'Epley: 1RM = W × (1 + R / 30)   |   Brzycki: 1RM = W × [36 / (37 - R)]',
      },
      {
        heading: '2. Programming Working Set Percentages',
        body: 'Once 1RM is estimated, powerlifting and maximal strength blocks generally target 82%–92% of 1RM for 2–5 reps, while hypertrophy blocks target 65%–78% of 1RM for 8–12 controlled repetitions.',
      },
    ],
  },
  {
    id: 'cidr-ipv4-subnetting',
    title: 'IPv4 CIDR Subnetting & Bitmask Architecture',
    category: 'Engineering',
    readTime: '6 min read',
    summary:
      'Master 32-bit IPv4 addresses, CIDR prefix lengths (/8 through /32), wildcard masks, network boundaries, broadcast addresses, and usable host capacity.',
    relatedCalcId: 'subnet',
    sections: [
      {
        heading: '1. Network Bits vs. Host Bits',
        body: 'An IPv4 address consists of 32 binary bits partitioned by the CIDR prefix /p into p network bits and (32 - p) host bits. Standard subnets reserve the all-zeros host address for the Network ID and the all-ones host address for Broadcast.',
        formula: 'Usable Hosts = 2^(32 - p) - 2   (for p ≤ 30)',
      },
      {
        heading: '2. Worked Example: 192.168.1.0/26',
        body: 'A /26 prefix leaves 32 - 26 = 6 host bits, yielding 2⁶ = 64 total addresses and 62 usable host IPs. Its subnet mask is 255.255.255.192 (wildcard 0.0.0.63), dividing the /24 block into four /26 subnets starting at .0, .64, .128, and .192.',
      },
      {
        heading: '3. Point-to-Point /31 and Host /32 Routes',
        body: 'RFC 3021 permits /31 links (2 addresses) on router point-to-point interfaces without broadcast waste, while /32 denotes a single loopback or host-specific routing entry.',
      },
    ],
  },
  {
    id: 'ohms-law-and-power-dissipation',
    title: 'Ohm’s Law, DC Power & Thermal Derating',
    category: 'Engineering',
    readTime: '5 min read',
    summary:
      'Relate voltage, current, resistance, and wattage across linear circuits to size series resistors safely and prevent thermal component failure.',
    relatedCalcId: 'ohmslaw',
    sections: [
      {
        heading: '1. Fundamental DC Circuit Laws',
        body: 'Across linear ohmic conductors, current I is directly proportional to voltage V and inversely proportional to resistance R. Power dissipation scales quadratically with current or voltage.',
        formula: 'V = I · R   |   P = V · I = I² · R = V² / R',
      },
      {
        heading: '2. Practical 2× Thermal Derating Rule',
        body: 'Running a 0.25 W quarter-watt resistor continuously at 0.23 W causes excessive surface temperatures and resistance drift. Standard engineering practice specifies at least 2× headroom—choosing a 0.5 W resistor whenever calculated dissipation exceeds 0.125 W.',
      },
    ],
  },
  {
    id: 'quadratic-discriminant-geometry',
    title: 'Quadratic Roots, Discriminants & Parabolic Geometry',
    category: 'Math',
    readTime: '4 min read',
    summary:
      'Interpret the discriminant Δ = b² - 4ac to determine whether a quadratic curve crosses the x-axis twice, touches at a single vertex, or yields complex conjugate roots.',
    relatedCalcId: 'quadratic',
    sections: [
      {
        heading: '1. The Quadratic Formula & Axis of Symmetry',
        body: 'For any second-degree polynomial ax² + bx + c = 0 (with a ≠ 0), the axis of symmetry lies at x = -b / (2a), and the two roots sit symmetrically on either side of the vertex.',
        formula: 'x = [ -b ± √(b² - 4ac) ] / (2a)',
      },
      {
        heading: '2. Three Regimes of the Discriminant Δ',
        body: 'When Δ > 0 there are two distinct real x-intercepts; when Δ = 0 the parabola touches the x-axis at a single repeated root; when Δ < 0 the roots form a complex conjugate pair α ± βi.',
      },
    ],
  },
  {
    id: 'z-score-normal-distribution',
    title: 'Standard Deviation, Variance & Z-Score Normalization',
    category: 'Math',
    readTime: '5 min read',
    summary:
      'Measure statistical dispersion and convert raw observations into dimensionless standard deviations from the population mean using Z-scores and the empirical rule.',
    relatedCalcId: 'statistics',
    sections: [
      {
        heading: '1. Z-Score Transformation',
        body: 'A Z-score expresses how many standard deviations σ an observation x lies above or below the mean μ, allowing fair comparison across datasets measured in completely different units.',
        formula: 'Z = (x - μ) / σ',
      },
      {
        heading: '2. The Empirical 68–95–99.7 Rule',
        body: 'In normal bell-curve distributions, approximately 68.27% of observations fall within ±1σ of the mean, 95.45% within ±2σ, and 99.73% within ±3σ. A Z-score of +2.0 corresponds roughly to the 97.7th percentile.',
      },
    ],
  },
];

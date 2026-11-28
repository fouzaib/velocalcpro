import type { CalcResult, CalculatorDef } from '../types.ts';

export interface CalcGuideContent {
  walkthroughParagraphs: string[];
  parameterNotes: { label: string; defaultVal: string; guidance: string }[];
  practicalUseCases: string[];
  extraFaqs: { q: string; a: string }[];
}

const CATEGORY_USE_CASES: Record<CalculatorDef['category'], string[]> = {
  Finance: [
    'Comparing multiple lender quotes or compounding horizons before signing contracts.',
    'Testing sensitivity to interest rate shifts, extra principal payments, or inflation.',
    'Exporting or saving snapshots to compare baseline vs. accelerated payoff plans.',
  ],
  Fitness: [
    'Establishing a repeatable baseline before starting a 8–12 week training or nutrition block.',
    'Adjusting caloric or training load targets gradually as body mass and performance evolve.',
    'Cross-checking submaximal gym metrics safely without maximal testing fatigue.',
  ],
  Math: [
    'Verifying hand-solved homework, exam derivations, and engineering unit proofs step-by-step.',
    'Inspecting edge cases such as zero denominators, negative discriminants, and boundary values.',
    'Converting between symbolic fractions, decimals, and standardized statistical scores.',
  ],
  Engineering: [
    'Sizing real-world components with built-in safety margins and thermal derating checks.',
    'Validating IPv4 network masks, filter cutoffs, and mechanical power limits during prototyping.',
    'Converting between decimal storage units, binary IEC units, and effective network line rates.',
  ],
};

export function buildCalcGuide(calc: CalculatorDef, sampleResult: CalcResult): CalcGuideContent {
  const inputsSummary = calc.inputs
    .map((inp) => `${inp.label} = ${inp.val}${inp.unit ? ` ${inp.unit}` : ''}`)
    .join(', ');

  const detailsSummary = sampleResult.details
    .map((d) => `${d.label} (${d.val})`)
    .join('; ');

  const walkthroughParagraphs = [
    `Using the default scenario (${inputsSummary}), the ${calc.name} applies the equation ${calc.formulaExplanation} to produce a primary ${sampleResult.primaryLabel.toLowerCase()} of ${sampleResult.primary}.`,
    detailsSummary
      ? `Alongside the headline figure, the calculation breaks down secondary metrics including ${detailsSummary}. Adjusting any slider or typing a custom value recalculates every dependent output instantaneously in your browser.`
      : `Adjusting any slider or numeric input updates the result instantaneously inside your browser with zero server round-trips.`,
    `For best accuracy when modeling real-world decisions, test a conservative and an optimistic set of inputs using the side-by-side Compare studio so you can see how sensitive your outcome is to small parameter changes.`,
  ];

  const parameterNotes = calc.inputs.map((inp) => {
    const unitNote = inp.unit ? ` (${inp.unit})` : '';
    const rangeNote = inp.options
      ? `Select from ${inp.options.map((o) => o.label).join(', ')}.`
      : `Valid slider range spans ${inp.min} to ${inp.max} in increments of ${inp.step}, though custom values can be typed directly.`;
    return {
      label: `${inp.label}${unitNote}`,
      defaultVal: `${inp.val}${inp.unit ? ` ${inp.unit}` : ''}`,
      guidance: rangeNote,
    };
  });

  const extraFaqs = [
    {
      q: `Is the ${calc.name} free and private to use?`,
      a: `Yes. Every calculation runs 100% locally inside your browser JavaScript engine. Your numbers are never logged or transmitted to external servers, and you can save snapshots locally in your browser history.`,
    },
    {
      q: `How can I compare two different ${calc.name.toLowerCase()} scenarios?`,
      a: `Click Compare What-If above the calculator to open Scenario A and Scenario B side-by-side with live metric differences.`,
    },
  ];

  return {
    walkthroughParagraphs,
    parameterNotes,
    practicalUseCases: CATEGORY_USE_CASES[calc.category],
    extraFaqs,
  };
}

import fs from 'node:fs';
import path from 'node:path';
import { calculators } from '../src/data/calculators.ts';
import { articles } from '../src/data/articles.ts';
import { buildCalcGuide } from '../src/utils/calcGuide.ts';

const SITE_URL = (process.env.SITE_URL || 'https://velocalc.dpdns.org').replace(/\/+$/, '');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const templateHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface PageMeta {
  outFile: string;
  urlPath: string;
  title: string;
  description: string;
  robots?: string;
  bodyHtml: string;
  schemaJson?: string;
}

function buildPageHtml(meta: PageMeta): string {
  const fullUrl = `${SITE_URL}${meta.urlPath === '/' ? '/' : meta.urlPath}`;
  const robots = meta.robots || 'index, follow';

  let html = templateHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(fullUrl)}" />`
  );
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${escapeHtml(robots)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(fullUrl)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );

  if (meta.schemaJson) {
    html = html.replace(
      /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${meta.schemaJson}</script>`
    );
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${meta.bodyHtml}</div>`);
  return html;
}

function writePage(meta: PageMeta) {
  const target = path.join(DIST_DIR, meta.outFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buildPageHtml(meta), 'utf-8');
}

const navHeaderHtml = `
  <header class="border-b border-slate-200 bg-white px-6 py-4">
    <nav class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <a href="/" class="font-extrabold text-lg text-slate-900">VeloCalc</a>
      <div class="flex flex-wrap gap-6 text-sm font-medium text-slate-600">
        <a href="/">Calculators</a>
        <a href="/compare">Compare</a>
        <a href="/knowledge">Knowledge</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  </header>
`;

const footerHtml = `
  <footer class="border-t border-slate-200 bg-white py-8 mt-12">
    <div class="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
      <p>© ${new Date().getFullYear()} VeloCalc · 51 Precision Calculators</p>
      <div class="flex flex-wrap gap-5">
        <a href="/">Calculators</a>
        <a href="/compare">Compare</a>
        <a href="/knowledge">Knowledge</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms &amp; Disclaimers</a>
      </div>
    </div>
  </footer>
`;

// 1. Homepage (/)
const homeLinks = calculators
  .map(
    (c) => `
      <li class="p-4 border border-slate-200 rounded-xl bg-white">
        <span class="text-xs text-slate-500">${escapeHtml(c.category)}</span>
        <h3 class="font-bold text-slate-900 mt-1"><a href="/calc/${escapeHtml(c.id)}">${escapeHtml(c.name)}</a></h3>
        <p class="text-xs text-slate-600 mt-1">${escapeHtml(c.desc)}</p>
      </li>`
  )
  .join('');

const homeGuidesLinks = articles
  .map(
    (a) => `
      <li class="p-4 border border-slate-200 rounded-xl bg-white">
        <span class="text-xs text-slate-500">${escapeHtml(a.category)} · ${escapeHtml(a.readTime)}</span>
        <h3 class="font-bold text-slate-900 mt-1"><a href="/knowledge/${escapeHtml(a.id)}">${escapeHtml(a.title)}</a></h3>
        <p class="text-xs text-slate-600 mt-1">${escapeHtml(a.summary)}</p>
      </li>`
  )
  .join('');

writePage({
  outFile: 'index.html',
  urlPath: '/',
  title: 'VeloCalc - 51 Precision Calculators',
  description:
    'Clean, distraction-free suite of 51 precision calculators for finance, fitness, math, and engineering with live schedules, what-if comparison, and zero tracking.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <section>
        <h1 class="text-3xl font-extrabold text-slate-900">VeloCalc — 51 Precision Calculators</h1>
        <p class="mt-2 text-slate-600">Distraction-free, client-side calculation tools for finance, fitness, mathematics, and engineering with live schedules and worked formula walkthroughs.</p>
      </section>
      <section>
        <h2 class="text-xl font-bold text-slate-900 mb-4">All 51 Calculators</h2>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">${homeLinks}</ul>
      </section>
      <section>
        <h2 class="text-xl font-bold text-slate-900 mb-4">Formula &amp; Methodology Guides</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">${homeGuidesLinks}</ul>
      </section>
    </main>
    ${footerHtml}
  `,
});

// 2. Compare (/compare)
writePage({
  outFile: 'compare.html',
  urlPath: '/compare',
  title: 'Side-by-Side What-If Calculator Comparison | VeloCalc',
  description:
    'Compare two financial, mortgage, loan, investment, or fitness scenarios side-by-side with live delta breakdowns.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 class="text-3xl font-extrabold text-slate-900">Side-by-Side Scenario Comparison</h1>
      <p class="text-slate-600">Evaluate two parameter sets side-by-side across mortgages, loans, compound wealth growth, and engineering calculators.</p>
      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${calculators
          .slice(0, 12)
          .map(
            (c) => `<li><a href="/calc/${escapeHtml(c.id)}" class="text-indigo-600 font-semibold">${escapeHtml(c.name)}</a></li>`
          )
          .join('')}
      </ul>
    </main>
    ${footerHtml}
  `,
});

// 3. Knowledge index (/knowledge) & individual guide pages (/knowledge/<slug>.html)
const articlesListHtml = articles
  .map(
    (art) => `
      <article class="p-6 border border-slate-200 rounded-xl bg-white space-y-2">
        <span class="text-xs font-medium text-slate-500">${escapeHtml(art.category)} · ${escapeHtml(art.readTime)}</span>
        <h2 class="text-xl font-bold text-slate-900"><a href="/knowledge/${escapeHtml(art.id)}">${escapeHtml(art.title)}</a></h2>
        <p class="text-sm text-slate-600">${escapeHtml(art.summary)}</p>
        <div class="pt-2 flex gap-4 text-xs font-bold">
          <a href="/knowledge/${escapeHtml(art.id)}" class="text-indigo-600">Read Full Guide →</a>
          <a href="/calc/${escapeHtml(art.relatedCalcId)}" class="text-slate-600">Open Calculator</a>
        </div>
      </article>`
  )
  .join('');

writePage({
  outFile: 'knowledge.html',
  urlPath: '/knowledge',
  title: 'Formulas, Algorithms & Mathematical Guides | VeloCalc',
  description:
    'Learn the exact equations behind mortgage amortization, the Rule of 72, Mifflin-St Jeor TDEE, CIDR subnetting, and 1RM strength modeling.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 class="text-3xl font-extrabold text-slate-900">Formulas, Algorithms &amp; Guides</h1>
      <p class="text-slate-600">In-depth mathematical references, clinical nutrition equations, worked examples, and networking formulas powering VeloCalc.</p>
      <div class="space-y-6">${articlesListHtml}</div>
    </main>
    ${footerHtml}
  `,
});

for (const art of articles) {
  const relatedCalc = calculators.find((c) => c.id === art.relatedCalcId);
  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: art.title,
        description: art.summary,
        url: `${SITE_URL}/knowledge/${art.id}`,
        publisher: { '@type': 'Organization', name: 'VeloCalc', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'VeloCalc', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Knowledge', item: `${SITE_URL}/knowledge` },
          { '@type': 'ListItem', position: 3, name: art.title, item: `${SITE_URL}/knowledge/${art.id}` },
        ],
      },
    ],
  });

  writePage({
    outFile: path.join('knowledge', `${art.id}.html`),
    urlPath: `/knowledge/${art.id}`,
    title: `${art.title} | VeloCalc Knowledge`,
    description: art.summary,
    schemaJson: articleSchema,
    bodyHtml: `
      ${navHeaderHtml}
      <main class="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <a href="/knowledge" class="text-xs font-bold text-indigo-600">← All Knowledge Guides</a>
        <article class="space-y-6">
          <header class="space-y-2 border-b border-slate-200 pb-6">
            <span class="text-xs text-slate-500">${escapeHtml(art.category)} · ${escapeHtml(art.readTime)}</span>
            <h1 class="text-3xl font-extrabold text-slate-900">${escapeHtml(art.title)}</h1>
            <p class="text-slate-600">${escapeHtml(art.summary)}</p>
          </header>
          ${art.sections
            .map(
              (s) => `
                <section class="space-y-2">
                  <h2 class="text-lg font-bold text-slate-900">${escapeHtml(s.heading)}</h2>
                  <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(s.body)}</p>
                  ${s.formula ? `<pre class="p-3 bg-slate-100 rounded-lg font-mono text-xs">${escapeHtml(s.formula)}</pre>` : ''}
                </section>`
            )
            .join('')}
          ${
            relatedCalc
              ? `<div class="p-5 border border-slate-200 rounded-xl bg-white">
                  <h3 class="font-bold text-slate-900">Interactive Tool: ${escapeHtml(relatedCalc.name)}</h3>
                  <p class="text-xs text-slate-600 mt-1">${escapeHtml(relatedCalc.desc)}</p>
                  <a href="/calc/${escapeHtml(relatedCalc.id)}" class="inline-block mt-2 text-xs font-bold text-indigo-600">Open Calculator →</a>
                </div>`
              : ''
          }
        </article>
      </main>
      ${footerHtml}
    `,
  });
}

// 4. Trust & Compliance Pages (/about, /contact, /privacy, /terms)
writePage({
  outFile: 'about.html',
  urlPath: '/about',
  title: 'About VeloCalc & Formula Verification Standards',
  description:
    'Learn about VeloCalc’s mission, formula verification standards, and 51 educational calculators across finance, fitness, math, and engineering.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <h1 class="text-3xl font-extrabold text-slate-900">About VeloCalc &amp; Editorial Standards</h1>
      <p class="text-slate-600">VeloCalc provides 51 transparent, client-side calculators across Finance, Fitness, Mathematics, and Engineering. Every tool documents its exact mathematical equation, assumptions, worked example, and reference sources.</p>
      <h2 class="text-xl font-bold text-slate-900">Formula Auditing</h2>
      <p class="text-sm text-slate-600">Each calculator is reviewed against standardized textbooks and specifications including fixed-rate annuity amortization, Mifflin-St Jeor clinical nutrition equations, Euclidean geometry, and RFC 3021 IPv4 CIDR subnetting.</p>
    </main>
    ${footerHtml}
  `,
});

writePage({
  outFile: 'contact.html',
  urlPath: '/contact',
  title: 'Contact VeloCalc — Feedback & Formula Support',
  description: 'Report a formula edge case, suggest a new calculator, or contact the VeloCalc team.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Contact VeloCalc</h1>
      <p class="text-slate-600">For formula bug reports, calculator suggestions, or advertising inquiries, contact support@velocalc.dpdns.org.</p>
    </main>
    ${footerHtml}
  `,
});

writePage({
  outFile: 'privacy.html',
  urlPath: '/privacy',
  title: 'Privacy Policy & Ad Disclosures | VeloCalc',
  description:
    'How VeloCalc processes 100% client-side calculations, handles Google AdSense advertising cookies, and protects user privacy.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Privacy Policy &amp; Scientific Methodology</h1>
      <p class="text-slate-600">All 51 calculators execute locally in your browser. Zero inputs or results are transmitted to or stored on any analytics server.</p>
      <h2 class="text-xl font-bold text-slate-900">Google AdSense &amp; Third-Party Cookies</h2>
      <p class="text-sm text-slate-600">Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites. Users may opt out of personalized advertising by visiting Google Ads Settings or www.aboutads.info/choices.</p>
    </main>
    ${footerHtml}
  `,
});

writePage({
  outFile: 'terms.html',
  urlPath: '/terms',
  title: 'Terms of Use & Educational Disclaimer | VeloCalc',
  description:
    'Review terms of use and educational planning disclaimers for VeloCalc financial, health, and engineering calculators.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Terms of Use &amp; Calculation Disclaimer</h1>
      <p class="text-slate-600">All tools, formulas, and guides on VeloCalc are provided for educational and preliminary planning purposes only and do not constitute licensed financial, medical, or engineering advice.</p>
    </main>
    ${footerHtml}
  `,
});

// 5. Utility pages (noindex)
writePage({
  outFile: 'history.html',
  urlPath: '/history',
  title: 'Calculation History | VeloCalc',
  description: 'Local browser calculation history and saved calculator snapshots.',
  robots: 'noindex, follow',
  bodyHtml: `${navHeaderHtml}<main class="max-w-4xl mx-auto px-6 py-10"><h1>Saved Calculation Snapshots</h1></main>${footerHtml}`,
});

writePage({
  outFile: 'assistant.html',
  urlPath: '/assistant',
  title: 'Velo Math & Formula Assistant | VeloCalc',
  description: 'Interactive mathematical equation solver and formula explanation guide.',
  robots: 'noindex, follow',
  bodyHtml: `${navHeaderHtml}<main class="max-w-4xl mx-auto px-6 py-10"><h1>Velo Math &amp; Formula Assistant</h1></main>${footerHtml}`,
});

// 6. All 51 individual calculator pages (/calc/<id>.html)
for (const calc of calculators) {
  const defaultValues: Record<string, number> = {};
  for (const inp of calc.inputs) {
    defaultValues[inp.id] = inp.val;
  }

  const sampleResult = calc.calc(defaultValues, 'USD');
  const guide = buildCalcGuide(calc, sampleResult);
  const allFaqs = [...calc.faqs, ...guide.extraFaqs];

  const relatedCalcs = calculators
    .filter((c) => c.category === calc.category && c.id !== calc.id)
    .slice(0, 6);
  const relatedArticles = articles.filter((a) => a.relatedCalcId === calc.id);

  const pageTitle = `${calc.name} — Free Online ${calc.category} Calculator | VeloCalc`;
  const pageDesc = `${calc.desc} Formula: ${calc.formulaExplanation}.`;

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: calc.name,
        url: `${SITE_URL}/calc/${calc.id}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        description: pageDesc,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'VeloCalc', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: calc.name, item: `${SITE_URL}/calc/${calc.id}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: allFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
  });

  const walkthroughHtml = guide.walkthroughParagraphs
    .map((p) => `<p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(p)}</p>`)
    .join('');

  const parameterGuideHtml = guide.parameterNotes
    .map(
      (p) => `
        <li class="py-2 border-b border-slate-100">
          <div class="font-semibold text-sm text-slate-900">${escapeHtml(p.label)} (Default: ${escapeHtml(p.defaultVal)})</div>
          <p class="text-xs text-slate-600 mt-0.5">${escapeHtml(p.guidance)}</p>
        </li>`
    )
    .join('');

  const useCasesHtml = guide.practicalUseCases
    .map((u) => `<li>${escapeHtml(u)}</li>`)
    .join('');

  const faqsHtml = allFaqs
    .map(
      (f) => `
        <div class="py-3 border-b border-slate-200">
          <h3 class="font-bold text-slate-900 text-sm">${escapeHtml(f.q)}</h3>
          <p class="text-sm text-slate-600 mt-1">${escapeHtml(f.a)}</p>
        </div>`
    )
    .join('');

  const relatedArticlesHtml =
    relatedArticles.length > 0
      ? `
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-slate-900">Guide &amp; Explanation</h2>
        ${relatedArticles
          .map(
            (a) => `
              <div class="p-4 border border-slate-200 rounded-xl">
                <h3 class="font-bold text-slate-900">${escapeHtml(a.title)}</h3>
                <p class="text-sm text-slate-600 mt-1">${escapeHtml(a.summary)}</p>
                <a href="/knowledge/${escapeHtml(a.id)}" class="text-indigo-600 text-xs font-bold">Read full guide →</a>
              </div>`
          )
          .join('')}
      </section>`
      : '';

  writePage({
    outFile: path.join('calc', `${calc.id}.html`),
    urlPath: `/calc/${calc.id}`,
    title: pageTitle,
    description: pageDesc,
    schemaJson,
    bodyHtml: `
      ${navHeaderHtml}
      <main class="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section class="space-y-3">
          <span class="text-xs font-medium text-slate-500">${escapeHtml(calc.category)}</span>
          <h1 class="text-3xl font-extrabold text-slate-900">${escapeHtml(calc.name)}</h1>
          <p class="text-slate-600">${escapeHtml(calc.desc)}</p>
          <p class="text-sm font-mono bg-slate-100 p-3 rounded-lg">Formula: ${escapeHtml(calc.formulaExplanation)}</p>
        </section>

        <section class="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Example Calculation (${escapeHtml(sampleResult.primaryLabel)})</h2>
          <p class="text-2xl font-extrabold text-indigo-600">${escapeHtml(sampleResult.primary)}</p>
          <ul class="text-sm text-slate-600 space-y-1">
            ${sampleResult.details
              .map((d) => `<li><strong>${escapeHtml(d.label)}:</strong> ${escapeHtml(d.val)}</li>`)
              .join('')}
          </ul>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Methodology &amp; Equation</h2>
          <p class="text-sm text-slate-600">${escapeHtml(calc.methodology)}</p>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Worked Example &amp; Calculation Walkthrough</h2>
          ${walkthroughHtml}
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Input Variable Reference</h2>
          <ul class="divide-y divide-slate-100">${parameterGuideHtml}</ul>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Common Applications</h2>
          <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">${useCasesHtml}</ul>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          ${faqsHtml}
        </section>

        ${relatedArticlesHtml}

        <section class="space-y-3">
          <h2 class="text-lg font-bold text-slate-900">Related ${escapeHtml(calc.category)} Calculators</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${relatedCalcs
              .map(
                (rc) => `
                  <li class="p-3 border border-slate-200 rounded-xl">
                    <a href="/calc/${escapeHtml(rc.id)}" class="font-bold text-indigo-600">${escapeHtml(rc.name)}</a>
                    <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(rc.desc)}</p>
                  </li>`
              )
              .join('')}
          </ul>
        </section>
      </main>
      ${footerHtml}
    `,
  });
}

// 7. 404.html (prevents soft-404s on Cloudflare Pages)
writePage({
  outFile: '404.html',
  urlPath: '/404',
  title: 'Page Not Found | VeloCalc',
  description: 'The requested calculator or page could not be found.',
  robots: 'noindex, nofollow',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
      <p class="text-slate-600">Explore our 51 precision calculators from the homepage.</p>
      <a href="/" class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Go to Calculators</a>
    </main>
    ${footerHtml}
  `,
});

// 8. Generate dist/sitemap.xml (clean indexable URLs only)
const today = new Date().toISOString().split('T')[0];
const staticUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/compare`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/knowledge`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/about`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${SITE_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
];

const articleUrls = articles.map((a) => ({
  loc: `${SITE_URL}/knowledge/${a.id}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const calcUrls = calculators.map((c) => ({
  loc: `${SITE_URL}/calc/${c.id}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls, ...calcUrls]
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`Prerendered ${calculators.length + articles.length + 10} HTML pages + sitemap.xml in dist/`);

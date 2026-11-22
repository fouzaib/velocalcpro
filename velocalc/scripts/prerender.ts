import fs from 'node:fs';
import path from 'node:path';
import { calculators } from '../src/data/calculators.ts';
import { articles } from '../src/data/articles.ts';

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
      <a href="/" class="font-extrabold text-lg text-slate-900">VeloCalc Pro</a>
      <div class="flex flex-wrap gap-6 text-sm font-medium text-slate-600">
        <a href="/">Calculators</a>
        <a href="/compare">Compare</a>
        <a href="/knowledge">Knowledge</a>
        <a href="/privacy">Privacy</a>
      </div>
    </nav>
  </header>
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

writePage({
  outFile: 'index.html',
  urlPath: '/',
  title: 'VeloCalc Pro - 51 Precision Calculators',
  description:
    'Clean, distraction-free suite of 51 precision calculators for finance, fitness, math, and engineering with live schedules, what-if comparison, and zero tracking.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <section>
        <h1 class="text-3xl font-extrabold text-slate-900">VeloCalc Pro — 51 Precision Calculators</h1>
        <p class="mt-2 text-slate-600">Fast, client-side calculation tools for finance, fitness, mathematics, and engineering with live schedules and zero tracking.</p>
      </section>
      <section>
        <h2 class="text-xl font-bold text-slate-900 mb-4">All 51 Calculators</h2>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">${homeLinks}</ul>
      </section>
    </main>
  `,
});

// 2. Compare (/compare)
writePage({
  outFile: 'compare.html',
  urlPath: '/compare',
  title: 'Side-by-Side What-If Calculator Comparison | VeloCalc Pro',
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
  `,
});

// 3. Knowledge (/knowledge)
const articlesHtml = articles
  .map(
    (art) => `
      <article class="p-6 border border-slate-200 rounded-xl bg-white space-y-3">
        <span class="text-xs font-medium text-slate-500">${escapeHtml(art.category)} · ${escapeHtml(art.readTime)}</span>
        <h2 class="text-xl font-bold text-slate-900">${escapeHtml(art.title)}</h2>
        <p class="text-sm text-slate-600">${escapeHtml(art.summary)}</p>
        ${art.sections
          .map(
            (s) => `
              <div>
                <h3 class="font-bold text-sm text-slate-800">${escapeHtml(s.heading)}</h3>
                <p class="text-xs text-slate-600 mt-1">${escapeHtml(s.body)}</p>
                ${s.formula ? `<pre class="mt-1 text-xs font-mono bg-slate-100 p-2 rounded">${escapeHtml(s.formula)}</pre>` : ''}
              </div>`
          )
          .join('')}
        <p class="pt-2"><a href="/calc/${escapeHtml(art.relatedCalcId)}" class="text-indigo-600 font-bold text-sm">Open Related Calculator →</a></p>
      </article>`
  )
  .join('');

writePage({
  outFile: 'knowledge.html',
  urlPath: '/knowledge',
  title: 'Formulas, Algorithms & Mathematical Guides | VeloCalc Pro',
  description:
    'Learn the exact equations behind mortgage amortization, the Rule of 72, Mifflin-St Jeor TDEE, CIDR subnetting, and 1RM strength modeling.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 class="text-3xl font-extrabold text-slate-900">Formulas, Algorithms &amp; Guides</h1>
      <p class="text-slate-600">Mathematical references, clinical nutrition equations, and networking formulas powering VeloCalc Pro.</p>
      <div class="space-y-6">${articlesHtml}</div>
    </main>
  `,
});

// 4. Privacy (/privacy)
writePage({
  outFile: 'privacy.html',
  urlPath: '/privacy',
  title: 'Privacy Policy & Scientific Methodology | VeloCalc Pro',
  description:
    'Learn how VeloCalc Pro executes 100% client-side calculations with zero server logging and standardized mathematical formulas.',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Privacy Policy &amp; Scientific Methodology</h1>
      <p class="text-slate-600">All 51 calculators execute locally in your browser. Zero inputs or results are transmitted to or stored on any analytics server.</p>
    </main>
  `,
});

// 5. Utility pages (noindex)
writePage({
  outFile: 'history.html',
  urlPath: '/history',
  title: 'Calculation History | VeloCalc Pro',
  description: 'Local browser calculation history and saved calculator snapshots.',
  robots: 'noindex, follow',
  bodyHtml: `${navHeaderHtml}<main class="max-w-4xl mx-auto px-6 py-10"><h1>Saved Calculation Snapshots</h1></main>`,
});

writePage({
  outFile: 'assistant.html',
  urlPath: '/assistant',
  title: 'Velo Math & Formula Assistant | VeloCalc Pro',
  description: 'Interactive mathematical equation solver and formula explanation guide.',
  robots: 'noindex, follow',
  bodyHtml: `${navHeaderHtml}<main class="max-w-4xl mx-auto px-6 py-10"><h1>Velo Math &amp; Formula Assistant</h1></main>`,
});

// 6. All 51 individual calculator pages (/calc/<id>.html)
for (const calc of calculators) {
  const defaultValues: Record<string, number> = {};
  for (const inp of calc.inputs) {
    defaultValues[inp.id] = inp.val;
  }

  const sampleResult = calc.calc(defaultValues, 'USD');
  const relatedCalcs = calculators
    .filter((c) => c.category === calc.category && c.id !== calc.id)
    .slice(0, 6);
  const relatedArticles = articles.filter((a) => a.relatedCalcId === calc.id);

  const pageTitle = `${calc.name} — Free Online ${calc.category} Calculator | VeloCalc Pro`;
  const pageDesc = `${calc.desc} Formula: ${calc.formulaExplanation}.`;

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.name,
    url: `${SITE_URL}/calc/${calc.id}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    description: pageDesc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  });

  const inputsListHtml = calc.inputs
    .map(
      (inp) =>
        `<li><strong>${escapeHtml(inp.label)}:</strong> default ${escapeHtml(String(inp.val))}${inp.unit ? ` ${escapeHtml(inp.unit)}` : ''}</li>`
    )
    .join('');

  const faqsHtml = calc.faqs
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
                <a href="/knowledge" class="text-indigo-600 text-xs font-bold">Read full guide →</a>
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

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Methodology</h2>
          <p class="text-sm text-slate-600">${escapeHtml(calc.methodology)}</p>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Input Parameters</h2>
          <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">${inputsListHtml}</ul>
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
    `,
  });
}

// 7. 404.html (prevents soft-404s on Cloudflare Pages)
writePage({
  outFile: '404.html',
  urlPath: '/404',
  title: 'Page Not Found | VeloCalc Pro',
  description: 'The requested calculator or page could not be found.',
  robots: 'noindex, nofollow',
  bodyHtml: `
    ${navHeaderHtml}
    <main class="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
      <h1 class="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
      <p class="text-slate-600">Explore our 51 precision calculators from the homepage.</p>
      <a href="/" class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Go to Calculators</a>
    </main>
  `,
});

// 8. Generate dist/sitemap.xml (clean indexable URLs only)
const today = new Date().toISOString().split('T')[0];
const staticUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/compare`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/knowledge`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${SITE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
];

const calcUrls = calculators.map((c) => ({
  loc: `${SITE_URL}/calc/${c.id}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...calcUrls]
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
console.log(`Prerendered ${calculators.length + 7} HTML pages + sitemap.xml in dist/`);

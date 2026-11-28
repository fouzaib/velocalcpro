import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI, Type } from '@google/genai';
import { calculators } from './src/data/calculators.ts';

const PORT = Number(process.env.PORT || 3000);
const SITE_URL = (process.env.SITE_URL || process.env.APP_URL || 'https://velocalc.dpdns.org').replace(/\/+$/, '');
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Server-side Gemini Assistant endpoint
  app.post('/api/assistant', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment secrets.',
      });
      return;
    }

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const calcCatalog = calculators.map((c) => `${c.id}: ${c.name} (${c.category})`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: `You are Velo Math & Formula Assistant for VeloCalc Pro.
Provide clear, concise, accurate mathematical explanations, worked examples, and step-by-step derivations.
If one of the available calculators below directly solves the user's task, include its exact id in recommendedCalcId; otherwise leave recommendedCalcId empty.

Available calculators:
${calcCatalog}`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Clear step-by-step explanation and answer in plain text.',
              },
              recommendedCalcId: {
                type: Type.STRING,
                description: 'Exact calculator id from the catalog if relevant, or empty string.',
              },
            },
            required: ['reply'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw) as { reply?: string; recommendedCalcId?: string };
      const validId = calculators.some((c) => c.id === parsed.recommendedCalcId)
        ? parsed.recommendedCalcId
        : undefined;

      res.json({
        reply: parsed.reply || 'Unable to generate a response.',
        recommendedCalcId: validId,
      });
    } catch (err) {
      console.error('Assistant API error:', err);
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to reach Gemini API.',
      });
    }
  });

  // Dynamic sitemap.xml for Node server mode
  app.get('/sitemap.xml', async (_req, res) => {
    const { articles } = await import('./src/data/articles.ts');
    const today = new Date().toISOString().split('T')[0];
    const urls = [
      { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${SITE_URL}/compare`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${SITE_URL}/knowledge`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${SITE_URL}/about`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${SITE_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${SITE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${SITE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
      ...articles.map((a) => ({
        loc: `${SITE_URL}/knowledge/${a.id}`,
        priority: '0.8',
        changefreq: 'monthly',
      })),
      ...calculators.map((c) => ({
        loc: `${SITE_URL}/calc/${c.id}`,
        priority: '0.8',
        changefreq: 'monthly',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { extensions: ['html'] }));
    app.get('*', (req, res) => {
      const cleanPath = req.path.replace(/\/+$/, '');
      const candidate = path.join(distDir, `${cleanPath === '' ? 'index' : cleanPath}.html`);
      if (fs.existsSync(candidate)) {
        res.sendFile(candidate);
        return;
      }
      const notFound = path.join(distDir, '404.html');
      if (fs.existsSync(notFound)) {
        res.status(404).sendFile(notFound);
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeloCalc Pro server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

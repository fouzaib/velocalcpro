import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { calculatorIds, pageRoutes } from './src/data/calculatorIds.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function getRequestOrigin(req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : (forwardedProto || req.protocol || 'https').split(',')[0].trim();

  const forwardedHost = req.headers['x-forwarded-host'];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : (forwardedHost || req.headers.host || `localhost:${PORT}`).split(',')[0].trim();

  return `${proto}://${host}`;
}

function buildSitemapXml(origin: string): string {
  const today = new Date().toISOString().split('T')[0];

  const pageEntries = pageRoutes
    .map(
      (r) => `  <url>
    <loc>${origin}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  const calcEntries = calculatorIds
    .map(
      (id) => `  <url>
    <loc>${origin}/calc/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageEntries}
${calcEntries}
</urlset>
`;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);

  // Dynamic XML Sitemap matched to the requesting domain/protocol
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const origin = getRequestOrigin(req);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buildSitemapXml(origin));
  });

  // Dynamic robots.txt pointing to the requesting domain's sitemap
  app.get('/robots.txt', (req: Request, res: Response) => {
    const origin = getRequestOrigin(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  // Google AdSense Authorized Digital Sellers
  app.get('/ads.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('google.com, pub-2288243349631995, DIRECT, f08c47fec0942fa0\n');
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(import.meta.dirname ?? '.', 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

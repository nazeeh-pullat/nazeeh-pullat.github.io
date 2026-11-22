// Runs after `vite build`: writes one real HTML page per project (dist/work/<id>/index.html) with its own
// <title>, description, canonical, Open Graph and JSON-LD so search engines can index every project,
// plus sitemap.xml and 404.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const SITE = 'https://nazeeh-pullat.github.io';
const NAME = 'Nazeeh Pullat';
const data = JSON.parse(readFileSync(join(root, 'src/data/works.json'), 'utf8'));
const tpl = readFileSync(join(dist, 'project.html'), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

for (const w of data.works) {
  const url = `${SITE}/work/${w.id}/`;
  const title = `${w.title} — ${w.companyName} | ${NAME}`;
  const desc = trim(`${w.title}: ${w.type.toLowerCase()} work for ${w.companyName}${w.year ? ' (' + w.year + ')' : ''} by ${NAME} (Nazeeh Fazalul Rahiman Pullat), creative technologist in Riyadh.`, 180);
  const img = w.cover ? `${SITE}/${w.cover}` : `${SITE}/og.jpg`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: w.title,
    url,
    description: desc,
    image: img,
    ...(w.year ? { dateCreated: String(w.year) } : {}),
    genre: w.type,
    creator: { '@type': 'Person', name: NAME, alternateName: ['Nazeeh Fazalul Rahiman Pullat', 'Nazeeh Fazal'], url: SITE + '/' },
    about: w.companyName,
    isPartOf: { '@type': 'CollectionPage', name: 'All works', url: `${SITE}/works.html` },
  };
  const head = `<link rel="canonical" href="${url}">
<meta name="author" content="${NAME}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script>window.__WORK_ID__=${JSON.stringify(w.id)}</script>
</head>`;
  let html = tpl
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace('</head>', head)
    // crawlable content before JS renders the full page
    .replace('<main class="proj" id="proj"></main>', `<main class="proj" id="proj"><h1>${esc(w.title)}</h1><p>${esc(desc)}</p><p><a href="/works.html">All works by ${NAME}</a></p></main>`);
  const dir = join(dist, 'work', w.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const day = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, pr: '1.0' },
  { loc: `${SITE}/works.html`, pr: '0.8' },
  ...data.works.map((w) => ({ loc: `${SITE}/work/${w.id}/`, pr: '0.5' })),
];
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${day}</lastmod><priority>${u.pr}</priority></url>`).join('\n')}\n</urlset>\n`);

writeFileSync(join(dist, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | ${NAME}</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070a;color:#f2f1ec;font-family:system-ui,sans-serif;text-align:center}a{color:#4cc9f0}h1{font-size:clamp(48px,12vw,160px);margin:0;letter-spacing:-.05em}</style></head><body><main><h1>404</h1><p>That page does not exist.</p><p><a href="/">Back to ${NAME}</a> · <a href="/works.html">All works</a></p></main></body></html>`);
console.log(`postbuild: ${data.works.length} project pages, sitemap with ${urls.length} URLs, 404.html`);

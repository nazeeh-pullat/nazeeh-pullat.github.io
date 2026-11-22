// Scans the Bin Nahar "Works" drive folder and builds src/data/works.json + small WebP images in public/works/.
// Cover = best raster image, else page 1 of a PDF, else an SVG. Gallery = up to 3 more images (or PDF pages 2-4).
// Run: npm run works      (re-runnable; files already exported are reused)
import sharp from 'sharp';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = 'G:\\My Drive\\Bin Nahar\\Works';
const OUT_IMG = fileURLToPath(new URL('../public/works/', import.meta.url));
const OUT_JSON = fileURLToPath(new URL('../src/data/works.json', import.meta.url));
mkdirSync(OUT_IMG, { recursive: true });
sharp.cache(false); sharp.concurrency(1);

// Folder name -> company. Each is a DIFFERENT company/client, shown that way on the site.
const COMPANIES = {
  Autoparts: { name: 'Bin Nahar Autoparts', blurb: 'Parent holding and auto-parts trading' },
  Plastic: { name: 'SMNS Plastic', blurb: 'Plastic manufacturing' },
  Steel: { name: 'Ithihad Rubai Steel', blurb: 'Steel trading and fabrication' },
  'Real Estate': { name: 'Real Estate', blurb: 'Orchid, Shamookh Najd and market properties' },
  Fomix: { name: 'Fomix', blurb: 'Auto-parts brand' },
  Sayer: { name: 'Sayer', blurb: 'Auto-parts e-commerce' },
  Kopar: { name: 'Kopar', blurb: 'Auto-parts brand' },
  'Auto Kyo': { name: 'Auto Kyo', blurb: 'Auto-parts brand' },
  'Hi-Q': { name: 'Hi-Q', blurb: 'Brake-pad brand' },
  Leopart: { name: 'Leopart', blurb: 'Auto-parts brand' },
  'Altizam Motors': { name: 'Altizam Motors', blurb: 'Motors' },
  NHR: { name: 'NHR', blurb: 'Odoo branding' },
  Sons: { name: 'Sons', blurb: 'Odoo branding' },
};
const SKIP = new Set(['Temporary Work', 'E-Commerce']);
// Internal / sensitive documents that should never be published (seals, forms, accounting, templates, resource dumps).
const EXCLUDE = /seal|stamp|accounting|invoice|credit|receipt|letter\s?pad|letter\s?head|payment|handover|task list|quality policy|sales credit|changes pdf|odoo.*(header|footer)|(header|footer).*odoo|header footer|ameeri icon|contract|salary|passport|iqama|id card/i;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const monthOf = (w) => { const s = w.toLowerCase(); let best = -1, bd = 9; MONTHS.forEach((m, i) => { const d = Math.min(lev(s, m), s.length >= 3 && m.startsWith(s.slice(0, 3)) ? 0 : 9); if (d < bd) { bd = d; best = i; } }); return bd <= 2 ? best : -1; };
function parse(name) {
  const m = name.match(/^\s*(\d{1,2})\s+([A-Za-z]+)\s+(?:(\d{4}|\d{2})\b)?\s*(.*)$/);
  if (!m) return { title: name.trim(), date: null };
  const mo = monthOf(m[2]); if (mo < 0) return { title: name.trim(), date: null };
  let y = m[3] ? +m[3] : null; if (y && y < 100) y += 2000;
  return { title: (m[4] || name).trim().replace(/\s+/g, ' ').replace(/\.(ai|psd|pdf|png|jpe?g|svg|zip)$/i, '') || name.trim(), date: y ? `${y}-${String(mo + 1).padStart(2, '0')}` : null, year: y };
}
const TYPES = [
  ['3D', /\b3d\b|blender|building/i], ['Motion', /video|animation|animat|drone|reel|film|promo|footage/i],
  ['Photography', /photo|shoot|images?/i], ['Web', /website|web\b|e-?commerce|odoo|code|ui\b|online|salla|label maker/i],
  ['Branding', /logo|brand|identity|seal|monogram/i], ['Packaging', /box|label|packag|sticker|bag|carton|cartoon|wrap|kit\b/i],
  ['Print & Social', /poster|post\b|banner|brochure|catalog|profile|card|letter|invoice|signature|notebook|header|footer|advert|ad\b|ads\b|flag|panel|booth|calendar|pins?|truck|nfc|receipt|policy|dp\b|day|ramadh|eid|mubarak|founding|national/i],
];
const typeOf = (t) => (TYPES.find(([, re]) => re.test(t)) || ['Other'])[0];

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp']);
function collect(dir, depth = 0, acc = { img: [], pdf: [], svg: [] }) {
  let ents = []; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    const p = join(dir, e.name), x = extname(e.name).toLowerCase();
    if (e.isDirectory()) { if (depth < 5 && acc.img.length < 80) collect(p, depth + 1, acc); continue; }
    let s = 0; try { s = statSync(p).size; } catch { continue; }
    if (RASTER.has(x) && s > 60e3 && s < 30e6) acc.img.push({ p, s, d: depth });
    else if (x === '.pdf' && s > 20e3 && s < 80e6) acc.pdf.push({ p, s, d: depth });
    else if (x === '.svg' && s > 2e3 && s < 5e6) acc.svg.push({ p, s, d: depth });
  }
  return acc;
}
const rank = (a, b) => (a.d - b.d) || (b.s - a.s);
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

async function pdfPages(path, pages) {
  const doc = await withTimeout(pdfjs.getDocument({ data: new Uint8Array(readFileSync(path)), useSystemFonts: true, disableFontFace: true, verbosity: 0 }).promise, 30000);
  const out = [];
  for (let n = 1; n <= Math.min(pages, doc.numPages); n++) {
    const page = await doc.getPage(n), v0 = page.getViewport({ scale: 1 });
    const scale = Math.min(1100 / v0.width, 1500 / v0.height, 3), vp = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height)), ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await withTimeout(page.render({ canvasContext: ctx, viewport: vp }).promise, 40000);
    out.push(canvas.toBuffer('image/png'));
  }
  try { await doc.cleanup?.(); await doc.destroy?.(); } catch {}
  return out;
}
async function save(inputFn, file, width, q) {
  if (!existsSync(file)) await sharp(inputFn(), { limitInputPixels: false, failOn: 'none' }).rotate().resize({ width, withoutEnlargement: true }).flatten({ background: '#ffffff' }).webp({ quality: q }).toFile(file);
  const m = await sharp(file).metadata(); return { w: m.width, h: m.height };
}

const works = []; const seen = new Set();
for (const folder of readdirSync(ROOT)) {
  if (SKIP.has(folder) || !COMPANIES[folder]) continue;
  const cdir = join(ROOT, folder); let ents;
  try { ents = readdirSync(cdir, { withFileTypes: true }); } catch { continue; }
  for (const e of ents) {
    if (EXCLUDE.test(e.name)) { process.stdout.write('x'); continue; }
    const { title, date, year } = parse(e.name);
    let id = `${slug(folder)}-${slug(title)}`; for (let i = 2; seen.has(id); i++) id = `${slug(folder)}-${slug(title)}-${i}`; seen.add(id);
    const full = join(cdir, e.name), isDir = e.isDirectory();
    const acc = isDir ? collect(full) : { img: RASTER.has(extname(e.name).toLowerCase()) ? [{ p: full, s: 1, d: 0 }] : [], pdf: extname(e.name).toLowerCase() === '.pdf' ? [{ p: full, s: 1, d: 0 }] : [], svg: [] };
    acc.img.sort(rank); acc.pdf.sort(rank); acc.svg.sort(rank);
    const w = { id, company: folder, companyName: COMPANIES[folder].name, title, date, year: year || null, type: typeOf(title + ' ' + e.name), cover: null, w: 0, h: 0, images: [] };
    try {
      process.stderr.write(`\n> ${id}`);
      if (acc.img.length) {
        const [c, ...rest] = acc.img; const f = join(OUT_IMG, id + '.webp');
        Object.assign(w, await save(() => readFileSync(c.p), f, 900, 72)); w.cover = `works/${id}.webp`;
        for (let k = 0; k < Math.min(3, rest.length); k++) { const g = `${id}-g${k + 1}.webp`; try { await save(() => readFileSync(rest[k].p), join(OUT_IMG, g), 1280, 66); w.images.push(`works/${g}`); } catch {} }
      } else if (acc.pdf.length) {
        const f = join(OUT_IMG, id + '.webp'), g1 = join(OUT_IMG, `${id}-g1.webp`);
        if (!existsSync(f)) { const pages = await pdfPages(acc.pdf[0].p, 4); Object.assign(w, await save(() => pages[0], f, 900, 74)); for (let k = 1; k < pages.length; k++) { const g = `${id}-g${k}.webp`; await save(() => pages[k], join(OUT_IMG, g), 1280, 68); } }
        else { const m = await sharp(f).metadata(); w.w = m.width; w.h = m.height; }
        w.cover = `works/${id}.webp`;
        for (let k = 1; k <= 3; k++) if (existsSync(join(OUT_IMG, `${id}-g${k}.webp`))) w.images.push(`works/${id}-g${k}.webp`);
      } else if (acc.svg.length) {
        const f = join(OUT_IMG, id + '.webp'); Object.assign(w, await save(() => readFileSync(acc.svg[0].p), f, 900, 74)); w.cover = `works/${id}.webp`;
      }
      if (w.cover) w.images.unshift(w.cover);
    } catch (err) { console.warn(`\n! ${e.name}: ${String(err.message).slice(0, 80)}`); }
    works.push(w);
    process.stdout.write('.');
  }
}
// remove exported files that no entry references any more (e.g. newly excluded projects) so they are never deployed
const keep = new Set(works.flatMap((x) => x.images.map((p) => p.replace('works/', ''))));
let removed = 0;
for (const f of readdirSync(OUT_IMG)) if (!keep.has(f)) { try { unlinkSync(join(OUT_IMG, f)); removed++; } catch {} }
console.log(`\nremoved ${removed} unreferenced files`);
works.sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));
const companies = Object.entries(COMPANIES).map(([key, v]) => ({ key, ...v, count: works.filter((x) => x.company === key).length })).filter((c) => c.count);
writeFileSync(OUT_JSON, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), companies, works }, null, 1));
console.log(`\n${works.length} works, ${works.filter((x) => x.cover).length} with covers`);

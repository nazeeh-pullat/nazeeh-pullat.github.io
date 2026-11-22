// Generates public/og.jpg (social preview 1200x630), icon-192.png, icon-512.png and favicon.svg.
// Run: node scripts/build-seo-assets.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = (f) => fileURLToPath(new URL('../public/' + f, import.meta.url));
const stops = '<stop offset="0" stop-color="#f72585"/><stop offset=".3" stop-color="#7209b7"/><stop offset=".6" stop-color="#4361ee"/><stop offset="1" stop-color="#4cc9f0"/>';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" x2="1">${stops}</linearGradient>
<radialGradient id="a" cx=".15" cy=".1" r=".7"><stop offset="0" stop-color="#7209b7" stop-opacity=".55"/><stop offset="1" stop-color="#7209b7" stop-opacity="0"/></radialGradient>
<radialGradient id="b" cx=".95" cy=".95" r=".6"><stop offset="0" stop-color="#4cc9f0" stop-opacity=".35"/><stop offset="1" stop-color="#4cc9f0" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="#07070a"/><rect width="1200" height="630" fill="url(#a)"/><rect width="1200" height="630" fill="url(#b)"/>
<text x="70" y="120" font-family="Consolas,Courier New,monospace" font-size="26" fill="#8a8a95" letter-spacing="3">PORTFOLIO — RIYADH</text>
<text x="62" y="330" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="170" letter-spacing="-8" fill="url(#g)">NAZEEH</text>
<text x="62" y="490" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="170" letter-spacing="-8" fill="url(#g)">PULLAT</text>
<text x="70" y="570" font-family="Arial,sans-serif" font-size="32" fill="#f2f1ec">Creative technologist · Brands · Web · Motion · AI · Games</text>
<rect x="0" y="618" width="1200" height="12" fill="url(#g)"/></svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile(pub('og.jpg'));

const icon = (r) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">${stops}</linearGradient></defs><rect width="64" height="64" rx="${r}" fill="#07070a"/><text x="32" y="43" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" fill="url(#g)">NP</text></svg>`;
writeFileSync(pub('favicon.svg'), icon(16));
for (const s of [192, 512]) await sharp(Buffer.from(icon(14)), { density: 300 }).resize(s, s).png().toFile(pub(`icon-${s}.png`));
console.log('og.jpg, icon-192.png, icon-512.png, favicon.svg written');

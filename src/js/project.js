import '../styles/pages.css';
import { gsap, $, $$, initCommon, splitChars, tilt, workUrl } from './common.js';
import data from '../data/works.json';

initCommon();
const base = import.meta.env.BASE_URL;
const { works, companies } = data;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GRADS = ['#f72585,#7209b7', '#7209b7,#3a0ca3', '#3a0ca3,#4361ee', '#4361ee,#4cc9f0', '#b5179e,#4361ee', '#f72585,#4cc9f0'];
const id = window.__WORK_ID__ || new URLSearchParams(location.search).get('id');
const i = works.findIndex((w) => w.id === id), w = works[i], root = $('#proj');

if (!w) {
  root.innerHTML = `<h1>Not <span class="grad-text">found.</span></h1><p class="lead">That project does not exist (any more). <a class="btn" href="${base}works.html">Browse all works</a></p>`;
} else {
  document.title = `${w.title} — ${w.companyName} | Nazeeh Pullat`;
  const co = companies.find((c) => c.key === w.company);
  const same = works.filter((x) => x.company === w.company && x.id !== w.id && x.cover).slice(0, 6);
  const prev = works[(i + works.length - 1) % works.length], next = works[(i + 1) % works.length];
  const imgs = (w.images?.length ? w.images : w.cover ? [w.cover] : []).map((s) => `<div class="pimg"><img src="${base}${s}" alt="${esc(w.title)}" decoding="async"></div>`).join('');
  root.innerHTML = `
    <div class="crumbs mono"><a href="${base}works.html">All works</a> / <a href="${base}works.html?company=${encodeURIComponent(w.company)}">${esc(w.companyName)}</a></div>
    <h1 id="pt">${esc(w.title)}</h1>
    <div class="pmeta mono">
      <div><span>CLIENT</span><b>${esc(w.companyName)}</b></div>
      <div><span>TYPE</span><b>${esc(w.type)}</b></div>
      <div><span>YEAR</span><b>${w.year || '—'}</b></div>
      <div><span>ROLE</span><b>Design &amp; production</b></div>
    </div>
    <p class="note">${esc(co?.name || w.companyName)} is a separate company from the other clients on this site${co?.blurb ? ` (${esc(co.blurb.toLowerCase())})` : ''}. Work shown with permission.</p>
    ${imgs || `<div class="pimg" style="aspect-ratio:16/9;background:linear-gradient(140deg,${GRADS[i % 6]})"></div>`}
    <div class="pnav">
      <a href="${workUrl(prev.id)}"><small class="mono">← PREVIOUS</small><b>${esc(prev.title)}</b></a>
      <a href="${workUrl(next.id)}" style="text-align:right"><small class="mono">NEXT →</small><b>${esc(next.title)}</b></a>
    </div>
    ${same.length ? `<div class="related"><h2>MORE FROM ${esc(w.companyName.toUpperCase())}</h2><div class="grid">${same.map((x, k) => `
      <a class="wc" href="${workUrl(x.id)}"><div class="wi" style="--bg-g:linear-gradient(140deg,${GRADS[k % 6]})"><img src="${base}${x.cover}" alt="${esc(x.title)}" loading="lazy"><div class="wt"><b>${esc(x.title)}</b><span>${esc(x.type.toUpperCase())}${x.year ? ' · ' + x.year : ''}</span></div></div></a>`).join('')}</div></div>` : ''}`;
  splitChars($('#pt'));
  gsap.from($$('#pt .ch'), { rotateX: -90, yPercent: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.02, delay: 0.3 });
  gsap.from('.pmeta, .note, .pimg', { opacity: 0, y: 40, duration: 0.9, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
  $$('.wc').forEach((c) => tilt(c, $('.wi', c), { distort: false }));
}

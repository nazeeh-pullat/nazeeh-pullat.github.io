import '../styles/pages.css';
import { gsap, $, $$, initCommon, tilt, reduce, workUrl } from './common.js';
import { Flip } from 'gsap/Flip';
import data from '../data/works.json';

gsap.registerPlugin(Flip);
initCommon();

const base = import.meta.env.BASE_URL, PAGE = 36;
const { works, companies } = data;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GRADS = ['#f72585,#7209b7', '#7209b7,#3a0ca3', '#3a0ca3,#4361ee', '#4361ee,#4cc9f0', '#b5179e,#4361ee', '#f72585,#4cc9f0'];
const types = [...new Set(works.map((w) => w.type))].sort();
const params = new URLSearchParams(location.search);
const state = { company: params.get('company') || '', type: params.get('type') || '', q: params.get('q') || '', shown: PAGE };

const chip = (kind, val, label, n) => `<button class="chip ${state[kind] === val ? 'on' : ''}" data-k="${kind}" data-v="${esc(val)}">${esc(label)}${n != null ? `<small>${n}</small>` : ''}</button>`;
const renderFilters = () => {
  $('#f-company').innerHTML = chip('company', '', 'All', works.length) + [...companies].sort((a, b) => b.count - a.count).map((c) => chip('company', c.key, c.name, c.count)).join('');
  $('#f-type').innerHTML = chip('type', '', 'All', null) + types.map((t) => chip('type', t, t, works.filter((w) => w.type === t).length)).join('');
};
const match = (w) => (!state.company || w.company === state.company) && (!state.type || w.type === state.type)
  && (!state.q || (w.title + ' ' + w.companyName + ' ' + w.type).toLowerCase().includes(state.q.toLowerCase()));

const card = (w, i) => `
  <a class="wc ${w.cover ? '' : 'ph'}" data-id="${esc(w.id)}" href="${workUrl(w.id)}">
    <div class="wi" style="--bg-g:linear-gradient(140deg,${GRADS[i % GRADS.length]})">${w.cover ? `<img src="${base}${w.cover}" alt="${esc(w.title)}" loading="lazy" decoding="async">` : `<div class="big">${esc(w.title)}</div>`}
      <div class="wt"><b>${w.cover ? esc(w.title) : esc(w.companyName)}</b><span>${esc(w.companyName.toUpperCase())} · ${esc(w.type.toUpperCase())}${w.year ? ' · ' + w.year : ''}</span></div></div>
  </a>`;

const grid = $('#grid'), more = $('#more');
function render(animate = true) {
  const list = works.filter(match), vis = list.slice(0, state.shown);
  const flip = animate && !reduce ? Flip.getState('.wc') : null;
  grid.innerHTML = vis.length ? vis.map(card).join('') : '<div class="empty mono">No projects match. Try clearing a filter.</div>';
  $('#count').textContent = `${list.length} project${list.length === 1 ? '' : 's'}` + (state.company ? ` · ${companies.find((c) => c.key === state.company)?.name}` : '');
  more.hidden = list.length <= state.shown;
  $$('.wc', grid).forEach((c) => tilt(c, $('.wi', c), { distort: false }));
  if (flip) Flip.from(flip, { duration: 0.6, ease: 'power3.inOut', stagger: 0.015, absolute: false, onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.02 }) });
  const p = new URLSearchParams(); ['company', 'type', 'q'].forEach((k) => state[k] && p.set(k, state[k]));
  history.replaceState(null, '', p.toString() ? '?' + p : location.pathname);
}
document.addEventListener('click', (e) => {
  const c = e.target.closest('.chip'); if (!c) return;
  state[c.dataset.k] = c.dataset.v; state.shown = PAGE; renderFilters(); render();
});
let t; $('#q').value = state.q;
$('#q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); state.shown = PAGE; render(false); }, 160); });
more.addEventListener('click', () => { state.shown += PAGE; render(false); });
renderFilters(); render(false);

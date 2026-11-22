import '../styles/home.css';
import { gsap, ScrollTrigger, $, $$, reduce, fine, splitChars, initCommon, scrollToHash, tilt, workUrl } from './common.js';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { initShader } from './shader.js';
import { games } from '../data/games.js';
import { site } from '../data/site.js';
import repos from '../data/repos.json';
import data from '../data/works.json';

gsap.registerPlugin(ScrambleTextPlugin, MorphSVGPlugin);
const { lenis } = initCommon();
initShader($('#gl'));

const works = data.works, companies = data.companies;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GRADS = ['#f72585,#7209b7', '#7209b7,#3a0ca3', '#3a0ca3,#4361ee', '#4361ee,#4cc9f0', '#b5179e,#4361ee', '#f72585,#4cc9f0'];
const grad = (i) => `linear-gradient(140deg,${GRADS[i % GRADS.length]})`;
const base = import.meta.env.BASE_URL;

/* ---------- fill dynamic content ---------- */
const nWorks = Math.floor(works.length / 10) * 10;
const years = new Date().getFullYear() - 2019;
$('#stmt').insertAdjacentHTML('beforeend', `Brands, websites, systems and a little bit of chaos. ${companies.length} companies, ${nWorks}+ projects, one person who likes it when design, code and automation all meet in the same room.`);

// Best work: hand-picked ids first, then auto-fill with the best cover from each company
const byId = new Map(works.map((w) => [w.id, w]));
let featured = (site.featured || []).map((id) => byId.get(id)).filter(Boolean);
if (featured.length < 6) {
  for (const c of ['Fomix', 'Sayer', 'Plastic', 'Steel', 'Real Estate', 'Autoparts', 'Kopar', 'Hi-Q']) {
    if (featured.length >= 8) break;
    const w = works.filter((x) => x.company === c && x.cover && !featured.includes(x)).sort((a, b) => (b.w * b.h) - (a.w * a.h))[0];
    if (w) featured.push(w);
  }
}
$('.rail-track').innerHTML = featured.map((w, i) => `
  <a class="rcard" href="${workUrl(w.id)}" draggable="false">
    <div class="ri" style="--bg-g:${grad(i)}">${w.cover ? `<img src="${base}${w.cover}" alt="" loading="lazy" draggable="false">` : ''}<small>${esc(w.type.toUpperCase())}${w.year ? ' · ' + w.year : ''}</small><span>${esc(w.title)}<br><small style="font-weight:400">${esc(w.companyName)}</small></span></div>
  </a>`).join('');

// Zoom grid tiles = biggest companies
const top = [...companies].sort((a, b) => b.count - a.count).slice(0, 8);
const tiles = top.map((c, i) => `<a class="zt" href="${base}works.html?company=${encodeURIComponent(c.key)}" style="--bg-g:${grad(i)}">${esc(c.name)}<small>${c.count} projects</small></a>`);
tiles.splice(4, 0, `<a class="zt c" id="zc" href="${base}works.html" style="--bg-g:linear-gradient(135deg,#f72585,#4361ee 60%,#4cc9f0)"><span>All ${nWorks}+<br>works →</span></a>`);
$('#zgrid').innerHTML = tiles.join('');

// horizontal-scroll panels: biggest companies with up to 3 covers each
$('#hz-track').innerHTML = [...companies].sort((a, b) => b.count - a.count).map((c) => {
  const covers = works.filter((w) => w.company === c.key && w.cover).sort((a, b) => (b.w * b.h) - (a.w * a.h)).slice(0, 3);
  return { c, covers };
}).filter((x) => x.covers.length >= 2).slice(0, 6).map(({ c, covers }, i) => `
  <article class="hp">
    <div class="hp-t"><span class="n mono">${String(i + 1).padStart(2, '0')} · ${c.count} PROJECTS</span><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}.</p>
      <a class="btn sm" href="${base}works.html?company=${encodeURIComponent(c.key)}">See the work →</a></div>
    <div class="hp-c">${covers.map((w) => `<a href="${workUrl(w.id)}" aria-label="${esc(w.title)}"><img src="${base}${w.cover}" alt="${esc(w.title)}" loading="lazy" draggable="false"></a>`).join('')}</div>
  </article>`).join('');

// stats
$$('[data-n]').forEach((el) => {
  const k = el.dataset.k;
  el.dataset.n = k === 'companies' ? companies.length : k === 'works' ? nWorks : k === 'years' ? years : 6;
});

// repos
$('#repos').innerHTML = repos.map((r) => `
  <a class="repo" href="${esc(r.url)}" target="_blank" rel="noopener" data-cursor="OPEN">
    <div><h3>${esc(r.title)}</h3><p>${esc(r.description || 'Open-source project on GitHub.')}</p></div>
    <div class="meta2 mono"><span class="lang">${esc(r.language || 'Code')}</span><span>${esc(r.pushed)}</span></div>
  </a>`).join('');

// games
const feat = games.find((g) => g.status === 'released'), dev = games.filter((g) => g !== feat);
const iconHTML = (g, tag, link) => {
  const inner = `<img src="${base}games/${g.id}/icon.webp" alt="${esc(g.name)} icon" width="384" height="384" loading="lazy"><span class="tag ${g.status === 'released' ? 'rel' : ''}">${g.status === 'released' ? 'RELEASED' : 'IN DEVELOPMENT'}</span>`;
  return link ? `<a class="gicon" data-game="${g.id}" href="${esc(link)}" target="_blank" rel="noopener" aria-label="${esc(g.name)}">${inner}</a>`
              : `<div class="gicon" data-game="${g.id}" tabindex="0" role="button" aria-label="${esc(g.name)} (in development)">${inner}</div>`;
};
$('#g-feat').innerHTML = `
  ${iconHTML(feat, true, feat.links.find((l) => l.label === 'Website')?.href)}
  <div class="g-info"><h3>${esc(feat.name)}</h3><div class="tl mono">${esc(feat.tagline.toUpperCase())}</div>
    <p>${esc(feat.blurb)}</p>
    <div class="chips">${feat.platforms.map((p) => `<span>${esc(p)}</span>`).join('')}<span>iOS &amp; Steam soon</span></div>
    <div class="g-links">${feat.links.map((l, i) => `<a class="btn ${i ? 'sm' : ''}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div></div>`;
$('#g-dev').innerHTML = dev.map((g) => `
  <div class="g-card">${iconHTML(g)}<div><h4>${esc(g.name)}</h4><div class="tl">${esc(g.tagline)}</div><p>${esc(g.blurb)}</p></div></div>`).join('');

/* ---------- gameplay preview on icon hover ---------- */
(() => {
  const prev = $('#gprev'), media = $('.gp-media', prev), dots = $('.gp-dots', prev), label = $('.gp-label', prev), ttl = $('.gp-title', prev);
  let timer = null, cur = null, curEl = null;
  const warm = new Set();
  const preload = (g) => { if (warm.has(g.id)) return; warm.add(g.id); for (let i = 1; i <= Math.min(g.frames, 3); i++) { const im = new Image(); im.src = `${base}games/${g.id}/f${i}.webp`; } };
  const place = (el) => {
    const r = el.getBoundingClientRect(), w = prev.offsetWidth, h = prev.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.top - h - 16;
    if (y < 12) y = Math.min(r.bottom + 16, innerHeight - h - 12);
    x = Math.max(12, Math.min(x, innerWidth - w - 12));
    gsap.set(prev, { x, y });
  };
  const show = (g, el) => {
    if (cur === g) return; hide(true); cur = g; curEl = el; preload(g);
    ttl.textContent = g.name; label.textContent = g.status === 'released' ? 'GAMEPLAY' : 'IN DEVELOPMENT';
    if (g.video) media.innerHTML = `<video src="${base}${g.video}" muted loop playsinline autoplay style="opacity:1"></video>`;
    else media.innerHTML = Array.from({ length: g.frames }, (_, i) => `<img src="${base}games/${g.id}/f${i + 1}.webp" alt="" decoding="async">`).join('');
    dots.innerHTML = Array.from({ length: g.video ? 0 : g.frames }, () => '<i></i>').join('');
    place(el);
    gsap.killTweensOf(prev); gsap.fromTo(prev, { autoAlpha: 0, scale: 0.82, y: '+=14' }, { autoAlpha: 1, scale: 1, y: '-=14', duration: 0.4, ease: 'back.out(1.5)' });
    if (g.video) return;
    const imgs = $$('img', media), d = $$('i', dots); let i = 0;
    const go = (n) => {
      imgs.forEach((im, k) => { if (k !== n) gsap.to(im, { opacity: 0, duration: 0.5, overwrite: true }); });
      gsap.fromTo(imgs[n], { opacity: 0, scale: 1 }, { opacity: 1, scale: 1.12, duration: 2.4, ease: 'none', overwrite: true });
      gsap.to(imgs[n], { opacity: 1, duration: 0.4, overwrite: false });
      d.forEach((x, k) => x.classList.toggle('on', k === n));
    };
    go(0); timer = setInterval(() => { i = (i + 1) % imgs.length; go(i); }, 1600);
  };
  const hide = (instant) => { clearInterval(timer); cur = null; gsap.killTweensOf(prev); if (instant) gsap.set(prev, { autoAlpha: 0 }); else gsap.to(prev, { autoAlpha: 0, scale: 0.9, duration: 0.25 }); };
  const bind = (el) => {
    const g = games.find((x) => x.id === el.dataset.game);
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') show(g, el); });
    el.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' && cur !== g) show(g, el); }); // re-show after scrolling under a stationary pointer
    el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') hide(); });
    el.addEventListener('focus', () => show(g, el)); el.addEventListener('blur', () => hide());
    el.addEventListener('click', (e) => { if (matchMedia('(hover:none)').matches && cur !== g) { e.preventDefault(); show(g, el); } });
    gsap.to(el, { y: -8, duration: 2.4 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (fine) el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to($('img', el), { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 18, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 18, duration: 0.4 }); });
    el.addEventListener('pointerleave', () => gsap.to($('img', el), { rotateX: 0, rotateY: 0, duration: 0.6 }));
  };
  $$('.gicon').forEach(bind);
  addEventListener('scroll', () => { if (cur && curEl) place(curEl); }, { passive: true }); // follow the icon while scrolling
  document.addEventListener('pointerdown', (e) => { if (cur && !e.target.closest('.gicon')) hide(); });
  ScrollTrigger.create({ trigger: '.games', start: 'top 90%', once: true, onEnter: () => games.forEach(preload) });
})();

/* ---------- preloader ---------- */
const pre = $('.pre'), pn = $('#pn'), cnt = { v: 0 };
document.documentElement.style.overflow = 'hidden';
gsap.timeline({ onComplete: () => { pre.remove(); document.documentElement.style.overflow = ''; ScrollTrigger.refresh(); scrollToHash(lenis); } })
  .to(cnt, { v: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => { pn.textContent = Math.round(cnt.v); } })
  .to(pre, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=.1');

/* ---------- words / chars ---------- */
const st = $('#stmt');
const stText = st.textContent.trim();
st.innerHTML = stText.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
$$('.si h3').forEach(splitChars);
$$('.si h3').forEach((h) => gsap.from($$('.ch', h), { rotateX: -90, yPercent: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: h, start: 'top 85%', toggleActions: 'play none none reverse' } }));

/* ---------- global effects ---------- */
gsap.timeline({ scrollTrigger: { trigger: '.od', start: 'top 85%', end: 'top 25%', scrub: 0.8 } })
  .to('#ot', { strokeDashoffset: 0, ease: 'none', duration: 1 }).to('#ot', { fillOpacity: 1, duration: 0.5, ease: 'none' });
$$('.scr').forEach((el) => { const t = el.textContent; ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(el, { duration: 1, scrambleText: { text: t, chars: '01▮▯/', speed: 0.5 } }) }); });
$$('[data-n]').forEach((el) => { const o = { v: 0 }, n = +el.dataset.n, s = el.dataset.s || ''; ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + s; } }) }); });

// services: scramble word + background tint + activate
const svcW = $('#svcWord'); let curW = 'BRAND';
$$('.si').forEach((si) => ScrollTrigger.create({ trigger: si, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => {
  si.classList.toggle('on', s.isActive);
  if (s.isActive && innerWidth > 800 && si.dataset.w !== curW) { curW = si.dataset.w; gsap.to(svcW, { duration: 0.7, scrambleText: { text: curW, chars: '01▮/<>', speed: 0.7 } }); gsap.to('body', { backgroundColor: si.dataset.bg, duration: 0.8 }); }
} }));
ScrollTrigger.create({ trigger: '.svc', start: 'top 20%', end: 'bottom 60%', onLeave: () => gsap.to('body', { backgroundColor: '#07070a', duration: 0.6 }), onLeaveBack: () => gsap.to('body', { backgroundColor: '#07070a', duration: 0.6 }) });

// drag rail with momentum, skew, tilt, distortion
(() => {
  const rail = $('.rail'), tr = $('.rail-track'), cards = $$('.rcard');
  let x = 0, vx = 0, drag = false, sx = 0, x0 = 0, last = 0, moved = 0;
  const min = () => Math.min(0, -(tr.scrollWidth - rail.clientWidth + 0));
  const setX = gsap.quickSetter(tr, 'x', 'px'), skew = gsap.quickTo(cards, 'skewX', { duration: 0.4, ease: 'power3' });
  const clamp = (v) => gsap.utils.clamp(min(), 0, v);
  rail.addEventListener('pointerdown', (e) => { drag = true; moved = 0; sx = e.clientX; x0 = x; last = e.clientX; vx = 0; rail.style.cursor = 'grabbing'; cards.forEach((c) => (c.dataset.drag = '1')); });
  addEventListener('pointermove', (e) => { if (!drag) return; vx = e.clientX - last; last = e.clientX; moved = Math.max(moved, Math.abs(e.clientX - sx)); x = clamp(x0 + (e.clientX - sx)); setX(x); });
  const up = () => { if (!drag) return; drag = false; rail.style.cursor = ''; cards.forEach((c) => (c.dataset.drag = '0')); };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  rail.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  gsap.ticker.add(() => { if (!drag) { vx *= 0.94; if (Math.abs(vx) > 0.1) { x = clamp(x + vx); setX(x); } } skew(gsap.utils.clamp(-10, 10, -vx * 0.6)); });
  cards.forEach((c) => tilt(c, $('.ri', c)));
})();

// spotlight
(() => {
  const sw = $('.sw'), f = $('.fill'); let tx = 50, ty = 50, x = 50, y = 50;
  addEventListener('pointermove', (e) => { const b = sw.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; });
  gsap.ticker.add(() => { x += (tx - x) * 0.12; y += (ty - y) * 0.12; f.style.setProperty('--mx', x + 'px'); f.style.setProperty('--my', y + 'px'); });
})();

// looping rows: reverse + speed up with scroll
(() => {
  const rows = $$('.row'), tw = rows.map((r, i) => gsap.fromTo(r, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 30, ease: 'none', repeat: -1 }));
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
    const v = Math.min(Math.abs(s.getVelocity()) / 180, 8);
    tw.forEach((t) => { gsap.to(t, { timeScale: (s.direction > 0 ? 1 : -1) * (1 + v), duration: 0.3, overwrite: true }); gsap.to(t, { timeScale: s.direction > 0 ? 1 : -1, duration: 1.2, delay: 0.3, overwrite: false }); });
  } });
})();

// footer uncovered from beneath
gsap.fromTo('#fi', { scale: 0.86, yPercent: -10, opacity: 0.3 }, { scale: 1, yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.main', start: 'bottom bottom', end: 'bottom top', scrub: true } });

// contact form
(() => {
  const f = $('#cf'), s = $('.status', f);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (d.website) return; // honeypot
    if (site.formEndpoint) {
      s.textContent = 'Sending…';
      try {
        const r = await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: d.name, email: d.email, message: d.message }) });
        if (!r.ok) throw new Error(r.status);
        s.textContent = 'Thanks! I will reply soon.'; f.reset();
      } catch { s.textContent = `Could not send. Please email ${site.email}.`; }
    } else {
      s.textContent = 'Opening your email app…';
      location.href = `mailto:${site.email}?subject=${encodeURIComponent('Portfolio message from ' + d.name)}&body=${encodeURIComponent(d.message + '\n\n— ' + d.name + ' (' + d.email + ')')}`;
    }
  });
  if (fine) {
    const m = $('.mag'); if (!m) return;
    const mx = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('pointermove', (e) => { const b = m.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); if (Math.hypot(dx, dy) < 150) { mx(dx * 0.35); my(dy * 0.35); } else { mx(0); my(0); } });
  }
})();

/* ---------- desktop pinned effects ---------- */
const mm = gsap.matchMedia();
mm.add('(min-width:801px) and (prefers-reduced-motion:no-preference)', () => {
  // hero fly-through: zoom = SVG viewBox change (vector, no giant GPU layer)
  const ko = $('#ko'), kt = $('#kot'), zo = { k: 0 };
  const zoomKO = () => {
    const s = Math.pow(60, zo.k); let t = { x: 800, y: 380 };
    try { const r = kt.getExtentOfChar(3); t = { x: r.x + r.width / 2, y: r.y + r.height / 2 }; } catch (e) {}
    const cx = 800 + (t.x - 800) * zo.k, cy = 450 + (t.y - 450) * zo.k, w = 1600 / s, h = 900 / s;
    ko.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
  };
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=220%', pin: true, scrub: 0.6 } })
    .to('.meta', { opacity: 0, duration: 0.1 }, 0)
    .to(zo, { k: 1, ease: 'power2.in', duration: 1, onUpdate: zoomKO, onReverseComplete: zoomKO }, 0)
    .to('.ko', { opacity: 0, duration: 0.25 }, 0.78)
    .fromTo('.hello', { opacity: 0, scale: 0.85, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.25 }, 0.8);

  gsap.to('#stmt .w', { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '#stmt', start: 'top 70%', end: 'bottom 55%', scrub: true } });

  // horizontal scroll: vertical wheel pans the company panels sideways, with inner parallax
  const hzT = $('#hz-track'), hzLen = () => Math.max(0, hzT.scrollWidth - innerWidth);
  const hzTw = gsap.to(hzT, { x: () => -hzLen(), ease: 'none', scrollTrigger: { trigger: '#hz', start: 'top top', end: () => '+=' + hzLen(), pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  gsap.to('.hz-bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#hz', start: 'top top', end: () => '+=' + hzLen(), scrub: true, invalidateOnRefresh: true } });
  $$('.hp').forEach((p) => {
    gsap.fromTo($$('.hp-c img', p), { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: hzTw, start: 'left right', end: 'right left', scrub: true } });
    gsap.from($('h3', p), { xPercent: 30, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: hzTw, start: 'left 95%', end: 'left 45%', scrub: true } });
  });

  // zoom into the centre tile
  const zc = $('#zc');
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#zg', start: 'top top', end: '+=150%', pin: true, scrub: 0.6, invalidateOnRefresh: true } })
    .to('#zgrid', { scale: () => Math.max(innerWidth / zc.offsetWidth, innerHeight / zc.offsetHeight) * 1.02, ease: 'power2.in' }, 0)
    .to(zc, { borderRadius: 0 }, 0).to('.zt:not(.c)', { opacity: 0, ease: 'power1.in' }, 0.2).to('#zc span', { opacity: 1, duration: 0.3 }, 0.7);

  // shape morph
  const shapes = ['M120,60 L280,60 Q340,60 340,120 L340,280 Q340,340 280,340 L120,340 Q60,340 60,280 L60,120 Q60,60 120,60Z', 'M200,40 L238,150 L355,150 L260,220 L296,335 L200,265 L104,335 L140,220 L45,150 L162,150Z', 'M200,50 L350,330 L50,330Z', 'M200,60 C277,60 340,123 340,200 C340,277 277,340 200,340 C123,340 60,277 60,200 C60,123 123,60 200,60Z'];
  const caps = $$('.mp .cap span'), mtl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#mp', start: 'top top', end: '+=300%', pin: true, scrub: 0.6 } });
  shapes.forEach((d, i) => {
    mtl.to('#mpath', { morphSVG: d, duration: 1, rotation: i * 90, transformOrigin: '50% 50%' }, i);
    if (caps[i + 1]) mtl.to(caps[i], { opacity: 0, yPercent: -60, duration: 0.3 }, i + 0.7).fromTo(caps[i + 1], { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.3 }, i + 0.75);
  });

  // camera depth
  const ds = $$('.d'); gsap.set(ds, { xPercent: -50, yPercent: -50, left: '50%', top: '50%', autoAlpha: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#depth', start: 'top top', end: '+=' + ds.length * 90 + '%', pin: true, scrub: 0.6 } });
  ds.forEach((d, i) => { const dir = i % 2 ? 1 : -1;
    tl.fromTo(d, { scale: 0.12, autoAlpha: 0, filter: 'blur(16px)', z: -600, rotation: dir * 6 }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', z: 0, rotation: 0, duration: 1 }, i)
      .to(d, { scale: 3.6, autoAlpha: 0, filter: 'blur(22px)', z: 300, rotation: -dir * 4, duration: 1, ease: 'power1.in' }, i + 1); });

  // timeline path + alternating entries
  gsap.fromTo('#tlp', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.tl-sec', start: 'top 40%', end: 'bottom 70%', scrub: true } });
  $$('.ti').forEach((t, i) => gsap.from(t, { opacity: 0, x: i % 2 ? 160 : -160, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 80%', toggleActions: 'play none none reverse' } }));
});
mm.add('(max-width:800px)', () => {
  $('#ko').setAttribute('viewBox', '250 170 1100 560'); // bigger name on phones (no zoom there)
  return () => $('#ko').setAttribute('viewBox', '0 0 1600 900');
});
mm.add('(max-width:800px) and (prefers-reduced-motion:no-preference)', () => {
  gsap.set('#stmt .w', { opacity: 1 });
  $$('.ti,.zt,.d,.si,.repo,.g-card,.hp').forEach((e) => gsap.from(e, { opacity: 0, y: 50, duration: 0.8, scrollTrigger: { trigger: e, start: 'top 90%' } }));
});
if (reduce) $$('.stmt .w').forEach((w) => (w.style.opacity = 1));

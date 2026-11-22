import '@fontsource-variable/space-grotesk';
import '@fontsource/jetbrains-mono/400.css';
import '../styles/base.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { site } from '../data/site.js';

gsap.registerPlugin(ScrollTrigger);

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
export const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

// Project URL: real folder pages in production (indexable, made by scripts/postbuild.mjs); query page in dev.
export const workUrl = (id) => (import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}project.html?id=${encodeURIComponent(id)}`
  : `${import.meta.env.BASE_URL}work/${encodeURIComponent(id)}/`);

export const splitChars = (el) => {
  const t = el.textContent;
  el.setAttribute('aria-label', t);
  el.classList.add('c3d');
  // words stay unbroken (nowrap) so long titles wrap between words, never mid-word
  el.innerHTML = t.split(' ').map((w) => `<span class="wd" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join('')}</span>`).join(' ');
};

const nav = `
<nav class="top mono">
  <a class="brand" href="/"><span>NP — ${site.city.toUpperCase()}</span></a>
  <div class="links">
    <a href="/works.html"><span>Work</span></a>
    <a href="/#games"><span>Games</span></a>
    <a href="/#code"><span>Code</span></a>
    <a href="/#about"><span>About</span></a>
    <a href="/#contact"><span>Contact</span></a>
  </div>
</nav>`;

const defs = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="pal" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f72585"/><stop offset=".25" stop-color="#7209b7"/><stop offset=".5" stop-color="#3a0ca3"/><stop offset=".75" stop-color="#4361ee"/><stop offset="1" stop-color="#4cc9f0"/></linearGradient>
  <filter id="dist" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".008 .02" numOctaves="1" seed="3" result="n"/><feDisplacementMap id="dmap" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs></svg>`;

const sticker = `
<svg class="sticker" id="stk" viewBox="0 0 110 110" aria-hidden="true"><defs><path id="circ" d="M55,55 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"/></defs><text><textPath href="#circ">AVAILABLE FOR WORK • LET'S TALK •</textPath></text><circle cx="55" cy="55" r="5" fill="#fff"/></svg>`;

export function initCommon({ cursor = true } = {}) {
  document.body.insertAdjacentHTML('afterbegin', `${defs}<div class="curtain" id="curtain"></div><div class="cur" id="cur"></div><div class="bar"></div>${sticker}${nav}`);

  // smooth scroll
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.to('.bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  gsap.to('#stk', { rotation: 720, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  // cursor with data-cursor labels
  const cur = $('#cur');
  if (fine && cursor) {
    document.documentElement.classList.add('has-cur');
    const cx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest?.('[data-cursor]');
      if (t) { cur.textContent = t.dataset.cursor; cur.classList.add('has'); }
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest?.('[data-cursor]')) { cur.textContent = ''; cur.classList.remove('has'); }
    });
  } else cur.remove();

  // page transition: gradient curtain
  const curtain = $('#curtain');
  if (sessionStorage.getItem('pt')) {
    sessionStorage.removeItem('pt');
    gsap.set(curtain, { yPercent: -101 + 101 }); // covering
    gsap.set(curtain, { y: 0 });
    gsap.to(curtain, { yPercent: -101, duration: 0.8, ease: 'expo.inOut', delay: 0.05 });
  } else gsap.set(curtain, { yPercent: 101 });
  addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { yPercent: 101 }); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.hash) { // in-page anchor => smooth scroll
      const t = $(u.hash); if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' }); }
      return;
    }
    if (u.pathname === location.pathname && u.search === location.search) return;
    e.preventDefault();
    sessionStorage.setItem('pt', '1');
    gsap.set(curtain, { yPercent: 101 });
    gsap.to(curtain, { yPercent: 0, duration: 0.6, ease: 'expo.inOut', onComplete: () => { location.href = u.href; } });
  });

  return { lenis };
}

// Open the link of a pending #hash after the page is ready (arriving from another page).
export function scrollToHash(lenis) {
  if (!location.hash) return;
  const t = $(location.hash);
  if (t) setTimeout(() => (lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView()), 100);
}

// Tilt-on-hover + hover distortion for a card (shared by home rail and works grid).
export function tilt(card, inner, { distort = true } = {}) {
  card.addEventListener('pointermove', (e) => {
    if (card.dataset.drag === '1') return;
    const b = card.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
    gsap.to(inner, { rotateY: (px - 0.5) * 16, rotateX: -(py - 0.5) * 16, duration: 0.4, ease: 'power3' });
    inner.style.setProperty('--gx', px * 100 + '%'); inner.style.setProperty('--gy', py * 100 + '%');
  });
  card.addEventListener('pointerleave', () => gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3' }));
  if (distort) card.addEventListener('pointerenter', () => {
    if (card.dataset.drag === '1' || reduce) return;
    inner.style.filter = 'url(#dist)';
    gsap.fromTo('#dmap', { attr: { scale: 0 } }, { attr: { scale: 60 }, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1, onComplete: () => { inner.style.filter = ''; } });
  });
}

export { gsap, ScrollTrigger };

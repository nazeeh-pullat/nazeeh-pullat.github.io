// Exports game icons + hover-reel frames from the Unity project folders into public/games/<id>/ as small WebP files.
// Run: npm run assets
import sharp from 'sharp';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const U = 'C:\\Users\\nazee\\Desktop\\Unity';
const OUT = fileURLToPath(new URL('../public/games/', import.meta.url));

const abyssalShots = (() => {
  const d = join(U, 'Abyssal Feast', 'StoreAssets', 'V1');
  const f = readdirSync(d).filter((n) => n.endsWith('.png')).sort();
  return [16, 26, 19, 12, 28, 9, 21, 29].filter((i) => i < f.length).map((i) => join(d, f[i]));
})();

const ATR = join(U, 'After the Roads Version 2', 'AfterTheRoads', 'Assets', '_Game', 'Art');
const KK = join(U, 'Kitty Kafe');
const LO = join(U, 'Last Orbit');

// After the Roads / Kitty Kafe / Last Orbit now have real in-game captures (scripts/export-captures.mjs): their reel is NOT regenerated here (reel: null).
const games = {
  'abyssal-feast': {
    icon: join(U, 'Abyssal Feast', 'Abyssal Feast', 'Resources', 'Resources', 'Logo', 'v1', 'app_icon_1.png'),
    reel: abyssalShots,
  },
  'after-the-roads': {
    icon: join(ATR, 'UI', 'logo.png'),
    reel: null,
  },
  'kitty-kafe': {
    icon: join(KK, 'KittyKafeGame', 'Assets', 'Editor', 'AppIcon.png'),
    reel: null,
  },
  'last-orbit': {
    icon: join(LO, 'Assets', 'Art', 'Textures', 'Splash', 'app_icon_rounded_box.png'),
    reel: null,
  },
};

for (const [id, g] of Object.entries(games)) {
  const dir = join(OUT, id);
  mkdirSync(dir, { recursive: true });
  if (!existsSync(g.icon)) { console.warn('missing icon', g.icon); }
  else await sharp(g.icon).resize(384, 384, id === 'after-the-roads' ? { fit: 'contain', background: '#1b1209' } : { fit: 'cover' }).webp({ quality: 86 }).toFile(join(dir, 'icon.webp'));
  let n = 0;
  for (const src of g.reel || []) {
    if (!existsSync(src)) { console.warn('missing frame', src); continue; }
    n++;
    await sharp(src, { limitInputPixels: false }).resize(960, 540, { fit: 'cover' }).webp({ quality: 70 }).toFile(join(dir, `f${n}.webp`));
  }
  console.log(id, g.reel ? 'icon + ' + n + ' frames' : 'icon only (real captures kept)');
}


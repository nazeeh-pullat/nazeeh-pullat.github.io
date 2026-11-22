// Exports REAL in-game captures (taken from Unity play-mode runs on project copies) into public/games/<id>/f1..fN.webp (960x540) and the gameplay clip.
// Run: node scripts/export-captures.mjs   (sources live outside the repo, in C:\Users\nazee\UnityCaptureWork; the exported files are committed)
import sharp from 'sharp';
import { readFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 'C:\\Users\\nazee\\UnityCaptureWork';
const OUT = fileURLToPath(new URL('../public/games/', import.meta.url));
const png = (a) => a.map((n) => n + '.png');
const sets = {
  'after-the-roads': { dir: join(W, 'ATR', 'Screenshots'), frames: png(['play_r_intro1', 'play_r_bag', 'play_r_gas', 'play_r_garage', 'play_r_drive_moving', 'play_r_onfoot', 'play_r_shop', 'play_r_map']), clip: join(W, 'clips', 'atr.mp4') },
  'kitty-kafe': { dir: join(W, 'KK', 'bot_shots'), frames: png(['r0_two_dishes', 'r0_group_table', 'r0_happy', 'r0_panel_win', 'r1_busy_1', 'r1_group_table', 'r1_two_dishes', 'r1_happy']), clip: join(W, 'clips', 'kk.mp4') },
  'last-orbit': { dir: join(W, 'LO_out'), frames: png(['00_start', '03_tutorial', '04_build_a', '06_station', '06b_station_side', '07_raid_a', '08_raid_b', '10_raid_d']), clip: join(W, 'clips', 'lo.mp4') },
};
for (const [id, s] of Object.entries(sets)) {
  const dir = join(OUT, id); mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= 12; i++) rmSync(join(dir, `f${i}.webp`), { force: true });
  let n = 0;
  for (const f of s.frames) {
    const p = join(s.dir, f);
    if (!existsSync(p)) { console.warn('missing', p); continue; }
    n++;
    await sharp(readFileSync(p)).resize(960, 540, { fit: 'cover' }).webp({ quality: 70 }).toFile(join(dir, `f${n}.webp`));
  }
  if (existsSync(s.clip)) copyFileSync(s.clip, join(dir, 'gameplay.mp4'));
  console.log(id, n, 'frames', existsSync(s.clip) ? '+ gameplay.mp4' : '');
}

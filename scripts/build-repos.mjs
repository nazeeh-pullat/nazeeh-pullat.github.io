// Snapshots your public GitHub repos into src/data/repos.json (run: npm run repos, then rebuild the site).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const USER = 'nazeeh-pullat';
const HIDE = new Set([USER.toLowerCase(), 'abyssal-feast']); // profile repo + the game site (shown in Games)
const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' } });
if (!res.ok) throw new Error('GitHub API ' + res.status);
const repos = (await res.json())
  .filter((r) => !r.fork && !HIDE.has(r.name.toLowerCase()))
  .map((r) => ({ name: r.name, title: r.name.replace(/[-_]+/g, ' ').trim(), description: r.description || '', language: r.language || '', url: r.html_url, homepage: r.homepage || '', stars: r.stargazers_count, pushed: r.pushed_at.slice(0, 10) }));
writeFileSync(fileURLToPath(new URL('../src/data/repos.json', import.meta.url)), JSON.stringify(repos, null, 1));
console.log(repos.length + ' repos');

// Games shown on the home page. `frames` are the hover "gameplay" reel (exported by `npm run assets`).
// After the Roads, Kitty Kafe and Last Orbit use REAL in-game captures (node scripts/export-captures.mjs); `npm run assets` only refreshes their icons.
// To use a real gameplay clip instead, drop an .mp4 in public/games/<id>/ and set `video: 'games/<id>/gameplay.mp4'`.
export const games = [
  {
    id: 'abyssal-feast',
    name: 'Abyssal Feast',
    status: 'released',
    tagline: 'Eat. Grow. Rule the reef.',
    blurb: 'A fast, colourful underwater survival game. Swim with one thumb, eat what is smaller, outrun what is bigger. 35 levels, boss fights and 570+ accessories. Plays offline, no ads.',
    platforms: ['Android', 'Windows'],
    frames: 8,
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.nazeehpullat.abyssalfeast' },
      { label: 'itch.io', href: 'https://n-p-games.itch.io/abyssal-feast' },
      { label: 'Website', href: 'https://nazeeh-pullat.github.io/Abyssal-Feast/' },
    ],
  },
  {
    id: 'after-the-roads',
    name: 'After the Roads',
    status: 'in development',
    tagline: 'Survival Journey',
    blurb: 'A post-collapse road-trip survival game: keep the RV running, scavenge and survive the next town.',
    platforms: [],
    frames: 8,
    video: 'games/after-the-roads/gameplay.mp4',
    links: [],
  },
  {
    id: 'kitty-kafe',
    name: 'Kitty Kafe',
    status: 'in development',
    tagline: 'Whiskerland Adventure',
    blurb: 'A cosy cat-diner management game with regions, recipes and a whole kitten crew.',
    platforms: [],
    frames: 8,
    video: 'games/kitty-kafe/gameplay.mp4',
    links: [],
  },
  {
    id: 'last-orbit',
    name: 'Last Orbit',
    status: 'in development',
    tagline: 'Modular space-station builder',
    blurb: 'Build and defend a persistent space station: connect modules, manage oxygen and resources, survive raids.',
    platforms: [],
    frames: 8,
    video: 'games/last-orbit/gameplay.mp4',
    links: [],
  },
];

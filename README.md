# The Midnight Calendar

A private, romantic birthday surprise: a passcode-gated calendar that unlocks a
new photo every day at midnight (Hong Kong time) from **26 September to
26 October 2026**, with a mini-game surprise every Saturday — and on the final
night.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4. No backend; the build is a
static site that deploys straight to GitHub Pages.

```bash
npm install     # once
npm run dev     # local development
npm run build   # production build → dist/
npm run preview # preview the production build
npm run lint    # oxlint
```

## Deploying to GitHub Pages

The repo includes `.github/workflows/deploy.yml`. To go live:

1. Push this project to a GitHub repository.
2. In the repository: **Settings → Pages → Source → "GitHub Actions"**.
3. Push to `main` (or run the workflow manually). The site appears at
   `https://<username>.github.io/<repo>/`.

`vite.config.ts` already sets `base: './'`, so asset paths work from any
subpath. No other configuration is needed.

## How it works

- **Theme** — the site has a light romantic palette: a greyish-pink mauve
  background with animated rose petals drifting across the page (canvas in
  `src/components/PetalCanvas.tsx`, disabled under `prefers-reduced-motion`).
- **Passcode gate** — `src/components/Gate.tsx`. The visitor phrase is
  `PASSCODE` in `src/lib/config.ts` (currently `NOONDAYGUN`, compared
  case-insensitively). A successful visitor unlock is remembered in
  `localStorage` (key `midnight-calendar-unlocked-v1`); clearing site
  storage (or the reset tool at the bottom of the About section) brings
  the gate back.
- **Hidden admin mode** — the same gate also accepts `ADMIN_PASSCODE`
  (currently `1234567890`; same grid length as the visitor phrase). It
  opens a hidden admin session that never touches `localStorage`, with a
  banner (`src/components/AdminBanner.tsx`) that lets the owner pick any
  Hong Kong date+time. The override drives everything — the nav countdown,
  and whether each day's photo/game icons are enabled — just like a real
  clock reading. "Use real time" clears the override; "Exit admin" ends
  the session.
- **Time locks** — `src/lib/time.ts`. Every date unlocks at 00:00 UTC+8.
  The nav-bar countdown and the calendar re-check every second, so days
  open on their own at midnight even if the page is left open.
- **Calendar** — `src/components/Calendar.tsx`. The surprise period and
  the months shown are configured in `src/lib/config.ts` (`START_DATE`,
  `END_DATE`, `CALENDAR_MONTHS`). Saturdays inside the period plus the
  final day get a mini-game icon (`hasMiniGame`).

## Swapping in the real content

All of these places are marked with comments in the code:

1. **Daily photos** — until bespoke entries are added, every day opens the
   shared `public/photos/placeholder.jpg` (see `PHOTO_FALLBACK` and
   `PHOTO_FALLBACK_CAPTION` in `src/lib/config.ts`). When the real photos
   are ready, drop image files in `public/photos/` and add one entry per
   day to `PHOTOS`, e.g. `'2026-09-26': './photos/2026-09-26.jpg'`
   (keep paths relative with a leading `./` so GitHub Pages project URLs
   keep working).
2. **Mini-game secrets** — fill in `SECRETS` in `src/lib/config.ts`, keyed
   by date. Mini-game days: `2026-09-26`, `2026-10-03`, `2026-10-10`,
   `2026-10-17`, `2026-10-24`, `2026-10-26`.
3. **Mini-games** — `src/components/MiniGame.tsx` has a clearly marked
   placeholder panel. Replace it with the real game; the only contract is
   to call `handleWin()` when the player wins, which persists the win and
   reveals the day's secret.

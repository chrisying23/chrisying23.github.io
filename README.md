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

- **Passcode gate** — `src/components/Gate.tsx`. The phrase is checked in
  `src/lib/config.ts` (`PASSCODE`, currently `NOONDAYGUN`, i.e. "NOONDAY GUN",
  compared case-insensitively, spaces ignored). Until it is entered, only the
  gate is rendered — the calendar and About sections are never mounted, so no
  URL or navigation can reach them. A successful unlock is remembered in
  `localStorage` (key `midnight-calendar-unlocked-v1`); clearing site storage
  (or the reset tool at the bottom of the About section) brings the gate back.
- **Time locks** — `src/lib/time.ts`. Every date unlocks at 00:00 UTC+8. The
  nav-bar countdown and the calendar re-check every second, so days open on
  their own at midnight even if the page is left open.
- **Calendar** — `src/components/Calendar.tsx`. The surprise period and the
  months shown are configured in `src/lib/config.ts` (`START_DATE`, `END_DATE`,
  `CALENDAR_MONTHS`). Saturdays inside the period plus the final day get a
  mini-game icon (`hasMiniGame`).

## Swapping in the real content

All of these places are marked with comments in the code:

1. **Daily photos** — drop image files in `public/photos/`, then add one entry
   per day to `PHOTOS` in `src/lib/config.ts`:
   `'2026-09-26': './photos/2026-09-26.jpg'`. Days without an entry show an
   auto-generated placeholder card.
2. **Mini-game secrets** — fill in `SECRETS` in `src/lib/config.ts`, keyed by
   date. Mini-game days: `2026-09-26`, `2026-10-03`, `2026-10-10`,
   `2026-10-17`, `2026-10-24`, `2026-10-26`.
3. **Mini-games** — `src/components/MiniGame.tsx` has a clearly marked
   placeholder panel. Replace it with the real game; the only contract is to
   call `handleWin()` when the player wins, which persists the win and reveals
   the day's secret.

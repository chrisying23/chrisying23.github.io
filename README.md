# YanYan's Surprise Birthday Calendar

A private, romantic birthday surprise: a passcode-gated calendar that unlocks a
new photo every day at midnight (Hong Kong time) from **26 September to
26 October 2026**, with a mini-game surprise on five special evenings — every
Saturday in October, and the final night.

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
  `END_DATE`, `CALENDAR_MONTHS`). The five mini-game days are listed in
  `GAME_DATES` (`hasMiniGame`); note that 26 September is a photo-only day.
- **Daily comic pages** — each day's photo icon opens the next two pages of
  the comic *Muiju: The Rise of the Household Empress*
  (`comic/muiju-household-empress/`), imported via `import.meta.glob` in
  `src/lib/config.ts` and mapped automatically: 26 September shows the
  cover followed by pages 1–2, and every later day the next two pages,
  ending with pages 61–62 on 26 October.
- **Mini-games** — one component per day in `src/components/games/`, routed
  by date in `src/components/MiniGame.tsx`:
  - `2026-10-03` — **Wordle** (`WordleGame.tsx`), a faithful dark-theme
    clone of the official game with unlimited tries. Answer, hint and win
    message: `WORDLE_*` in `src/lib/config.ts`.
  - `2026-10-10` — **Emoji guess** (`EmojiGame.tsx`), decode two emoji
    clusters (Bruno Fernandes → BRUNO, planet + rocket → MARS) and type
    the answer into the letter boxes. Answer/win: `EMOJI_*`.
  - `2026-10-17` — **Hangman** (`HangmanGame.tsx`), full clickable
    alphabet. Answer/hint/win: `HANGMAN_*`.
  - `2026-10-24` — **Photo reveal** (`PhotoGame.tsx`), a hinted
    photograph (`public/photos/location.jpg`, `LOCATION_PHOTO`). Hint:
    `PHOTO_GAME_HINT`.
  - `2026-10-26` — **Cryptic finale** (`CrypticGame.tsx`), the same
    letter-box grid as the gate. Clue/answer/win: `FINALE_*`.
  The only contract a game must honour is calling `onWin()` when the player
  wins, which persists the win and keeps the celebration visible on later
  visits.

## Swapping in the real content

**Daily photos** — the daily reveals are the comic pages described above;
no placeholder is shown anymore. The 24 October mini-game (`PhotoGame.tsx`)
shows `public/photos/location.jpg` (`LOCATION_PHOTO` in `src/lib/config.ts`)
— swap that file (or point the constant elsewhere) to change the photo.

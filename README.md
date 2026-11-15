# AI Engineer Plan: study tracker

A static, installable study tracker for the 6-month plan (1 Dec 2026 to 31 May 2027).
No build step, no dependencies: plain HTML, CSS and JavaScript.

## What it does

- **Today**: the exact session for the day, with resource links, tick-boxes and a notes field. Use the arrows (or ← / → on a keyboard) to move between days. Rest days show what's next.
- **Catch up**: tasks you missed from earlier sessions appear under today's session.
- **Plan**: every session, month by month and week by week.
- **Progress**: overall %, % per month, current and best streak, sessions done, hours studied, a calendar heatmap, and the freelance-ready checklist.
- **Backup**: export and import your progress as JSON (Progress → Your data).
- **Works offline and installs as an app** (Add to Home Screen on iPhone, or Install on Android and desktop Chrome).

## Schedule

| Day | Session |
| --- | --- |
| Tue, Thu | 1.5 h evening |
| Sat | 3 h |
| Sun | 2 h |
| Mon, Wed, Fri | Rest |

That is 8 h a week, the bottom of your 8 to 10 h budget, which leaves room to slip.
24, 26 and 31 December are holidays. 2 January is a catch-up session for December.
Streaks count consecutive **study sessions** completed, so rest days never break them.

## Deploy

### GitHub Pages
1. Create a repo (for example `ai-study-tracker`) and push these files to the root of `main`.
2. In the repo, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
3. The site goes live at `https://<your-username>.github.io/ai-study-tracker/`. All paths are relative, so it works from a subfolder.

### Cloudflare Pages
1. **Workers & Pages → Create → Pages**, then either connect the GitHub repo or choose **Upload assets** and drag in this folder.
2. Leave the build command empty and set the output directory to `/`.

To test locally, run `python3 -m http.server` in this folder and open http://localhost:8000.
The service worker only runs over http(s), not from `file://`.

## Editing the plan

All content is in `plan.js`. Each session is `{ t: 'Title', tasks: [['Task text', 'optional url']] }`.
Sessions fill the study days of their month in order. If a month has more sessions than study days, the browser console shows a warning.
If it has fewer, the leftover days become "Catch-up and review" sessions.

Progress is stored by position (month → session → task). Editing text is safe. If you insert or reorder sessions in a month you've already started, ticks stay with the old positions, so export a backup first.

**After any edit, bump `VERSION` in `sw.js`** so installed copies pick up the change.

## Your data

Progress lives in your browser's `localStorage` under `ai-study-tracker:v1`. It doesn't sync between devices.
Use **Export backup** and **Import** to move it, or keep a copy.

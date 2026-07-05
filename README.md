# ⚽ FIFA World Cup 2026 — Interactive Bilingual Guide / Интерактивен двуезичен справочник

An unofficial, fully static fan website about the **2026 FIFA World Cup** (Canada · Mexico · United States), available in **English** and **Bulgarian** with a one-click language switch.

Built from the Wikipedia article [2026 FIFA World Cup](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup) (CC BY-SA 4.0). Results and statistics as of **July 5, 2026**.

## Features
- 📸 Real stadium photography for all 16 venues (Wikimedia Commons, stored locally in `assets/venues/`)
- 🌐 EN/БГ language toggle (remembered between visits)
- ⏱️ Live countdown to the Final (July 19, MetLife Stadium)
- 🏟️ All 16 host cities & stadiums, filterable by country
- 🚩 All 48 teams with flags, searchable and filterable by confederation
- 📊 All 12 group tables computed from the actual 72 match results
- 🏆 Full Round of 32 and Round of 16 results, road to the Final
- 💰 Prize money, records, top scorers, mascots, match ball, culture
- 📱 Fully responsive — works on desktop and mobile, no build step, no dependencies

## Run locally
Just open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy to GitHub Pages
1. Create a new repository on GitHub (e.g. `worldcup2026`).
2. Push this folder:
   ```
   git init
   git add .
   git commit -m "World Cup 2026 bilingual site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/worldcup2026.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / (root) → Save**.
4. After ~1 minute the site is live at `https://<your-username>.github.io/worldcup2026/`.

## Credits & license
- Text content adapted from Wikipedia, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Stadium photos from [Wikimedia Commons](https://commons.wikimedia.org) (free licenses).
- Flag images served by [flagcdn.com](https://flagpedia.net). Fonts: Unbounded & Manrope via Google Fonts.
- Not affiliated with or endorsed by FIFA.

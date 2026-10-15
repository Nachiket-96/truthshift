# 🧭 TruthShift — RODS Tech Skills Showcase 2026

A web app that helps people (especially newcomers to Regina) make purchasing decisions based on **their own** values,
while staying honest about what is **verified**, what is a **business claim**, and what is **unknown**.

## Run it
```
cd prototype
python -m http.server 8000      # or: npx serve .
```
Open http://localhost:8000. No install and no build step.
(The camera scanner needs `localhost` or https. For phones, deploy to GitHub Pages or Netlify, or type the barcode.)

## Hosted version (claude.ai Artifact)
`node build-artifact.mjs` bundles everything into `dist/truthshift-artifact.html`, which is then published as an Artifact.
- In the hosted version, **Ask TruthShift** also gets a real **Claude** answer in the selected language, using only our data.
- Things that are blocked inside an Artifact, and what replaces them:
  - Camera → upload a photo of the barcode
  - Location → area picker
  - Map tiles → drawn outline map
  - Open Food Facts lookup → no replacement

  The localhost version keeps all of these features.

## Features
| Tab | What it does |
|---|---|
| ⚖️ My priorities | 7 sliders + presets; saved in the browser |
| 📷 Scan & search | Barcode camera scan / search → personal score, confidence, per-factor evidence badges, Canadian-content tier, Regina recycling tip, cheaper/better alternatives |
| 📊 Compare | Side-by-side table for a category, sorted by *your* score |
| 💬 Ask TruthShift | Plain-language questions ("Canadian, no plastic, under $5") → ranked answers using only our data |
| 📍 Nearby | OpenStreetMap of Regina stores with distance + top picks per store |

Unknown barcodes fall back to **Open Food Facts** live (try `3017620422003`).

## Scoring (explainable)
- Personal score = weighted average of the factors **you** care about.
- ✔ Verified counts 100%, ⚠ Claimed counts 60%. **? Unknown is excluded, not scored as zero**. It lowers *confidence* instead.
- N/A factors (e.g. animal welfare for pasta) are ignored.
- Affordability is relative to other products in the same category.

## Customize
- **Add products / stores:** edit `data.js` only.
- **Change scoring rules:** `scoring.js` (`STATUS_TRUST`, `DEFAULT_WEIGHTS`).
- **Add a language:** add a dictionary to `I18N` in `app.js`.
- **Real AI:** replace `answerQuestion()` in `scoring.js` with an LLM call that only ranks our data.

## Files
`index.html` (layout) · `styles.css` · `data.js` (synthetic dataset) · `scoring.js` (engine + Open Food Facts + assistant) · `app.js` (UI)

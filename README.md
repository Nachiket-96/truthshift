# TruthShift

This is our project for the **RODS Tech Skills Showcase 2026** challenge, "The Ethical Consumer Compass" (Regina Open Door Society).

The app scores grocery products against each shopper's own values: Buy Canadian, Support Regina, fair trade, animal welfare, environment, packaging and price. Every fact is labelled **Verified**, **Claimed** or **Unknown**, and unknown facts never count against a product.

## What's in this repo

| Folder | What it is |
| --- | --- |
| [`truthshift/`](truthshift/) | **The app**: React frontend and Python FastAPI backend, with run instructions in its README |
| [`deliverables/`](deliverables/) | PowerPoint presentation and Word documentation, plus the scripts that generate them |
| [`prototype/`](prototype/) | First prototype: a single-page HTML/JS version with no install needed |
| [`presentation/`](presentation/) | Source files of the online slide version |

## Quick start

```bash
# Backend → http://localhost:8000 (API docs at /docs)
cd truthshift/backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# Frontend → http://localhost:5173 (in a second terminal)
cd truthshift/frontend
npm install
npm run dev
```

## Data

- **46 demo products** with fictional brands (synthetic data, which the challenge allows)
- **72 real products** sold in Canada, imported from [Open Food Facts](https://world.openfoodfacts.org) (ODbL licence)
- **10 Regina stores** at approximate locations

See [`deliverables/TruthShift_Documentation.docx`](deliverables/TruthShift_Documentation.docx) for the full write-up.

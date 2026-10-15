# TruthShift

Our project for the RODS Tech Skills Showcase 2026 challenge, "The Ethical Consumer Compass". It is a web app that scores grocery products against each shopper's own values and shows how sure it is about every fact: **Verified**, **Claimed** or **Unknown**. Unknown facts never count against a product.

- **Frontend:** React 19 + Vite
- **Backend:** Python FastAPI
- **Data:** JSON files plus the Open Food Facts API
- **AI (optional):** Claude API

## Run it

Two terminals:

```bash
# 1. Backend → http://localhost:8000  (interactive API docs: http://localhost:8000/docs)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# 2. Frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

**Optional AI answers:** set an Anthropic API key before starting the backend:
- PowerShell: `$env:ANTHROPIC_API_KEY="sk-ant-..."`
- bash: `export ANTHROPIC_API_KEY=sk-ant-...`

Without a key, "Ask TruthShift" still ranks products using the rule-based engine.

## Folders

```
backend/
  app/main.py            API endpoints
  app/scoring.py         scoring engine (weights × evidence trust, confidence)
  app/assistant.py       Ask TruthShift: rule-based ranking + Claude answer
  app/openfoodfacts.py   Open Food Facts mapping + live barcode lookup
  app/data.py            loads the JSON dataset
  data/products_synthetic.json   46 demo products (fictional brands)
  data/products_off.json         real products imported from Open Food Facts
  data/stores.json               10 Regina stores (approximate locations)
  data/reference.json            factor names + Canadian-content tiers
  scripts/import_off.py          re-import real products: python -m scripts.import_off
  scripts/export_synthetic.js    how the synthetic JSON was first generated
frontend/
  src/App.jsx            layout, tabs, shared state
  src/components/        Priorities, ScanSearch, ProductDetail, Compare, Ask, Nearby, ui
  src/i18n.js            English, French, Gujarati screen text
  src/api.js             calls to the backend
```

## Customize

| To change | Edit |
| --- | --- |
| Products, stores | `backend/data/*.json`, then restart the backend |
| Trust levels, default weights | `backend/app/scoring.py` |
| Languages | `frontend/src/i18n.js` |
| Presets | `frontend/src/components/Priorities.jsx` |

## Data honesty

- Products marked "Demo data" are fictional: invented brands, certifications and prices.
- Products marked "Real · Open Food Facts" come from a crowd-sourced database. All their facts are "claimed", and they have no prices.
- Store coordinates are approximate.

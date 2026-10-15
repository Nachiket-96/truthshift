#!/usr/bin/env bash
# TruthShift - start the app on Mac or Linux: ./start.sh   (needs Python 3.10+ and Node.js 20+)
cd "$(dirname "$0")"
python3 -m pip install -q -r backend/requirements.txt
[ -d frontend/node_modules ] || (cd frontend && npm install)
(cd backend && python3 -m uvicorn app.main:app --port 8000) &
BACKEND=$!
trap 'kill $BACKEND' EXIT
echo "Laptop: https://localhost:5173  ·  Phone: use the 'Network: https://...' address below (same Wi-Fi)"
echo "Browser warning 'not private' is expected: Advanced → Proceed."
cd frontend && npm run dev

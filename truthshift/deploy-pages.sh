#!/usr/bin/env bash
# Publishes the online demo to https://nachiket-96.github.io/truthshift/
# Builds the frontend in "pages" mode (no backend; the API runs in the browser)
# and pushes the result to the gh-pages branch. Run from anywhere: bash truthshift/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/frontend"

npm run build:pages
touch dist/.nojekyll

REMOTE="$(git -C .. remote get-url origin)"
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C ../.. config user.name)" -c user.email="$(git -C ../.. config user.email)" \
  commit -q -m "Deploy TruthShift online demo"
git push -q --force "$REMOTE" gh-pages
rm -rf .git
echo "Published. Live in about a minute at https://nachiket-96.github.io/truthshift/"

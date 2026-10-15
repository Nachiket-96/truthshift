"""Import REAL products sold in Canada from Open Food Facts → backend/data/products_off.json

Open Food Facts is a free, crowd-sourced database (https://world.openfoodfacts.org, ODbL licence).
Because volunteers enter the data, every fact imported here is marked "claimed", never "verified".
Prices and store availability are not in Open Food Facts, so they are left empty.

Run from the backend folder:  python -m scripts.import_off
Uses search.openfoodfacts.org; re-running keeps earlier products and only fills categories that have fewer than 6.
"""
import json
import time
from pathlib import Path

import httpx

from app.openfoodfacts import FIELDS, HEADERS, to_product

OUT = Path(__file__).resolve().parent.parent / "data" / "products_off.json"
# Our category name → Open Food Facts category tag
CATEGORIES = {
    "Peanut butter": "en:peanut-butters",
    "Coffee": "en:coffees",
    "Chocolate": "en:chocolates",
    "Pasta": "en:pastas",
    "Lentils & dal": "en:lentils",
    "Maple syrup": "en:maple-syrups",
    "Honey": "en:honeys",
    "Oats & cereal": "en:breakfast-cereals",
    "Tea": "en:teas",
    "Cheese": "en:cheeses",
    "Cooking oil": "en:canola-oils",
    "Milk": "en:milks",
}
PER_CATEGORY = 6
SEARCH = "https://search.openfoodfacts.org/search"


def normalize(hit: dict) -> dict:
    """The search service returns some text fields as lists; the product API returns strings."""
    return {k: ", ".join(v) if isinstance(v, list) and k not in ("labels_tags", "packaging_tags", "countries_tags") else v
            for k, v in hit.items()}


def main() -> None:
    # Keep what earlier runs imported; a category that fails this time keeps its old products.
    products = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else []
    seen = {p["barcode"] for p in products}
    have = {c: sum(p["category"] == c for p in products) for c in CATEGORIES}
    with httpx.Client(timeout=30, headers=HEADERS) as client:
        for category, tag in CATEGORIES.items():
            if have[category] >= PER_CATEGORY:
                print(f"{category}: already have {have[category]}", flush=True)
                continue
            # search.openfoodfacts.org is Open Food Facts' newer search service; the classic /api/v2/search is often overloaded.
            params = {"q": f'categories_tags:"{tag}" AND countries_tags:"en:canada"', "fields": FIELDS, "page_size": 30}
            found = None
            for attempt in range(2):
                try:
                    r = client.get(SEARCH, params=params)
                    r.raise_for_status()
                    found = [normalize(h) for h in r.json().get("hits", [])]
                    break
                except httpx.HTTPError as e:
                    print(f"{category}: attempt {attempt + 1} failed ({type(e).__name__}), waiting…", flush=True)
                    time.sleep(30 * (attempt + 1))
            if found is None:
                print(f"{category}: skipped", flush=True)
                continue
            kept = have[category]
            for p in found:
                prod = to_product(p, category)
                if prod and prod["barcode"] not in seen:
                    seen.add(prod["barcode"])
                    products.append(prod)
                    kept += 1
                if kept >= PER_CATEGORY:
                    break
            print(f"{category}: {kept}", flush=True)
            OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")  # save as we go
            time.sleep(2)  # be polite to the free service
    OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(products)} real products → {OUT}")


if __name__ == "__main__":
    main()

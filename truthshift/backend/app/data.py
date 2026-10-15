"""Loads the dataset from backend/data/*.json. Edit those JSON files to customize — no code changes needed."""
from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load(name: str, default):
    path = DATA_DIR / name
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


_reference = _load("reference.json", {})
FACTORS: dict = {**_reference.get("factors", {})}
ORIGIN_TIERS: dict = _reference.get("originTiers", {})
STORES: list[dict] = _load("stores.json", [])
PRODUCTS: list[dict] = _load("products_synthetic.json", []) + _load("products_off.json", [])

# Products looked up live by barcode during this run (Open Food Facts). Kept in memory only.
LIVE: dict[str, dict] = {}


def all_products() -> list[dict]:
    return PRODUCTS + list(LIVE.values())


def find_product(product_id: str) -> dict | None:
    return next((p for p in all_products() if p["id"] == product_id), None)


def find_by_barcode(code: str) -> dict | None:
    return next((p for p in all_products() if p["barcode"] == code), None)


def products_in_category(category: str) -> list[dict]:
    return [p for p in all_products() if p["category"] == category]


def categories() -> list[str]:
    seen: list[str] = []
    for p in all_products():
        if p["category"] not in seen:
            seen.append(p["category"])
    return seen

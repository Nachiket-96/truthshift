"""Open Food Facts: real, crowd-sourced product data (https://world.openfoodfacts.org, ODbL licence).

Volunteers enter this data, so every fact taken from it is marked "claimed", never "verified".
Prices and store availability are not in Open Food Facts and are left empty.
"""
from __future__ import annotations

import httpx

BASE = "https://world.openfoodfacts.org"
HEADERS = {"User-Agent": "TruthShift/1.0 (RODS student project)"}
SRC = "Open Food Facts (community data)"
FIELDS = ",".join([
    "code", "product_name", "brands", "quantity", "countries_tags", "manufacturing_places", "origins",
    "labels_tags", "ecoscore_grade", "packaging_tags", "packaging", "brand_owner",
])
EMOJI = {"Peanut butter": "🥜", "Coffee": "☕", "Chocolate": "🍫", "Pasta": "🍝", "Lentils & dal": "🫘", "Maple syrup": "🍁",
         "Honey": "🍯", "Oats & cereal": "🥣", "Tea": "🍵", "Cheese": "🧀", "Cooking oil": "🌻", "Milk": "🥛"}


def _fact(score, status, note, source=""):
    return {"score": score, "status": status, "note": note, "source": source}


def to_product(p: dict, category: str) -> dict | None:
    """Map one Open Food Facts record to our product shape."""
    name = (p.get("product_name") or "").strip()
    if not name or not p.get("code"):
        return None
    made = " ".join(filter(None, [p.get("manufacturing_places"), p.get("origins")])).strip()
    labels = " ".join(p.get("labels_tags") or [])
    pack = (" ".join(p.get("packaging_tags") or []) + " " + (p.get("packaging") or "")).lower()

    if "canad" in made.lower():
        canadian, tier = _fact(70, "claimed", f"Listed manufacturing place / origin: {made}", SRC), "made_in_canada"
    elif made:
        canadian, tier = _fact(0, "claimed", f"Listed manufacturing place / origin: {made}", SRC), "imported"
    else:
        canadian, tier = _fact(None, "unknown", "Manufacturing place not listed."), "unknown"

    fair = any(k in labels for k in ("fair-trade", "fairtrade", "max-havelaar", "rainforest-alliance"))
    fair_trade = (_fact(85, "claimed", "Fair-trade label recorded in the community database (not verified by us).", SRC)
                  if fair else _fact(None, "unknown", "No fair-trade label recorded. This does NOT mean unfair labour."))
    welfare = any(k in labels for k in ("free-range", "organic", "animal-welfare", "vegan"))
    animal = (_fact(75, "claimed", "Label(s) recorded: " + labels.replace("en:", ""), SRC)
              if welfare else _fact(None, "unknown", "No animal-welfare label recorded."))
    grade = (p.get("ecoscore_grade") or "").lower()
    gscore = {"a": 90, "b": 75, "c": 55, "d": 35, "e": 15}.get(grade)
    environment = (_fact(gscore, "claimed", f"Eco-Score {grade.upper()} (computed from community data).", SRC)
                   if gscore is not None else _fact(None, "unknown", "No Eco-Score."))
    if any(k in pack for k in ("plastic", "pet", "film")):
        packaging = _fact(30, "claimed", "Packaging listed: " + pack.strip()[:90], SRC)
    elif any(k in pack for k in ("glass", "cardboard", "paper", "carton", "metal", "can")):
        packaging = _fact(75, "claimed", "Packaging listed: " + pack.strip()[:90], SRC)
    else:
        packaging = _fact(None, "unknown", "Packaging not listed.")

    owner = p.get("brand_owner")
    return {
        "id": "off-" + p["code"], "barcode": p["code"], "emoji": EMOJI.get(category, "🛒"), "category": category,
        "name": name[:80], "brand": (p.get("brands") or "Unknown brand").split(",")[0].strip(),
        "price": None, "size": p.get("quantity") or "",
        "owner": {"name": owner or "Not confirmed", "status": "claimed" if owner else "unknown"},
        "originTier": tier,
        "factors": {"canadian": canadian, "local": _fact(None, "unknown", "Local ownership not known."),
                    "fairTrade": fair_trade, "animal": animal, "environment": environment, "packaging": packaging},
        "recycling": "Check the City of Regina waste guide for this packaging.",
        "stores": [], "source": "openfoodfacts",
        "sourceUrl": f"{BASE}/product/{p['code']}",
    }


async def lookup_barcode(code: str) -> dict | None:
    """Live lookup of one barcode. Returns None when the product isn't in Open Food Facts."""
    async with httpx.AsyncClient(timeout=15, headers=HEADERS) as client:
        r = await client.get(f"{BASE}/api/v2/product/{code}.json", params={"fields": FIELDS})
    if r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    if data.get("status") != 1 or not data.get("product"):
        return None
    return to_product({**data["product"], "code": code}, "Scanned products")

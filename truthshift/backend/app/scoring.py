"""Scoring engine — transparent and honest about uncertainty.

Personal score = weighted average of the factors the shopper cares about.
  verified facts count fully, claimed facts count 60%,
  unknown facts are LEFT OUT (never scored as zero) and lower the confidence instead,
  "na" (not applicable) facts are ignored completely.
"""
from __future__ import annotations

from .data import FACTORS, products_in_category

STATUS_TRUST = {"verified": 1.0, "claimed": 0.6, "unknown": 0.0}
DEFAULT_WEIGHTS = {"canadian": 4, "local": 3, "fairTrade": 3, "animal": 2, "environment": 3, "packaging": 2, "price": 3}


def fact(score, status, note, source=""):
    return {"score": score, "status": status, "note": note, "source": source}


def price_factor(product: dict) -> dict:
    """Affordability relative to other products in the same category (cheapest = 100)."""
    if product.get("price") is None:
        return fact(None, "unknown", "Price not available.")
    peers = [p["price"] for p in products_in_category(product["category"]) if p.get("price") is not None]
    lo, hi = min(peers), max(peers)
    score = 100 if hi == lo else round(100 * (hi - product["price"]) / (hi - lo))
    diff = product["price"] - lo
    note = "Cheapest option in this category." if diff <= 0.001 else f"${diff:.2f} more than the cheapest option."
    return fact(score, "verified", note, "Shelf price (demo)")


def confidence_label(c: float) -> str:
    return "High" if c >= 0.75 else "Medium" if c >= 0.45 else "Low"


def score_product(product: dict, weights: dict) -> dict:
    facts = {**product["factors"], "price": price_factor(product)}
    num = den = trusted = total_w = 0.0
    breakdown = []
    for key in FACTORS:
        w = float(weights.get(key, 0) or 0)
        f = facts.get(key) or fact(None, "unknown", "No data.")
        breakdown.append({"key": key, "weight": w, **f})
        if w == 0 or f["status"] == "na":
            continue
        total_w += w
        trust = STATUS_TRUST.get(f["status"], 0.0)
        trusted += w * trust
        if f["score"] is None or trust == 0:
            continue
        num += w * trust * f["score"]
        den += w * trust

    score = round(num / den) if den > 0 else None
    confidence = trusted / total_w if total_w > 0 else 0.0
    result = {"score": score, "confidence": round(confidence, 3), "confidenceLabel": confidence_label(confidence),
              "limitedData": confidence < 0.4,  # too few known facts: show the number, but flag it clearly
              "breakdown": breakdown}
    result["summary"] = explain(result)
    return result


def explain(result: dict) -> str:
    """Plain-language summary: top reasons plus honest caveats."""
    label = lambda b: FACTORS[b["key"]]["label"].lower()
    relevant = [b for b in result["breakdown"] if b["weight"] > 0 and b["status"] != "na"]
    known = sorted([b for b in relevant if b["score"] is not None and b["status"] != "unknown"],
                   key=lambda b: -b["weight"] * b["score"])
    strengths = [label(b) for b in known if b["score"] >= 70][:2]
    weaknesses = [label(b) for b in sorted([b for b in known if b["score"] < 45], key=lambda b: -b["weight"])][:2]
    claimed = [label(b) for b in relevant if b["status"] == "claimed"]
    unknowns = [label(b) for b in relevant if b["status"] == "unknown"]
    parts = []
    if strengths:
        parts.append(f"Strong on {' and '.join(strengths)}.")
    if weaknesses:
        parts.append(f"Weaker on {' and '.join(weaknesses)}.")
    if claimed:
        parts.append(f"Company claims (not independently verified): {', '.join(claimed)}.")
    if unknowns:
        parts.append(f"Unknown: {', '.join(unknowns)}. Not counted against it.")
    return " ".join(parts)


def rank_key(item: dict) -> float:
    """Sort by score, nudged toward products we know more about."""
    r = item["result"]
    return -(r["score"] or 0) * (0.5 + 0.5 * r["confidence"])

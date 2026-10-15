"""TruthShift — API.

Run:  uvicorn app.main:app --reload --port 8000     (from the backend/ folder)
Docs: http://localhost:8000/docs
"""
from __future__ import annotations

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import data
from .assistant import ask_claude, rule_based
from .openfoodfacts import lookup_barcode
from .scoring import DEFAULT_WEIGHTS, rank_key, score_product

app = FastAPI(
    title="TruthShift API",
    description="Scores products against a shopper's own values, and says how sure it is about every fact.",
    version="1.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class WeightsBody(BaseModel):
    weights: dict[str, float] = Field(default_factory=lambda: dict(DEFAULT_WEIGHTS),
                                      description="0-5 per factor: canadian, local, fairTrade, animal, environment, packaging, price")


class ScoreBody(WeightsBody):
    category: str | None = None
    q: str | None = Field(None, description="Search text: name, brand, category or barcode")


class AskBody(WeightsBody):
    question: str
    lang: str = "en"


def scored(product: dict, weights: dict) -> dict:
    return {"product": product, "result": score_product(product, weights)}


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/meta")
def meta():
    """Factors, origin tiers, categories, default weights and dataset counts."""
    products = data.all_products()
    return {
        "factors": data.FACTORS,
        "originTiers": data.ORIGIN_TIERS,
        "defaultWeights": DEFAULT_WEIGHTS,
        "categories": data.categories(),
        "counts": {
            "products": len(products),
            "synthetic": sum(p.get("source") == "synthetic" for p in products),
            "openfoodfacts": sum(p.get("source") == "openfoodfacts" for p in products),
            "stores": len(data.STORES),
            "categories": len(data.categories()),
        },
    }


@app.get("/api/stores")
def stores():
    return data.STORES


@app.post("/api/score")
def score(body: ScoreBody):
    """Every product (optionally filtered) with its personal score, confidence and breakdown."""
    products = data.all_products()
    if body.category:
        products = [p for p in products if p["category"] == body.category]
    if body.q:
        q = body.q.strip().lower()
        products = [p for p in products if any(q in str(p.get(k, "")).lower() for k in ("name", "brand", "category", "barcode"))]
    return [scored(p, body.weights) for p in products]


@app.post("/api/products/{product_id}")
def product_detail(product_id: str, body: WeightsBody):
    """One product with its breakdown, better alternatives in the same category, and where to buy it."""
    product = data.find_product(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    me = scored(product, body.weights)
    my_score = me["result"]["score"]
    peers = [scored(p, body.weights) for p in data.products_in_category(product["category"]) if p["id"] != product_id]
    better = [x for x in peers if x["result"]["score"] is not None and (my_score is None or x["result"]["score"] > my_score)]
    return {
        **me,
        "alternatives": sorted(better, key=rank_key)[:3],
        "stores": [s for s in data.STORES if s["id"] in product.get("stores", [])],
    }


@app.get("/api/barcode/{code}")
async def barcode(code: str):
    """Find a product by barcode: our dataset first, then a live Open Food Facts lookup."""
    if not code.isdigit() or not 8 <= len(code) <= 14:
        raise HTTPException(400, "A barcode is 8 to 14 digits.")
    product = data.find_by_barcode(code)
    if product:
        return {"product": product, "from": product.get("source", "synthetic")}
    try:
        product = await lookup_barcode(code)
    except httpx.HTTPError:
        raise HTTPException(502, "Couldn't reach Open Food Facts. Try again, or search by name.")
    if not product:
        raise HTTPException(404, "No information found for this barcode. That doesn't mean the product is bad, only unknown.")
    data.LIVE[product["id"]] = product
    return {"product": product, "from": "openfoodfacts-live"}


@app.post("/api/ask")
async def ask(body: AskBody):
    """Rule-based ranking (always) + Claude's answer (when API credentials are set)."""
    ranking = rule_based(body.question, body.weights)
    ai = await run_in_threadpool(ask_claude, body.question, body.weights, body.lang)
    return {
        "understood": {k: ranking[k] for k in ("detected", "usingProfile", "category", "budget")},
        "results": ranking["results"],
        "ai": ai,
    }

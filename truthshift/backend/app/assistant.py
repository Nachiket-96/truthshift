"""Ask TruthShift: answers plain-language shopping questions.

1. A rule-based parser always runs: it reads the priorities, category and budget from the question
   and ranks OUR products with the scoring engine. It needs no internet and never invents facts.
2. If Anthropic API credentials are available (ANTHROPIC_API_KEY), Claude also writes a short answer
   in the shopper's language, using ONLY the product data we send it.
"""
from __future__ import annotations

import json
import re

import anthropic

from .data import FACTORS, ORIGIN_TIERS, STORES, all_products, categories
from .scoring import rank_key, score_product

INTENTS = {
    "canadian": r"canad|maple",
    "local": r"regina|sask|local|small business|neighbou?r",
    "fairTrade": r"fair|labou?r|worker|ethical sourc",
    "animal": r"animal|cruelty|free.?range|humane|hens?",
    "environment": r"environment|eco|green|climate|organic|carbon",
    "packaging": r"plastic|packag|waste|recycl",
    "price": r"cheap|budget|afford|price|save|saving|low cost|money",
}
LANGUAGES = {"en": "English", "fr": "French", "gu": "Gujarati"}
MODEL = "claude-opus-5-5"

_client: anthropic.Anthropic | None = None


def parse_question(question: str, user_weights: dict) -> dict:
    q = question.lower()
    detected = [k for k, pattern in INTENTS.items() if re.search(pattern, q)]
    weights = {k: (5 if k in detected else 0) for k in FACTORS} if detected else user_weights
    category = None
    for c in categories():
        words = [w.rstrip("s") for w in re.split(r"[\s&]+", c.lower()) if len(w) > 3]
        if c.lower() in q or any(w in q for w in words):
            category = c
            break
    m = re.search(r"(?:under|below|less than|max|<)\s*\$?\s*(\d+(?:\.\d+)?)", q)
    budget = float(m.group(1)) if m else None
    return {"detected": detected, "usingProfile": not detected, "category": category, "budget": budget, "weights": weights}


def rule_based(question: str, user_weights: dict) -> dict:
    parsed = parse_question(question, user_weights)
    pool = [p for p in all_products() if p.get("price") is not None]  # ranked answers need a price
    if parsed["category"]:
        pool = [p for p in pool if p["category"] == parsed["category"]]
    if parsed["budget"] is not None:
        pool = [p for p in pool if p["price"] <= parsed["budget"]]
    items = [{"product": p, "result": score_product(p, parsed["weights"])} for p in pool]
    items = sorted([i for i in items if i["result"]["score"] is not None], key=rank_key)[:3]
    return {**parsed, "results": items}


def _facts_for_prompt(p: dict, weights: dict) -> dict:
    r = score_product(p, weights)
    return {
        "name": p["name"], "brand": p["brand"], "category": p["category"], "price": p.get("price"), "size": p.get("size"),
        "owner": p["owner"]["name"], "origin": ORIGIN_TIERS.get(p["originTier"], {}).get("label", "Unknown"),
        "yourScore": r["score"], "confidence": r["confidenceLabel"],
        "facts": {k: {"status": v["status"], "score": v["score"], "note": v["note"]} for k, v in p["factors"].items()},
        "stores": [s["name"] for s in STORES if s["id"] in p.get("stores", [])],
    }


SYSTEM = """You are the shopping assistant inside "TruthShift", a tool for newcomers to Regina, Saskatchewan.
Answer the shopper's question using ONLY the product data you are given. Never invent facts, brands, prices or stores.
- Each fact has a status: "verified" (confirmed by a certifier or government), "claimed" (the company says so, not confirmed), "unknown" (no information), "na" (not applicable). Say which kind of evidence supports each point.
- Unknown is not bad: never treat missing information as unethical. Say it is unknown.
- "Made in Canada" can include imported ingredients, so be precise about origin.
- Mention price trade-offs and where to buy when relevant.
- Recommend at most 3 products, best first, one or two short sentences each. If nothing fits, say so and suggest the closest option.
- Plain words, short sentences, no markdown. Under 160 words."""


def ask_claude(question: str, weights: dict, lang: str) -> dict:
    """Returns {"status": "ok"|"no_credentials"|"error", "text": str|None}."""
    global _client
    products = [_facts_for_prompt(p, weights) for p in all_products() if p.get("source") == "synthetic"]
    user = (f"Write your answer in {LANGUAGES.get(lang, 'English')}.\n\n"
            f"Shopper's saved priority weights (0-5): {json.dumps(weights)}\n"
            f"Product data (yourScore uses those weights): {json.dumps(products, ensure_ascii=False)}\n\n"
            f"Shopper's question: {question}")
    try:
        _client = _client or anthropic.Anthropic()
        response = _client.beta.messages.create(
            model=MODEL,
            max_tokens=4000,
            system=SYSTEM,
            messages=[{"role": "user", "content": user}],
            output_config={"effort": "low"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.AuthenticationError:
        return {"status": "no_credentials", "text": None}
    except anthropic.RateLimitError:
        return {"status": "error", "text": "Too many questions right now. Try again in a minute."}
    except anthropic.APIStatusError as e:
        return {"status": "error", "text": f"Claude is unavailable right now (HTTP {e.status_code})."}
    except anthropic.APIConnectionError:
        return {"status": "error", "text": "Couldn't reach Claude. Check the internet connection."}
    except Exception as e:  # missing credentials raise before any request is sent
        if "api_key" in str(e).lower() or "auth" in str(e).lower() or "credential" in str(e).lower():
            return {"status": "no_credentials", "text": None}
        raise

    if response.stop_reason == "refusal":
        return {"status": "error", "text": "Claude couldn't answer that. Try rephrasing the question."}
    text = "".join(b.text for b in response.content if b.type == "text").strip()
    return {"status": "ok", "text": text or None}

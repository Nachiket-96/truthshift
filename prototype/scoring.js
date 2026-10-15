// ============================================================
// Scoring engine — transparent & honest about uncertainty
// ============================================================

// How much each evidence type counts toward the score and the confidence.
// Unknown facts are NOT scored as 0 — they are left out and lower the confidence.
const STATUS_TRUST = { verified: 1.0, claimed: 0.6, unknown: 0 };

const DEFAULT_WEIGHTS = { canadian: 4, local: 3, fairTrade: 3, animal: 2, environment: 3, packaging: 2, price: 3 };

// Affordability is relative to other products in the same category (cheapest = 100).
function priceFactor(product, allProducts) {
  if (product.price == null) return f(null, "unknown", "Price not available.");
  const peers = allProducts.filter(p => p.category === product.category && p.price != null).map(p => p.price);
  const min = Math.min(...peers), max = Math.max(...peers);
  const score = max === min ? 100 : Math.round(100 * (max - product.price) / (max - min));
  const diff = product.price - min;
  const note = diff <= 0.001 ? "Cheapest option in this category." : `$${diff.toFixed(2)} more than the cheapest option.`;
  return f(score, "verified", note, "Shelf price (demo)");
}

function scoreProduct(product, weights, allProducts) {
  const facts = { ...product.factors, price: priceFactor(product, allProducts) };
  let num = 0, den = 0, trusted = 0, totalW = 0;
  const breakdown = [];

  for (const key of Object.keys(FACTORS)) {
    const w = Number(weights[key] || 0);
    const fact = facts[key] || f(null, "unknown", "No data.");
    breakdown.push({ key, weight: w, ...fact });
    if (w === 0 || fact.status === "na") continue;     // user doesn't care / not applicable
    totalW += w;
    const trust = STATUS_TRUST[fact.status] ?? 0;
    trusted += w * trust;
    if (fact.score == null || trust === 0) continue;   // unknown → excluded, not zero
    num += w * trust * fact.score;
    den += w * trust;
  }

  const score = den > 0 ? Math.round(num / den) : null;
  const confidence = totalW > 0 ? trusted / totalW : 0;
  return { score, confidence, breakdown };
}

function confidenceLabel(c) {
  if (c >= 0.75) return { text: "High", cls: "good" };
  if (c >= 0.45) return { text: "Medium", cls: "mid" };
  return { text: "Low", cls: "low" };
}

function scoreClass(s) {
  if (s == null) return "unknown";
  if (s >= 70) return "good";
  if (s >= 45) return "mid";
  return "low";
}

// Plain-language summary: top reasons + honest caveats
function explain(result) {
  const relevant = result.breakdown.filter(b => b.weight > 0 && b.status !== "na");
  const known = relevant.filter(b => b.score != null && b.status !== "unknown")
    .sort((a, b) => b.weight * b.score - a.weight * a.score);
  const strengths = known.filter(b => b.score >= 70).slice(0, 2).map(b => FACTORS[b.key].label.toLowerCase());
  const weaknesses = known.filter(b => b.score < 45).sort((a, b) => b.weight - a.weight).slice(0, 2).map(b => FACTORS[b.key].label.toLowerCase());
  const unknowns = relevant.filter(b => b.status === "unknown").map(b => FACTORS[b.key].label.toLowerCase());
  const claimed = relevant.filter(b => b.status === "claimed").map(b => FACTORS[b.key].label.toLowerCase());
  const parts = [];
  if (strengths.length) parts.push(`Strong on ${strengths.join(" and ")}.`);
  if (weaknesses.length) parts.push(`Weaker on ${weaknesses.join(" and ")}.`);
  if (claimed.length) parts.push(`Company claims (not independently verified): ${claimed.join(", ")}.`);
  if (unknowns.length) parts.push(`Unknown: ${unknowns.join(", ")} — not counted against it.`);
  return parts.join(" ");
}

// ============================================================
// Open Food Facts fallback for barcodes not in our dataset
// Crowd-sourced data → most facts are "claimed", never "verified".
// ============================================================
async function lookupOpenFoodFacts(barcode) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const src = "Open Food Facts (community data)";
  const text = s => (s || "").toString();
  const made = [text(p.manufacturing_places), text(p.origins)].join(" ").trim();
  const labels = (p.labels_tags || []).join(" ");
  const pack = [(p.packaging_tags || []).join(" "), text(p.packaging)].join(" ").toLowerCase();

  let canadian, originTier = "unknown";
  if (/canad/i.test(made)) { canadian = f(70, "claimed", `Listed manufacturing/origin: ${made}`, src); originTier = "made_in_canada"; }
  else if (made) { canadian = f(0, "claimed", `Listed manufacturing/origin: ${made}`, src); originTier = "imported"; }
  else canadian = f(null, "unknown", "Manufacturing place not listed.");

  const fairTrade = /fair-?trade|max-havelaar|rainforest-alliance/.test(labels)
    ? f(85, "claimed", "Fair-trade label recorded in community database (not verified by us).", src)
    : f(null, "unknown", "No fair-trade label recorded. This does NOT mean unfair labour.");

  const animal = /free-range|organic|animal-welfare|vegan/.test(labels)
    ? f(75, "claimed", `Label(s) recorded: ${labels.replace(/en:/g, "")}`, src)
    : f(null, "unknown", "No animal-welfare label recorded.");

  const grade = (p.ecoscore_grade || "").toLowerCase();
  const gradeScore = { a: 90, b: 75, c: 55, d: 35, e: 15 }[grade];
  const environment = gradeScore != null
    ? f(gradeScore, "claimed", `Eco-Score ${grade.toUpperCase()} (computed from community data).`, src)
    : f(null, "unknown", "No Eco-Score.");

  let packaging;
  if (/plastic|pet|pp|film/.test(pack)) packaging = f(30, "claimed", `Packaging: ${pack.slice(0, 80)}`, src);
  else if (/glass|cardboard|paper|carton|metal|can/.test(pack)) packaging = f(75, "claimed", `Packaging: ${pack.slice(0, 80)}`, src);
  else packaging = f(null, "unknown", "Packaging not listed.");

  return {
    id: "off-" + barcode, barcode, emoji: "🔎", category: "From Open Food Facts",
    name: p.product_name || "Unnamed product", brand: p.brands || "Unknown brand",
    price: null, size: p.quantity || "",
    owner: { name: p.brands_owner || p.brand_owner || "Not confirmed", status: p.brand_owner ? "claimed" : "unknown" },
    originTier,
    factors: { canadian, local: f(null, "unknown", "Local ownership not known."), fairTrade, animal, environment, packaging },
    recycling: "Check the City of Regina waste wizard for this packaging.",
    stores: [], external: true,
  };
}

// ============================================================
// "Ask TruthShift" — offline rule-based assistant.
// Reads the question, sets priorities, ranks ONLY our own data (no made-up facts).
// Swap answerQuestion() for an LLM call (e.g. Claude API with tool use) later.
// ============================================================
const INTENTS = {
  canadian:    /canad|buy local made|maple/i,
  local:       /regina|sask|local|small business|neighbou?r/i,
  fairTrade:   /fair|labou?r|worker|ethical sourc/i,
  animal:      /animal|cruelty|free.?range|humane|hens?/i,
  environment: /environment|eco|green|climate|organic|carbon/i,
  packaging:   /plastic|packag|waste|recycl/i,
  price:       /cheap|budget|afford|price|save|saving|low cost|money/i,
};

function answerQuestion(question, userWeights, allProducts) {
  const q = question.toLowerCase();
  const weights = Object.fromEntries(Object.keys(FACTORS).map(k => [k, 0]));
  const detected = [];
  for (const [k, re] of Object.entries(INTENTS)) if (re.test(q)) { weights[k] = 5; detected.push(k); }
  const usingProfile = detected.length === 0;
  const w = usingProfile ? userWeights : weights;

  const categories = [...new Set(allProducts.map(p => p.category))];
  const category = categories.find(c => q.includes(c.toLowerCase()) || c.toLowerCase().split(/\s|&/).some(word => word.length > 3 && q.includes(word.replace(/s$/, ""))));
  const budget = (q.match(/(?:under|below|less than|max|<)\s*\$?\s*(\d+(?:\.\d+)?)/) || [])[1];

  let pool = allProducts.filter(p => !p.external);
  if (category) pool = pool.filter(p => p.category === category);
  if (budget) pool = pool.filter(p => p.price != null && p.price <= Number(budget));

  const ranked = pool.map(p => ({ p, r: scoreProduct(p, w, allProducts) }))
    .filter(x => x.r.score != null)
    .sort((a, b) => (b.r.score * (0.5 + 0.5 * b.r.confidence)) - (a.r.score * (0.5 + 0.5 * a.r.confidence)));

  return { detected, usingProfile, category, budget, results: ranked.slice(0, 3) };
}

// Browser-only version of the TruthShift API, used by the online demo (GitHub Pages) where no Python
// backend runs. It mirrors backend/app (scoring.py, assistant.py, openfoodfacts.py, main.py) exactly;
// if you change the scoring rules there, change them here too. AI-written answers need the backend.

const BASE = import.meta.env.BASE_URL
const STATUS_TRUST = { verified: 1.0, claimed: 0.6, unknown: 0.0 }
export const DEFAULT_WEIGHTS = { canadian: 4, local: 3, fairTrade: 3, animal: 2, environment: 3, packaging: 2, price: 3 }
const OFF = 'https://world.openfoodfacts.org'
const OFF_FIELDS = 'code,product_name,brands,quantity,manufacturing_places,origins,labels_tags,ecoscore_grade,packaging_tags,packaging,brand_owner'

// ---------- data ----------
let dataPromise = null
const LIVE = new Map() // products looked up by barcode during this visit

function loadData() {
  dataPromise ??= Promise.all(
    ['reference', 'stores', 'products_synthetic', 'products_off'].map(name =>
      fetch(`${BASE}data/${name}.json`).then(r => {
        if (!r.ok) throw new Error(`Couldn't load ${name}.json`)
        return r.json()
      })),
  ).then(([reference, stores, synthetic, off]) => ({
    factors: reference.factors, originTiers: reference.originTiers, stores, products: [...synthetic, ...off],
  }))
  return dataPromise
}
const allProducts = d => [...d.products, ...LIVE.values()]
const inCategory = (d, category) => allProducts(d).filter(p => p.category === category)
const categories = d => [...new Set(allProducts(d).map(p => p.category))]

// ---------- scoring (mirrors backend/app/scoring.py) ----------
const fact = (score, status, note, source = '') => ({ score, status, note, source })
// Python's round(): exact halves go to the even number (52.5 → 52), so scores match the backend.
const pyRound = x => (Math.abs(x % 1) === 0.5 ? 2 * Math.round(x / 2) : Math.round(x))

function priceFactor(d, product) {
  if (product.price == null) return fact(null, 'unknown', 'Price not available.')
  const peers = inCategory(d, product.category).filter(p => p.price != null).map(p => p.price)
  const lo = Math.min(...peers), hi = Math.max(...peers)
  const score = hi === lo ? 100 : pyRound(100 * (hi - product.price) / (hi - lo))
  const diff = product.price - lo
  const note = diff <= 0.001 ? 'Cheapest option in this category.' : `$${diff.toFixed(2)} more than the cheapest option.`
  return fact(score, 'verified', note, 'Shelf price (demo)')
}

const confidenceLabel = c => (c >= 0.75 ? 'High' : c >= 0.45 ? 'Medium' : 'Low')

function scoreProduct(d, product, weights) {
  const facts = { ...product.factors, price: priceFactor(d, product) }
  let num = 0, den = 0, trusted = 0, totalW = 0
  const breakdown = []
  for (const key of Object.keys(d.factors)) {
    const w = Number(weights[key] || 0)
    const f = facts[key] || fact(null, 'unknown', 'No data.')
    breakdown.push({ key, weight: w, ...f })
    if (w === 0 || f.status === 'na') continue
    totalW += w
    const trust = STATUS_TRUST[f.status] ?? 0
    trusted += w * trust
    if (f.score == null || trust === 0) continue
    num += w * trust * f.score
    den += w * trust
  }
  const score = den > 0 ? pyRound(num / den) : null
  const confidence = totalW > 0 ? trusted / totalW : 0
  const result = { score, confidence: Math.round(confidence * 1000) / 1000, confidenceLabel: confidenceLabel(confidence),
    limitedData: confidence < 0.4, breakdown }
  result.summary = explain(d, result)
  return result
}

function explain(d, result) {
  const label = b => d.factors[b.key].label.toLowerCase()
  const relevant = result.breakdown.filter(b => b.weight > 0 && b.status !== 'na')
  const known = relevant.filter(b => b.score != null && b.status !== 'unknown').sort((a, b) => b.weight * b.score - a.weight * a.score)
  const strengths = known.filter(b => b.score >= 70).slice(0, 2).map(label)
  const weaknesses = known.filter(b => b.score < 45).sort((a, b) => b.weight - a.weight).slice(0, 2).map(label)
  const claimed = relevant.filter(b => b.status === 'claimed').map(label)
  const unknowns = relevant.filter(b => b.status === 'unknown').map(label)
  const parts = []
  if (strengths.length) parts.push(`Strong on ${strengths.join(' and ')}.`)
  if (weaknesses.length) parts.push(`Weaker on ${weaknesses.join(' and ')}.`)
  if (claimed.length) parts.push(`Company claims (not independently verified): ${claimed.join(', ')}.`)
  if (unknowns.length) parts.push(`Unknown: ${unknowns.join(', ')}. Not counted against it.`)
  return parts.join(' ')
}

const rankValue = item => (item.result.score || 0) * (0.5 + 0.5 * item.result.confidence)
const byRank = (a, b) => rankValue(b) - rankValue(a)
const scored = (d, product, weights) => ({ product, result: scoreProduct(d, product, weights) })

// ---------- Open Food Facts (mirrors backend/app/openfoodfacts.py) ----------
function offToProduct(p, category) {
  const name = (p.product_name || '').trim()
  if (!name || !p.code) return null
  const src = 'Open Food Facts (community data)'
  const made = [p.manufacturing_places, p.origins].filter(Boolean).join(' ').trim()
  const labels = (p.labels_tags || []).join(' ')
  const pack = `${(p.packaging_tags || []).join(' ')} ${p.packaging || ''}`.toLowerCase()
  let canadian, tier
  if (/canad/i.test(made)) { canadian = fact(70, 'claimed', `Listed manufacturing place / origin: ${made}`, src); tier = 'made_in_canada' }
  else if (made) { canadian = fact(0, 'claimed', `Listed manufacturing place / origin: ${made}`, src); tier = 'imported' }
  else { canadian = fact(null, 'unknown', 'Manufacturing place not listed.'); tier = 'unknown' }
  const fairTrade = /fair-trade|fairtrade|max-havelaar|rainforest-alliance/.test(labels)
    ? fact(85, 'claimed', 'Fair-trade label recorded in the community database (not verified by us).', src)
    : fact(null, 'unknown', 'No fair-trade label recorded. This does NOT mean unfair labour.')
  const animal = /free-range|organic|animal-welfare|vegan/.test(labels)
    ? fact(75, 'claimed', 'Label(s) recorded: ' + labels.replaceAll('en:', ''), src)
    : fact(null, 'unknown', 'No animal-welfare label recorded.')
  const grade = (p.ecoscore_grade || '').toLowerCase()
  const gscore = { a: 90, b: 75, c: 55, d: 35, e: 15 }[grade]
  const environment = gscore != null
    ? fact(gscore, 'claimed', `Eco-Score ${grade.toUpperCase()} (computed from community data).`, src)
    : fact(null, 'unknown', 'No Eco-Score.')
  let packaging
  if (/plastic|pet|film/.test(pack)) packaging = fact(30, 'claimed', 'Packaging listed: ' + pack.trim().slice(0, 90), src)
  else if (/glass|cardboard|paper|carton|metal|can/.test(pack)) packaging = fact(75, 'claimed', 'Packaging listed: ' + pack.trim().slice(0, 90), src)
  else packaging = fact(null, 'unknown', 'Packaging not listed.')
  const owner = p.brand_owner
  return {
    id: 'off-' + p.code, barcode: p.code, emoji: '🛒', category, name: name.slice(0, 80),
    brand: (p.brands || 'Unknown brand').split(',')[0].trim(), price: null, size: p.quantity || '',
    owner: { name: owner || 'Not confirmed', status: owner ? 'claimed' : 'unknown' }, originTier: tier,
    factors: { canadian, local: fact(null, 'unknown', 'Local ownership not known.'), fairTrade, animal, environment, packaging },
    recycling: 'Check the City of Regina waste guide for this packaging.', stores: [], source: 'openfoodfacts',
    sourceUrl: `${OFF}/product/${p.code}`,
  }
}

// ---------- Ask (mirrors backend/app/assistant.py, rule-based part) ----------
const INTENTS = {
  canadian: /canad|maple/, local: /regina|sask|local|small business|neighbou?r/, fairTrade: /fair|labou?r|worker|ethical sourc/,
  animal: /animal|cruelty|free.?range|humane|hens?/, environment: /environment|eco|green|climate|organic|carbon/,
  packaging: /plastic|packag|waste|recycl/, price: /cheap|budget|afford|price|save|saving|low cost|money/,
}

function parseQuestion(d, question, userWeights) {
  const q = question.toLowerCase()
  const detected = Object.keys(INTENTS).filter(k => INTENTS[k].test(q))
  const weights = detected.length ? Object.fromEntries(Object.keys(d.factors).map(k => [k, detected.includes(k) ? 5 : 0])) : userWeights
  let category = null
  for (const c of categories(d)) {
    const words = c.toLowerCase().split(/[\s&]+/).filter(w => w.length > 3).map(w => w.replace(/s+$/, ''))
    if (q.includes(c.toLowerCase()) || words.some(w => q.includes(w))) { category = c; break }
  }
  const m = q.match(/(?:under|below|less than|max|<)\s*\$?\s*(\d+(?:\.\d+)?)/)
  return { detected, usingProfile: !detected.length, category, budget: m ? Number(m[1]) : null, weights }
}

// ---------- the API (same shapes as backend/app/main.py) ----------
export const localApi = {
  async meta() {
    const d = await loadData()
    const products = allProducts(d)
    return {
      factors: d.factors, originTiers: d.originTiers, defaultWeights: DEFAULT_WEIGHTS, categories: categories(d),
      counts: {
        products: products.length,
        synthetic: products.filter(p => p.source === 'synthetic').length,
        openfoodfacts: products.filter(p => p.source === 'openfoodfacts').length,
        stores: d.stores.length, categories: categories(d).length,
      },
    }
  },
  async stores() { return (await loadData()).stores },
  async score(weights, { category, q } = {}) {
    const d = await loadData()
    let products = allProducts(d)
    if (category) products = products.filter(p => p.category === category)
    if (q) {
      const s = q.trim().toLowerCase()
      products = products.filter(p => ['name', 'brand', 'category', 'barcode'].some(k => String(p[k] ?? '').toLowerCase().includes(s)))
    }
    return products.map(p => scored(d, p, weights))
  },
  async product(id, weights) {
    const d = await loadData()
    const product = allProducts(d).find(p => p.id === id)
    if (!product) throw new Error('Product not found')
    const me = scored(d, product, weights)
    const better = inCategory(d, product.category).filter(p => p.id !== id).map(p => scored(d, p, weights))
      .filter(x => x.result.score != null && (me.result.score == null || x.result.score > me.result.score))
    return { ...me, alternatives: better.sort(byRank).slice(0, 3), stores: d.stores.filter(s => (product.stores || []).includes(s.id)) }
  },
  async barcode(code) {
    if (!/^\d{8,14}$/.test(code)) throw new Error('A barcode is 8 to 14 digits.')
    const d = await loadData()
    const local = allProducts(d).find(p => p.barcode === code)
    if (local) return { product: local, from: local.source || 'synthetic' }
    let data
    try {
      const r = await fetch(`${OFF}/api/v2/product/${code}.json?fields=${OFF_FIELDS}`)
      if (r.status === 404) data = null
      else if (!r.ok) throw new Error()
      else data = await r.json()
    } catch {
      throw new Error("Couldn't reach Open Food Facts. Try again, or search by name.")
    }
    const product = data?.status === 1 && data.product ? offToProduct({ ...data.product, code }, 'Scanned products') : null
    if (!product) throw new Error("No information found for this barcode. That doesn't mean the product is bad, only unknown.")
    LIVE.set(product.id, product)
    return { product, from: 'openfoodfacts-live' }
  },
  async ask(question, weights) {
    const d = await loadData()
    const parsed = parseQuestion(d, question, weights)
    let pool = allProducts(d).filter(p => p.price != null)
    if (parsed.category) pool = pool.filter(p => p.category === parsed.category)
    if (parsed.budget != null) pool = pool.filter(p => p.price <= parsed.budget)
    const results = pool.map(p => scored(d, p, parsed.weights)).filter(x => x.result.score != null).sort(byRank).slice(0, 3)
    const { detected, usingProfile, category, budget } = parsed
    return { understood: { detected, usingProfile, category, budget }, results, ai: { status: 'static', text: null } }
  },
}

// ============================================================
// TruthShift — UI
// ============================================================
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let weights = { ...DEFAULT_WEIGHTS, ...store.get("weights", {}) };
let allProducts = [...PRODUCTS];
let selectedId = null;
let userPos = null;

// ---------------- i18n (UI chrome only; add languages here) ----------------
const I18N = {
  fr: { title: "TruthShift", tab_priorities: "Mes priorités", tab_scan: "Scanner", tab_compare: "Comparer", tab_ask: "Demander", tab_map: "À proximité",
        prio_h: "Qu'est-ce qui compte pour vous ?", prio_p: "Chacun définit « éthique » différemment. Indiquez l'importance de chaque enjeu (0 = sans importance, 5 = très important).",
        presets: "Préréglages :", legend_h: "Comment lire nos informations", scan_btn: "Scanner", category: "Catégorie", ask_h: "Demandez à TruthShift", use_loc: "Ma position" },
};
const EN = Object.fromEntries($$("[data-i18n]").map(el => [el.dataset.i18n, el.textContent]));
function applyLang(lang) {
  const dict = I18N[lang] || {};
  $$("[data-i18n]").forEach(el => { el.textContent = dict[el.dataset.i18n] || EN[el.dataset.i18n]; });
  document.documentElement.lang = lang;
  store.set("lang", lang);
}
$("#lang").value = store.get("lang", "en");
$("#lang").addEventListener("change", e => applyLang(e.target.value));
applyLang($("#lang").value);

// ---------------- Tabs ----------------
function showTab(name) {
  $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach(t => t.classList.toggle("active", t.id === "tab-" + name));
  if (name === "map") initMap();
  if (name === "compare") renderCompare();
}
$$(".tabs button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ---------------- Priorities ----------------
const PRESETS = {
  canadian: { canadian: 5, local: 4, fairTrade: 1, animal: 1, environment: 1, packaging: 1, price: 2 },
  budget:   { canadian: 2, local: 1, fairTrade: 1, animal: 1, environment: 1, packaging: 1, price: 5 },
  green:    { canadian: 1, local: 2, fairTrade: 2, animal: 2, environment: 5, packaging: 5, price: 2 },
  fair:     { canadian: 1, local: 1, fairTrade: 5, animal: 3, environment: 2, packaging: 1, price: 2 },
  reset:    DEFAULT_WEIGHTS,
};
function renderSliders() {
  $("#sliders").innerHTML = Object.entries(FACTORS).map(([k, fct]) => `
    <div class="slider">
      <span>${fct.icon} ${esc(fct.label)}</span>
      <input type="range" min="0" max="5" step="1" value="${weights[k]}" data-k="${k}" aria-label="${esc(fct.label)}" />
      <b>${weights[k]}</b>
    </div>`).join("");
  $$("#sliders input").forEach(inp => inp.addEventListener("input", e => {
    weights[e.target.dataset.k] = Number(e.target.value);
    e.target.nextElementSibling.textContent = e.target.value;
    onWeightsChanged();
  }));
}
$$("[data-preset]").forEach(b => b.addEventListener("click", () => {
  weights = { ...PRESETS[b.dataset.preset] };
  renderSliders(); onWeightsChanged();
}));
function onWeightsChanged() {
  store.set("weights", weights);
  renderList(); if (selectedId) renderDetail(selectedId); renderCompare();
}

// ---------------- Helpers ----------------
const scoreOf = p => scoreProduct(p, weights, allProducts);
const BADGE = {
  verified: '<span class="badge verified">✔ Verified</span>',
  claimed: '<span class="badge claimed">⚠ Claimed</span>',
  unknown: '<span class="badge unknown">? Unknown</span>',
  na: '<span class="badge na">— N/A</span>',
};
const ICON = { verified: "✔", claimed: "⚠", unknown: "?", na: "—" };
function pill(r, big = false) {
  const cls = scoreClass(r.score);
  return `<div class="pill ${cls} ${big ? "big" : ""}">${r.score ?? "?"}<small>/100</small></div>`;
}
const money = v => v == null ? "price n/a" : "$" + v.toFixed(2);

// ---------------- Product list / search ----------------
function renderList() {
  const q = $("#search").value.trim().toLowerCase();
  const list = allProducts.filter(p => !q || [p.name, p.brand, p.category, p.barcode].some(s => (s || "").toLowerCase().includes(q)));
  $("#productList").innerHTML = list.map(p => {
    const r = scoreOf(p), c = confidenceLabel(r.confidence);
    return `<div class="pcard" data-id="${p.id}">
      <div class="emoji">${p.emoji}</div>
      <div class="meta"><div class="name">${esc(p.name)}</div>
        <div class="sub">${esc(p.category)} · ${money(p.price)} · ${c.text} confidence</div></div>
      ${pill(r)}
    </div>`;
  }).join("") || `<p class="muted">No match in our dataset. Type a full barcode and press Enter to search Open Food Facts.</p>`;
  $$("#productList .pcard").forEach(el => el.addEventListener("click", () => openProduct(el.dataset.id)));
}
$("#search").addEventListener("input", renderList);
$("#search").addEventListener("keydown", e => {
  const v = e.target.value.trim();
  if (e.key === "Enter" && /^\d{8,14}$/.test(v)) handleBarcode(v);
});

function openProduct(id) {
  selectedId = id;
  renderDetail(id);
  $("#detail").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDetail(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const r = scoreOf(p), c = confidenceLabel(r.confidence);
  const tier = ORIGIN_TIERS[p.originTier] || ORIGIN_TIERS.unknown;

  const rows = r.breakdown.map(b => {
    const fct = FACTORS[b.key], cls = scoreClass(b.score);
    const bar = b.score != null && b.status !== "na" ? `<div class="bar"><div class="${cls}" style="width:${b.score}%"></div></div>` : "";
    return `<div class="factor">
      <div><b>${fct.icon} ${esc(fct.label)}</b><div class="small muted">your weight: ${b.weight}/5</div></div>
      <div>${BADGE[b.status] || BADGE.unknown}${b.score != null ? ` <b>${b.score}</b>` : ""}${bar}</div>
      <div>${esc(b.note)}${b.source ? `<div class="src">Source: ${esc(b.source)}</div>` : ""}</div>
    </div>`;
  }).join("");

  const alts = allProducts
    .filter(x => x.category === p.category && x.id !== p.id)
    .map(x => ({ x, r: scoreOf(x) }))
    .filter(a => a.r.score != null && (r.score == null || a.r.score > r.score))
    .sort((a, b) => b.r.score - a.r.score)
    .slice(0, 3);

  const stores = p.stores.map(sid => STORES.find(s => s.id === sid)).filter(Boolean);

  $("#detail").innerHTML = `<div class="card">
    <div class="detail-head">
      ${pill(r, true)}
      <div style="flex:1;min-width:220px">
        <h2>${p.emoji} ${esc(p.name)}</h2>
        <div class="muted">${esc(p.brand)} · ${esc(p.size)} · ${money(p.price)} · barcode ${esc(p.barcode)}</div>
        <div style="margin-top:6px">Owner: <b>${esc(p.owner.name)}</b> ${BADGE[p.owner.status] || ""}</div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <span class="small">Confidence: <b>${c.text}</b></span>
          <div class="conf"><div style="width:${Math.round(r.confidence * 100)}%"></div></div>
        </div>
      </div>
    </div>
    <div class="summary">${esc(explain(r)) || "Set some priorities to see a personal score."}</div>
    <p><span class="tier ${tier.tone}">🍁 ${esc(tier.label)}</span> <span class="small muted">${esc(tier.explain)}</span></p>
    <h3 style="margin-top:14px">Why this score?</h3>
    ${rows}
    <p style="margin-top:12px">♻️ <b>In Regina:</b> ${esc(p.recycling)}</p>
    ${stores.length ? `<p>📍 <b>Available at:</b> ${stores.map(s => esc(s.name)).join(" · ")} <button id="toMap" class="small">Show on map</button></p>` : ""}
    <h3 style="margin-top:14px">${alts.length ? "Better matches for your priorities" : "This is the best match in its category for your priorities 🎉"}</h3>
    <div class="alts">${alts.map(a => `<div class="alt" data-id="${a.x.id}">${pill(a.r)}<div><b>${esc(a.x.name)}</b>
      <div class="small muted">${money(a.x.price)} ${p.price != null && a.x.price != null ? `(${a.x.price >= p.price ? "+" : "−"}$${Math.abs(a.x.price - p.price).toFixed(2)})` : ""} · ${confidenceLabel(a.r.confidence).text} confidence</div></div></div>`).join("")}</div>
  </div>`;
  $$("#detail .alt").forEach(el => el.addEventListener("click", () => openProduct(el.dataset.id)));
  $("#toMap")?.addEventListener("click", () => { showTab("map"); highlightStores(p); });
}

// ---------------- Barcode ----------------
async function handleBarcode(code) {
  stopScan();
  const local = allProducts.find(p => p.barcode === code);
  if (local) { $("#scanMsg").textContent = `Found ${code} in our dataset.`; openProduct(local.id); return; }
  $("#scanMsg").textContent = `${code} not in our dataset — checking Open Food Facts…`;
  try {
    const p = await lookupOpenFoodFacts(code);
    if (!p) { $("#scanMsg").textContent = `No information found for ${code}. That doesn't mean the product is bad — just unknown.`; return; }
    allProducts = allProducts.filter(x => x.id !== p.id).concat(p);
    $("#scanMsg").textContent = `Loaded from Open Food Facts (community data — shown as "claimed").`;
    renderList(); openProduct(p.id);
  } catch {
    $("#scanMsg").textContent = "Couldn't reach Open Food Facts (offline?).";
  }
}

let qr = null;
$("#scanBtn").addEventListener("click", async () => {
  if (qr) { stopScan(); return; }
  if (typeof Html5Qrcode === "undefined") { $("#scanMsg").textContent = "Scanner library didn't load (offline?). Type the barcode instead."; return; }
  $("#reader").classList.remove("hidden");
  qr = new Html5Qrcode("reader");
  try {
    await qr.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 260, height: 140 } }, text => handleBarcode(text.trim()));
    $("#scanMsg").textContent = "Point the camera at a barcode…";
  } catch (err) {
    $("#scanMsg").textContent = "Camera not available. (Phones need https or localhost.) Type the barcode instead.";
    stopScan();
  }
});
$("#scanFile").addEventListener("change", async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (typeof Html5Qrcode === "undefined") { $("#scanMsg").textContent = "Scanner library didn't load. Type the barcode instead."; return; }
  stopScan();
  $("#scanMsg").textContent = "Reading barcode from photo…";
  try {
    const code = await new Html5Qrcode("reader").scanFile(file, false);
    handleBarcode(code.trim());
  } catch {
    $("#scanMsg").textContent = "Couldn't read a barcode in that photo. Try a closer, sharper photo, or type the number.";
  }
  e.target.value = "";
});
function stopScan() {
  if (qr) { qr.stop().catch(() => {}).finally(() => qr?.clear()); qr = null; }
  $("#reader").classList.add("hidden");
}

// ---------------- Compare ----------------
function renderCompare() {
  const cats = [...new Set(allProducts.map(p => p.category))];
  const sel = $("#compareCat");
  if (sel.options.length !== cats.length) {
    const cur = sel.value;
    sel.innerHTML = cats.map(c => `<option>${esc(c)}</option>`).join("");
    if (cats.includes(cur)) sel.value = cur;
  }
  const items = allProducts.filter(p => p.category === sel.value)
    .map(p => ({ p, r: scoreOf(p) }))
    .sort((a, b) => (b.r.score ?? -1) - (a.r.score ?? -1));
  const keys = Object.keys(FACTORS);
  $("#compareTable").innerHTML = `<table>
    <tr><th>Product</th><th>Your score</th><th>Confidence</th><th>Price</th>${keys.map(k => `<th title="${esc(FACTORS[k].label)}">${FACTORS[k].icon}</th>`).join("")}</tr>
    ${items.map(({ p, r }) => `<tr>
      <td><a href="#" data-id="${p.id}">${p.emoji} ${esc(p.name)}</a></td>
      <td><b>${r.score ?? "?"}</b></td>
      <td>${confidenceLabel(r.confidence).text}</td>
      <td>${money(p.price)}</td>
      ${r.breakdown.map(b => `<td class="c-${b.status === "na" ? "na" : scoreClass(b.score)}" title="${esc(b.note)}">${ICON[b.status] || "?"} ${b.score ?? ""}</td>`).join("")}
    </tr>`).join("")}
  </table>`;
  $$("#compareTable a").forEach(a => a.addEventListener("click", e => { e.preventDefault(); showTab("scan"); openProduct(a.dataset.id); }));
}
$("#compareCat").addEventListener("change", renderCompare);

// ---------------- Ask ----------------
// Real AI via the Artifact "sample" capability (Claude on the viewer's own account).
// Outside claude.ai this resolves null and only the rule-based ranking is shown.
const samplePromise = window.claude?.use ? window.claude.use("sample").catch(() => null) : Promise.resolve(null);
let askCtl = null;

function productFacts(p) {
  const r = scoreOf(p);
  return {
    id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price, size: p.size,
    owner: p.owner.name, origin: (ORIGIN_TIERS[p.originTier] || ORIGIN_TIERS.unknown).label,
    yourScore: r.score, confidence: confidenceLabel(r.confidence).text,
    facts: Object.fromEntries(Object.entries(p.factors).map(([k, v]) => [k, { status: v.status, score: v.score, note: v.note }])),
    stores: p.stores.map(id => STORES.find(s => s.id === id)?.name).filter(Boolean),
    recycling: p.recycling,
  };
}

async function askAI(question) {
  const sample = await samplePromise;
  const out = $("#aiOut");
  if (!sample || !out) return;
  const langName = { en: "English", fr: "French" }[$("#lang").value] || "English";
  askCtl?.abort();
  const ctl = askCtl = new AbortController();
  out.innerHTML = `<div class="card ai"><div class="tag">Claude's answer</div><div class="ai-text">Thinking…</div></div>`;
  const textEl = out.querySelector(".ai-text");
  const prompt = `You are the shopping assistant inside "TruthShift", a tool for newcomers to Regina, Saskatchewan.
Answer the shopper's question using ONLY the product data below. Never invent facts, brands, prices or stores.
Rules:
- Each fact has a status: "verified" (confirmed by a certifier or government), "claimed" (the company says so, not confirmed), "unknown" (no information), "na" (not applicable). Say which kind of evidence supports each point.
- Unknown is NOT bad: never treat missing information as unethical. Say it is unknown.
- "Made in Canada" can include imported ingredients; be precise about origin.
- Mention price trade-offs and where to buy when relevant.
- Recommend at most 3 products, best first, one or two short sentences each. If nothing fits, say so and suggest the closest option.
- Write in ${langName}. Plain words, short sentences, no markdown. Under 160 words.

Shopper's saved priority weights (0-5): ${JSON.stringify(weights)}
Product data (yourScore uses those saved weights): ${JSON.stringify(allProducts.filter(p => !p.external).map(productFacts))}

Shopper's question: ${question}`;
  try {
    const { text, truncated } = await sample(prompt, { signal: ctl.signal, modelTier: "quick", onText: ({ text }) => { textEl.textContent = text; } });
    textEl.textContent = text + (truncated ? "\n\n(Answer was cut short.)" : "");
  } catch (e) {
    if (e?.code === "cancelled") return;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code)) { out.innerHTML = ""; return; }
    if (e?.code === "refused") { textEl.textContent = "Claude couldn't answer that. Try rephrasing the question."; return; }
    textEl.textContent = (e?.text ? e.text + "\n\n" : "") + (e?.code === "rate_limited" ? "Too many questions right now. Try again in a minute." : "Claude couldn't answer just now. The ranking below still works.");
  }
}

function ask(question) {
  const a =answerQuestion(question, weights, allProducts);
  const understood = a.usingProfile
    ? "I used <b>your saved priorities</b>."
    : `I focused on: <b>${a.detected.map(k => FACTORS[k].icon + " " + FACTORS[k].label).join(", ")}</b>.`;
  const filters = [a.category && `category <b>${esc(a.category)}</b>`, a.budget && `budget ≤ <b>$${esc(a.budget)}</b>`].filter(Boolean).join(", ");
  $("#askOut").innerHTML = `<div id="aiOut"></div><div class="card answer">
    <div class="small muted">Quick ranking from our scoring engine</div>
    <p>${understood} ${filters ? "Filters: " + filters + "." : ""}</p>
    ${a.results.length ? `<ol>${a.results.map(({ p, r }) => `<li>
        <a href="#" data-id="${p.id}"><b>${p.emoji} ${esc(p.name)}</b></a> — ${money(p.price)}, fit <b>${r.score}/100</b>, ${confidenceLabel(r.confidence).text.toLowerCase()} confidence
        <div class="small muted">${esc(explain(r))}</div></li>`).join("")}</ol>`
      : "<p>No product in our dataset matches those filters. Try a higher budget or another category.</p>"}
    <p class="small muted">Ranking favours products we have more verified information about. Unknown information is never counted as bad.</p>
  </div>`;
  $$("#askOut a").forEach(el => el.addEventListener("click", e => { e.preventDefault(); showTab("scan"); openProduct(el.dataset.id); }));
  askAI(question);
}
$("#askForm").addEventListener("submit", e => { e.preventDefault(); if ($("#askInput").value.trim()) ask($("#askInput").value); });
$$(".ex").forEach(b => b.addEventListener("click", () => { $("#askInput").value = b.textContent; ask(b.textContent); }));

// ---------------- Map ----------------
let map = null, markers = {};
const REGINA = [50.4452, -104.6189];
// Hosted Artifacts block map tiles, so they get a drawn outline map instead.
let useSchematic = !!window.claude || typeof L === "undefined";
let focusProduct = null;
const areaPos = () => $("#area").value.split(",").map(Number);
function showSchematic() {
  useSchematic = true;
  $("#map").classList.add("hidden");
  $("#schematic").classList.remove("hidden");
  drawSchematic();
}
function drawSchematic() {
  const W = 600, H = 380, box = { n: 50.505, s: 50.400, w: -104.700, e: -104.525 };
  const x = lng => 30 + (lng - box.w) / (box.e - box.w) * (W - 60);
  const y = lat => 30 + (box.n - lat) / (box.n - box.s) * (H - 60);
  const from = userPos || areaPos();
  const dots = STORES.map(s => {
    const on = !focusProduct || focusProduct.stores.includes(s.id);
    return `<g opacity="${on ? 1 : 0.35}"><circle cx="${x(s.lng)}" cy="${y(s.lat)}" r="${on ? 8 : 6}" fill="var(--accent)" stroke="var(--card)" stroke-width="2"></circle>
      <text x="${x(s.lng) + 12}" y="${y(s.lat) + 4}" font-size="12" fill="var(--text)">${esc(s.name.split(" (")[0])}</text></g>`;
  }).join("");
  $("#schematic").innerHTML = `
    <ellipse cx="${x(-104.612)}" cy="${y(50.433)}" rx="34" ry="9" fill="var(--accent-2)"></ellipse>
    <text x="${x(-104.612)}" y="${y(50.433) + 24}" font-size="10" text-anchor="middle" fill="var(--muted)">Wascana Lake</text>
    <circle cx="${x(from[1])}" cy="${y(from[0])}" r="7" fill="var(--mid)" stroke="var(--card)" stroke-width="2"></circle>
    <text x="${x(from[1]) + 10}" y="${y(from[0]) - 8}" font-size="11" font-weight="700" fill="var(--mid)">You</text>
    ${dots}
    <text x="${W - 12}" y="${H - 10}" font-size="10" text-anchor="end" fill="var(--muted)">Outline map · approximate locations</text>`;
}
$("#area").addEventListener("change", () => {
  userPos = null;
  renderStores(focusProduct);
  if (useSchematic) drawSchematic(); else if (map) map.setView(areaPos(), 13);
});
function initMap() {
  if (useSchematic) { showSchematic(); renderStores(focusProduct); return; }
  if (map) { setTimeout(() => map.invalidateSize(), 50); return; }
  map = L.map("map").setView(REGINA, 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" })
    .once("tileerror", () => { map.remove(); map = null; showSchematic(); renderStores(focusProduct); })
    .addTo(map);
  STORES.forEach(s => { markers[s.id] = L.marker([s.lat, s.lng]).addTo(map).bindPopup(`<b>${esc(s.name)}</b><br>${esc(s.owner)}`); });
  renderStores();
  setTimeout(() => map.invalidateSize(), 50);
}
function distKm(a, b) {
  const R = 6371, toR = d => d * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function renderStores(product) {
  const from = userPos || areaPos();
  const list = STORES.filter(s => !product || product.stores.includes(s.id))
    .map(s => ({ s, d: distKm(from, [s.lat, s.lng]) })).sort((a, b) => a.d - b.d);
  $("#mapInfo").textContent = product ? `Stores carrying: ${product.name}` : (userPos ? "Distances from you" : "Distances from the area you picked");
  $("#storeList").innerHTML = list.map(({ s, d }) => {
    const carried = allProducts.filter(p => p.stores.includes(s.id)).map(p => ({ p, r: scoreOf(p) })).sort((a, b) => (b.r.score ?? 0) - (a.r.score ?? 0)).slice(0, 3);
    return `<div class="store"><b>${esc(s.name)}</b> <span class="muted">· ${d.toFixed(1)} km · ${esc(s.owner)}</span>
      <div class="small muted">Top picks for you here: ${carried.map(c => `${c.p.emoji} ${esc(c.p.name)} (${c.r.score ?? "?"})`).join(", ")}</div></div>`;
  }).join("");
}
function highlightStores(product) {
  focusProduct = product;
  initMap();
  if (!map) return;
  const ids = product.stores;
  ids.forEach(id => markers[id]?.openPopup());
  const pts = ids.map(id => STORES.find(s => s.id === id)).filter(Boolean).map(s => [s.lat, s.lng]);
  if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
  renderStores(product);
}
$("#locBtn").addEventListener("click", () => {
  const noLoc = () => { $("#mapInfo").textContent = "Location isn't available here. Pick your area instead."; };
  if (!navigator.geolocation) { noLoc(); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    userPos = [pos.coords.latitude, pos.coords.longitude];
    initMap();
    if (map) { L.circleMarker(userPos, { radius: 8, color: "#1f7a4d" }).addTo(map).bindPopup("You are here"); map.setView(userPos, 12); }
    if (useSchematic) drawSchematic();
    renderStores(focusProduct);
  }, noLoc);
});

// ---------------- Start ----------------
renderSliders();
renderList();
renderCompare();

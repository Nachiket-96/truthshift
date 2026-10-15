// One-time export: prototype data (prototype/data.js) + synthetic_more.js → backend/data/*.json
// Run: node backend/scripts/export_synthetic.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ctx = { module: { exports: {} } };
vm.createContext(ctx);
const run = file => vm.runInContext(fs.readFileSync(file, "utf8") + "\n;globalThis.__x = { PRODUCTS: typeof PRODUCTS !== 'undefined' ? PRODUCTS : null, STORES: typeof STORES !== 'undefined' ? STORES : null, FACTORS: typeof FACTORS !== 'undefined' ? FACTORS : null, ORIGIN_TIERS: typeof ORIGIN_TIERS !== 'undefined' ? ORIGIN_TIERS : null };", ctx);

run(path.join(__dirname, "../../../prototype/data.js"));
const base = ctx.__x;
run(path.join(__dirname, "synthetic_more.js"));
const more = ctx.module.exports;

const products = [...base.PRODUCTS, ...more.MORE_PRODUCTS].map(p => ({ ...p, source: "synthetic" }));
const stores = [...base.STORES, ...more.MORE_STORES];

const out = path.join(__dirname, "../data");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "products_synthetic.json"), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(out, "stores.json"), JSON.stringify(stores, null, 2));
fs.writeFileSync(path.join(out, "reference.json"), JSON.stringify({ factors: base.FACTORS, originTiers: base.ORIGIN_TIERS }, null, 2));

const ids = new Set(), codes = new Set();
for (const p of products) {
  if (ids.has(p.id) || codes.has(p.barcode)) throw new Error("Duplicate " + p.id);
  ids.add(p.id); codes.add(p.barcode);
  for (const s of p.stores) if (!stores.find(x => x.id === s)) throw new Error(`${p.id} unknown store ${s}`);
}
console.log(`products: ${products.length}, categories: ${new Set(products.map(p => p.category)).size}, stores: ${stores.length}`);

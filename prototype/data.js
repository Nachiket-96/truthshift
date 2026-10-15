// ============================================================
// TruthShift — DEMO DATA
// All brands below are FICTIONAL (synthetic dataset, as allowed by the challenge).
// Store locations are approximate and for demo only.
// To customize: add/edit products here. No other file needs to change.
// ============================================================

// Evidence status for every fact:
//   "verified" – confirmed by a certifier / government / registry
//   "claimed"  – stated by the business itself, not independently confirmed
//   "unknown"  – we could not find or confirm this (NOT the same as "bad")
//   "na"       – not applicable to this product (e.g. animal welfare for pasta)
const f = (score, status, note, source = "") => ({ score, status, note, source });
const NA = (note = "Not applicable to this product") => f(null, "na", note);

const FACTORS = {
  canadian:    { icon: "🍁", label: "Buy Canadian" },
  local:       { icon: "🏙️", label: "Support Regina / SK" },
  fairTrade:   { icon: "🤝", label: "Fair trade & labour" },
  animal:      { icon: "🐄", label: "Animal welfare" },
  environment: { icon: "🌱", label: "Environment" },
  packaging:   { icon: "♻️", label: "Low-waste packaging" },
  price:       { icon: "💲", label: "Affordability" },
};

// Canadian content tiers — avoids a misleading single "Canadian ✓"
const ORIGIN_TIERS = {
  product_of_canada: { label: "Product of Canada", tone: "good",
    explain: "All or nearly all (≈98%+) ingredients, processing and labour are Canadian." },
  made_in_canada: { label: "Made in Canada (with imported ingredients)", tone: "mid",
    explain: "Last major transformation happened in Canada, but some ingredients/components are imported." },
  canadian_owned: { label: "Canadian-owned company", tone: "mid",
    explain: "The company is Canadian-owned, but the product may be made elsewhere or with imported inputs." },
  imported: { label: "Imported", tone: "low",
    explain: "Made outside Canada by a non-Canadian company." },
  unknown: { label: "Origin not confirmed", tone: "unknown",
    explain: "We couldn't confirm where this is made. This does not mean it is bad — only unknown." },
};

const STORES = [
  { id: "s1", name: "Superstore – Victoria Ave E", lat: 50.4458, lng: -104.5445, owner: "National chain" },
  { id: "s2", name: "Sobeys – South Albert", lat: 50.4135, lng: -104.6180, owner: "National chain" },
  { id: "s3", name: "Regina Farmers' Market (downtown)", lat: 50.4490, lng: -104.6105, owner: "Local vendors" },
  { id: "s4", name: "Co-op – Harbour Landing", lat: 50.4175, lng: -104.6745, owner: "SK co-operative" },
  { id: "s5", name: "Walmart – North Regina", lat: 50.4955, lng: -104.6420, owner: "Multinational" },
  { id: "s6", name: "Spice Bazaar (independent grocer)", lat: 50.4565, lng: -104.6310, owner: "Regina-owned" },
];

const PRODUCTS = [
  // ---------------- Peanut butter ----------------
  {
    id: "p1", barcode: "0628000000011", emoji: "🥜", category: "Peanut butter",
    name: "Prairie Creamy Peanut Butter", brand: "Prairie Pantry", price: 5.49, size: "1 kg",
    owner: { name: "Prairie Pantry Ltd. (Regina, SK)", status: "verified" },
    originTier: "made_in_canada",
    factors: {
      canadian: f(70, "verified", "Roasted & packed in Regina. Peanuts are imported from the USA (peanuts aren't grown commercially in Canada).", "SK business registry + label"),
      local: f(100, "verified", "Regina-owned and operated.", "SK corporate registry"),
      fairTrade: f(null, "unknown", "No fair-trade certification found. This does NOT mean unfair labour."),
      animal: NA(),
      environment: f(60, "claimed", "Company says it uses palm-oil-free recipe.", "Company website"),
      packaging: f(80, "claimed", "Glass jar with metal lid.", "Label"),
    },
    recycling: "Glass jar + metal lid → Regina blue cart (rinse first).",
    stores: ["s3", "s4"],
  },
  {
    id: "p2", barcode: "0628000000028", emoji: "🥜", category: "Peanut butter",
    name: "Golden Spread Smooth", brand: "Golden Spread", price: 4.29, size: "1 kg",
    owner: { name: "Golden Foods Inc. (parent company in USA)", status: "verified" },
    originTier: "made_in_canada",
    factors: {
      canadian: f(40, "verified", "Made in a Canadian plant, but the parent company is US-owned and peanuts are imported.", "Public company filings"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: NA(),
      environment: f(40, "claimed", "Company sustainability report mentions energy reduction targets.", "Sustainability report"),
      packaging: f(30, "verified", "#1 PET plastic jar.", "Label"),
    },
    recycling: "#1 plastic jar → blue cart (empty & rinse).",
    stores: ["s1", "s2", "s5"],
  },
  {
    id: "p3", barcode: "0628000000035", emoji: "🥜", category: "Peanut butter",
    name: "NutriSun Organic Peanut Butter", brand: "NutriSun", price: 7.99, size: "750 g",
    owner: { name: "NutriSun Co. (USA)", status: "verified" },
    originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in the USA by a US company."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(80, "verified", "Fair-trade certified peanuts.", "Certifier database"),
      animal: NA(),
      environment: f(75, "verified", "Certified organic.", "Organic certifier"),
      packaging: f(30, "verified", "Plastic jar.", "Label"),
    },
    recycling: "Plastic jar → blue cart (empty & rinse).",
    stores: ["s2"],
  },

  // ---------------- Coffee ----------------
  {
    id: "p4", barcode: "0628000000042", emoji: "☕", category: "Coffee",
    name: "Queen City Dark Roast", brand: "Queen City Roasters", price: 16.99, size: "340 g",
    owner: { name: "Queen City Roasters (Regina, SK)", status: "verified" },
    originTier: "made_in_canada",
    factors: {
      canadian: f(50, "verified", "Roasted in Regina. Beans are from Colombia — coffee can't be grown in Canada.", "Label"),
      local: f(100, "verified", "Regina-owned small business.", "SK corporate registry"),
      fairTrade: f(90, "verified", "Fairtrade certified beans.", "Fairtrade Canada"),
      animal: NA(),
      environment: f(70, "claimed", "Says it sources shade-grown beans.", "Company website"),
      packaging: f(40, "claimed", "Bag claims to be 'compostable' — but Regina's green cart does NOT accept it.", "Label + City of Regina"),
    },
    recycling: "'Compostable' bag → garbage in Regina (not accepted in blue or green cart).",
    stores: ["s3", "s6"],
  },
  {
    id: "p5", barcode: "0628000000059", emoji: "☕", category: "Coffee",
    name: "Big Bean Instant Coffee", brand: "Big Bean", price: 8.49, size: "200 g",
    owner: { name: "Big Bean Global AG (Switzerland)", status: "verified" },
    originTier: "imported",
    factors: {
      canadian: f(10, "claimed", "Label says 'packed in Canada' — the coffee itself is imported.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(30, "claimed", "Company runs its own sustainability program — not independently certified.", "Company website"),
      animal: NA(),
      environment: f(null, "unknown", "No independent environmental data found."),
      packaging: f(70, "verified", "Glass jar.", "Label"),
    },
    recycling: "Glass jar → blue cart. Plastic lid → blue cart.",
    stores: ["s1", "s2", "s4", "s5"],
  },
  {
    id: "p6", barcode: "0628000000066", emoji: "☕", category: "Coffee",
    name: "Fairway Organic Medium Roast", brand: "Fairway Coffee", price: 13.49, size: "340 g",
    owner: { name: "Fairway Coffee Co-op (British Columbia)", status: "verified" },
    originTier: "canadian_owned",
    factors: {
      canadian: f(60, "verified", "Canadian-owned, roasted in BC. Beans imported.", "Corporate registry"),
      local: f(0, "verified", "Canadian but not Regina/SK."),
      fairTrade: f(95, "verified", "Fairtrade certified + worker co-op.", "Fairtrade Canada"),
      animal: NA(),
      environment: f(85, "verified", "Certified organic.", "Organic certifier"),
      packaging: f(30, "verified", "Multi-layer foil bag — not recyclable.", "Label"),
    },
    recycling: "Foil bag → garbage.",
    stores: ["s2", "s4"],
  },

  // ---------------- Eggs ----------------
  {
    id: "p7", barcode: "0628000000073", emoji: "🥚", category: "Eggs",
    name: "Sask Farm Free-Run Eggs (12)", brand: "Sask Farm", price: 5.29, size: "12 large",
    owner: { name: "Sask Farm Family Co. (SK)", status: "verified" },
    originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada.", "CFIA label rules"),
      local: f(70, "verified", "Saskatchewan farm (outside Regina).", "SK registry"),
      fairTrade: NA("Fair trade certification doesn't apply to Canadian eggs."),
      animal: f(70, "verified", "Free-run, certified humane standard.", "Animal welfare certifier"),
      environment: f(55, "claimed", "Farm says it uses solar power in barns.", "Farm website"),
      packaging: f(90, "verified", "Recycled cardboard carton.", "Label"),
    },
    recycling: "Cardboard carton → blue cart (or green cart).",
    stores: ["s1", "s3", "s4"],
  },
  {
    id: "p8", barcode: "0628000000080", emoji: "🥚", category: "Eggs",
    name: "Value Large White Eggs (12)", brand: "Store brand", price: 3.79, size: "12 large",
    owner: { name: "Retailer private label", status: "claimed" },
    originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Canadian eggs (supply-managed system).", "Egg Farmers of Canada"),
      local: f(null, "unknown", "Farm location not disclosed."),
      fairTrade: NA("Fair trade certification doesn't apply to Canadian eggs."),
      animal: f(30, "verified", "Conventional / enriched housing.", "Carton code"),
      environment: f(null, "unknown", "No data."),
      packaging: f(40, "verified", "Clear plastic clamshell.", "Label"),
    },
    recycling: "Plastic clamshell → blue cart.",
    stores: ["s1", "s2", "s5"],
  },
  {
    id: "p9", barcode: "0628000000097", emoji: "🥚", category: "Eggs",
    name: "Green Pasture Organic Free-Range (12)", brand: "Green Pasture", price: 7.99, size: "12 large",
    owner: { name: "Green Pasture Farms (Alberta)", status: "verified" },
    originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada.", "CFIA label rules"),
      local: f(20, "verified", "Alberta — Prairie, but not SK."),
      fairTrade: NA("Fair trade certification doesn't apply to Canadian eggs."),
      animal: f(90, "verified", "Certified organic, free-range with outdoor access.", "Organic certifier"),
      environment: f(75, "verified", "Certified organic feed.", "Organic certifier"),
      packaging: f(90, "verified", "Moulded pulp carton.", "Label"),
    },
    recycling: "Pulp carton → green cart or blue cart.",
    stores: ["s2", "s4"],
  },

  // ---------------- Chocolate ----------------
  {
    id: "p10", barcode: "0628000000103", emoji: "🍫", category: "Chocolate",
    name: "Northern Bar Dark 70%", brand: "Northern Bar", price: 4.49, size: "100 g",
    owner: { name: "Northern Bar Chocolatier (Québec)", status: "verified" },
    originTier: "made_in_canada",
    factors: {
      canadian: f(60, "verified", "Made in Québec by a Canadian company. Cocoa is imported (can't be grown in Canada).", "Corporate registry"),
      local: f(0, "verified", "Not Regina/SK."),
      fairTrade: f(90, "verified", "Fairtrade certified cocoa.", "Fairtrade Canada"),
      animal: NA("Dairy-free dark chocolate."),
      environment: f(70, "claimed", "Claims deforestation-free cocoa.", "Company website"),
      packaging: f(75, "claimed", "Paper wrapper, no plastic.", "Label"),
    },
    recycling: "Paper wrapper → blue cart.",
    stores: ["s2", "s3", "s4"],
  },
  {
    id: "p11", barcode: "0628000000110", emoji: "🍫", category: "Chocolate",
    name: "ChocoMax Milk Bar", brand: "ChocoMax", price: 1.99, size: "100 g",
    owner: { name: "Not confirmed", status: "unknown" },
    originTier: "unknown",
    factors: {
      canadian: f(null, "unknown", "Country of manufacture not shown on package."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found. This does NOT prove unfair labour — we just can't confirm."),
      animal: f(null, "unknown", "Dairy sourcing not disclosed."),
      environment: f(null, "unknown", "No data."),
      packaging: f(20, "verified", "Plastic film wrapper.", "Label"),
    },
    recycling: "Plastic film → garbage in Regina blue cart program.",
    stores: ["s1", "s5"],
  },
  {
    id: "p12", barcode: "0628000000127", emoji: "🍫", category: "Chocolate",
    name: "Cocoa Circle Fairtrade Milk", brand: "Cocoa Circle", price: 3.99, size: "100 g",
    owner: { name: "Cocoa Circle NV (Belgium)", status: "verified" },
    originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in Belgium."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(95, "verified", "Fairtrade certified cocoa and sugar.", "Fairtrade International"),
      animal: f(50, "claimed", "Says milk comes from 'pasture-based' farms.", "Company website"),
      environment: f(60, "claimed", "Claims carbon-neutral factory.", "Company website"),
      packaging: f(60, "claimed", "Paper + thin foil.", "Label"),
    },
    recycling: "Paper → blue cart; foil → garbage.",
    stores: ["s1", "s2"],
  },

  // ---------------- Pasta ----------------
  {
    id: "p13", barcode: "0628000000134", emoji: "🍝", category: "Pasta",
    name: "Prairie Durum Spaghetti", brand: "Prairie Durum", price: 2.99, size: "900 g",
    owner: { name: "Prairie Durum Mills (SK)", status: "verified" },
    originTier: "product_of_canada",
    factors: {
      canadian: f(95, "verified", "Product of Canada — SK-grown durum wheat, milled in Canada.", "CFIA label rules"),
      local: f(70, "verified", "Saskatchewan company.", "SK registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(60, "claimed", "Says it uses low-till farming partners.", "Company website"),
      packaging: f(70, "verified", "Cardboard box with small plastic window.", "Label"),
    },
    recycling: "Box → blue cart (tear off plastic window → garbage).",
    stores: ["s1", "s4", "s6"],
  },
  {
    id: "p14", barcode: "0628000000141", emoji: "🍝", category: "Pasta",
    name: "Bella Italia Spaghetti", brand: "Bella Italia", price: 2.49, size: "900 g",
    owner: { name: "Bella Italia SpA (Italy)", status: "verified" },
    originTier: "imported",
    factors: {
      canadian: f(20, "claimed", "Made in Italy. Package claims 'made with Canadian durum wheat'.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(25, "verified", "Plastic bag.", "Label"),
    },
    recycling: "Plastic bag → garbage.",
    stores: ["s1", "s2", "s5"],
  },

  // ---------------- Lentils (SK is a world-leading lentil producer!) ----------------
  {
    id: "p15", barcode: "0628000000158", emoji: "🫘", category: "Lentils & dal",
    name: "Prairie Red Lentils", brand: "Prairie Pulse", price: 4.49, size: "900 g",
    owner: { name: "Prairie Pulse Co. (Regina, SK)", status: "verified" },
    originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Grown and packed in Saskatchewan.", "CFIA label rules"),
      local: f(90, "verified", "Grown in SK, packed in Regina.", "SK registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(80, "claimed", "Pulses fix their own nitrogen — lower fertilizer use.", "Pulse Canada"),
      packaging: f(35, "verified", "Plastic bag.", "Label"),
    },
    recycling: "Plastic bag → garbage.",
    stores: ["s1", "s4", "s6"],
  },
  {
    id: "p16", barcode: "0628000000165", emoji: "🫘", category: "Lentils & dal",
    name: "Desi Masoor Dal", brand: "Desi Kitchen", price: 3.99, size: "900 g",
    owner: { name: "Desi Kitchen Foods (India)", status: "claimed" },
    originTier: "unknown",
    factors: {
      canadian: f(null, "unknown", "Packed in India; lentil origin not stated. (Many red lentils sold worldwide are grown in Saskatchewan!)"),
      local: f(40, "claimed", "Brand is imported, but sold by a Regina-owned independent grocer.", "Store"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic bag.", "Label"),
    },
    recycling: "Plastic bag → garbage.",
    stores: ["s6"],
  },
];

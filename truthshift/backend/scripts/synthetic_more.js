// Extra SYNTHETIC products (fictional brands). Used once by export_synthetic.js to build data/products_synthetic.json.
// After export, edit the JSON directly — this file is kept only as a record of how the data was written.

const MORE_STORES = [
  { id: "s7", name: "Save-On-Foods – Normanview", lat: 50.4620, lng: -104.6760, owner: "Western Canadian chain" },
  { id: "s8", name: "Costco – East Regina", lat: 50.4430, lng: -104.5350, owner: "Multinational" },
  { id: "s9", name: "Little Africa Market (independent)", lat: 50.4520, lng: -104.6180, owner: "Regina-owned" },
  { id: "s10", name: "Golden Lotus Asian Grocery (independent)", lat: 50.4485, lng: -104.6280, owner: "Regina-owned" },
];

const MORE_PRODUCTS = [
  // ---------------- Milk ----------------
  { id: "p17", barcode: "0628000000172", emoji: "🥛", category: "Milk", name: "Prairie Dairy 2% Milk", brand: "Prairie Dairy", price: 5.19, size: "2 L",
    owner: { name: "Prairie Dairy Co-operative (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Canadian milk from Saskatchewan farms.", "CFIA label rules"),
      local: f(80, "verified", "Saskatchewan farmer-owned co-operative.", "SK co-op registry"),
      fairTrade: NA("Fair trade certification doesn't apply to Canadian milk."),
      animal: f(55, "verified", "Farms follow the national dairy animal-care program.", "Dairy Farmers of Canada"),
      environment: f(50, "claimed", "Co-op reports a methane-reduction pilot.", "Co-op website"),
      packaging: f(60, "verified", "#2 HDPE plastic jug, recyclable.", "Label"),
    }, recycling: "#2 jug → blue cart (rinse, lid on).", stores: ["s1", "s4", "s7"] },
  { id: "p18", barcode: "0628000000189", emoji: "🥛", category: "Milk", name: "Northern Organic 2% Milk", brand: "Northern Organic", price: 7.49, size: "2 L",
    owner: { name: "Northern Organic Dairy (Ontario)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada.", "CFIA label rules"),
      local: f(0, "verified", "Ontario, not SK."),
      fairTrade: NA("Fair trade certification doesn't apply to Canadian milk."),
      animal: f(85, "verified", "Certified organic: pasture access required.", "Organic certifier"),
      environment: f(75, "verified", "Certified organic feed, no synthetic pesticides.", "Organic certifier"),
      packaging: f(65, "claimed", "Paper carton with plastic cap.", "Label"),
    }, recycling: "Carton → blue cart.", stores: ["s2", "s7"] },
  { id: "p19", barcode: "0628000000196", emoji: "🥛", category: "Milk", name: "Oat Fields Oat Drink", brand: "Oat Fields", price: 4.99, size: "1.75 L",
    owner: { name: "Oat Fields AB (Sweden)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in the USA by a Swedish company."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: NA("Plant-based, no animal products."),
      environment: f(80, "claimed", "Company publishes a lower carbon footprint than dairy milk.", "Company climate report"),
      packaging: f(55, "claimed", "Paper carton with plastic cap.", "Label"),
    }, recycling: "Carton → blue cart.", stores: ["s1", "s2", "s5", "s7"] },

  // ---------------- Bread ----------------
  { id: "p20", barcode: "0628000000202", emoji: "🍞", category: "Bread", name: "Regina Hearth Whole Wheat", brand: "Regina Hearth Bakery", price: 4.79, size: "675 g",
    owner: { name: "Regina Hearth Bakery (Regina, SK)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(90, "verified", "Baked in Regina with Saskatchewan wheat flour.", "Label + SK registry"),
      local: f(100, "verified", "Regina-owned bakery.", "SK corporate registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(60, "claimed", "Bakery says it donates day-old bread to avoid waste.", "Bakery website"),
      packaging: f(75, "verified", "Paper bag.", "Label"),
    }, recycling: "Paper bag → blue cart.", stores: ["s3", "s4"] },
  { id: "p21", barcode: "0628000000219", emoji: "🍞", category: "Bread", name: "Sunny Slice White Bread", brand: "Sunny Slice", price: 2.99, size: "675 g",
    owner: { name: "Multinational bakery group (parent outside Canada)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(50, "verified", "Baked in Canada; parent company is foreign-owned.", "Public company filings"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic bag with plastic clip.", "Label"),
    }, recycling: "Plastic bag → garbage (soft plastic not accepted in blue cart).", stores: ["s1", "s2", "s5", "s7", "s8"] },

  // ---------------- Honey ----------------
  { id: "p22", barcode: "0628000000226", emoji: "🍯", category: "Honey", name: "Qu'Appelle Valley Raw Honey", brand: "Qu'Appelle Valley Apiaries", price: 9.99, size: "500 g",
    owner: { name: "Qu'Appelle Valley Apiaries (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada — Saskatchewan honey.", "CFIA label rules"),
      local: f(85, "verified", "Family beekeepers in the Qu'Appelle Valley, SK.", "SK registry"),
      fairTrade: NA(),
      animal: f(60, "claimed", "Says hives are not moved for commercial pollination.", "Farm website"),
      environment: f(70, "claimed", "Says it plants wildflower strips for pollinators.", "Farm website"),
      packaging: f(85, "verified", "Glass jar, metal lid.", "Label"),
    }, recycling: "Glass jar + lid → blue cart.", stores: ["s3", "s4"] },
  { id: "p23", barcode: "0628000000233", emoji: "🍯", category: "Honey", name: "Golden Blend Liquid Honey", brand: "Golden Blend", price: 6.49, size: "500 g",
    owner: { name: "Golden Blend Foods (Ontario)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(30, "verified", "Label says 'Blend of Canada and Argentina honey' — only part is Canadian.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: f(null, "unknown", "No information on hive practices."),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic squeeze bottle.", "Label"),
    }, recycling: "Plastic bottle → blue cart (empty).", stores: ["s1", "s5", "s8"] },

  // ---------------- Maple syrup ----------------
  { id: "p24", barcode: "0628000000240", emoji: "🍁", category: "Maple syrup", name: "Érablière Boréale Pure Maple Syrup", brand: "Érablière Boréale", price: 12.99, size: "540 mL",
    owner: { name: "Érablière Boréale (Québec family sugar bush)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada — Québec maple.", "CFIA label rules"),
      local: f(0, "verified", "Québec, not SK."),
      fairTrade: NA(),
      animal: NA(),
      environment: f(70, "claimed", "Says it manages its forest without clear-cutting.", "Company website"),
      packaging: f(80, "verified", "Metal can.", "Label"),
    }, recycling: "Metal can → blue cart.", stores: ["s1", "s2", "s4"] },
  { id: "p25", barcode: "0628000000257", emoji: "🥞", category: "Maple syrup", name: "Pancake Time Table Syrup", brand: "Pancake Time", price: 4.49, size: "750 mL",
    owner: { name: "Pancake Time Brands (USA)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in the USA. This is flavoured corn syrup, not maple syrup.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic bottle.", "Label"),
    }, recycling: "Plastic bottle → blue cart.", stores: ["s1", "s5", "s8"] },

  // ---------------- Cooking oil ----------------
  { id: "p26", barcode: "0628000000264", emoji: "🌻", category: "Cooking oil", name: "Prairie Gold Canola Oil", brand: "Prairie Gold", price: 8.99, size: "3 L",
    owner: { name: "Prairie Gold Oilseeds (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Saskatchewan-grown canola, pressed in SK.", "CFIA label rules"),
      local: f(75, "verified", "Saskatchewan company.", "SK registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(55, "claimed", "Says its growers use no-till farming.", "Company website"),
      packaging: f(40, "verified", "Plastic jug.", "Label"),
    }, recycling: "Plastic jug → blue cart (wipe out oil).", stores: ["s1", "s4", "s6", "s9", "s10"] },
  { id: "p27", barcode: "0628000000271", emoji: "🫒", category: "Cooking oil", name: "Olivia Extra Virgin Olive Oil", brand: "Olivia", price: 14.99, size: "1 L",
    owner: { name: "Olivia SpA (Italy)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in Italy with olives from Italy and Spain.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: NA(),
      environment: f(50, "claimed", "Says it uses traditional groves.", "Company website"),
      packaging: f(75, "verified", "Dark glass bottle.", "Label"),
    }, recycling: "Glass bottle → blue cart.", stores: ["s2", "s7", "s8"] },

  // ---------------- Oats & cereal ----------------
  { id: "p28", barcode: "0628000000288", emoji: "🌾", category: "Oats & cereal", name: "Prairie Oat Mills Large Flake Oats", brand: "Prairie Oat Mills", price: 5.49, size: "1 kg",
    owner: { name: "Prairie Oat Mills (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Saskatchewan oats, milled in Canada.", "CFIA label rules"),
      local: f(70, "verified", "Saskatchewan company.", "SK registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(70, "claimed", "Says oats need less fertilizer than wheat.", "Company website"),
      packaging: f(75, "verified", "Paper bag.", "Label"),
    }, recycling: "Paper bag → blue cart.", stores: ["s1", "s4", "s7"] },
  { id: "p29", barcode: "0628000000295", emoji: "🥣", category: "Oats & cereal", name: "Morning Crunch Honey Granola", brand: "Morning Crunch", price: 6.99, size: "500 g",
    owner: { name: "Morning Crunch Foods (USA)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in the USA."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(35, "verified", "Cardboard box with plastic liner.", "Label"),
    }, recycling: "Box → blue cart; plastic liner → garbage.", stores: ["s1", "s2", "s5", "s8"] },

  // ---------------- Bananas ----------------
  { id: "p30", barcode: "0628000000301", emoji: "🍌", category: "Bananas", name: "Fairtrade Organic Bananas", brand: "Andes Growers", price: 2.49, size: "per kg",
    owner: { name: "Andes Growers Co-op (Peru)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Grown in Peru. Bananas can't be grown in Canada."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(95, "verified", "Fairtrade certified farmer co-op.", "Fairtrade Canada"),
      animal: NA(),
      environment: f(75, "verified", "Certified organic.", "Organic certifier"),
      packaging: f(70, "verified", "Small plastic band only.", "Store"),
    }, recycling: "Plastic band → garbage. Peels → green cart.", stores: ["s2", "s7"] },
  { id: "p31", barcode: "0628000000318", emoji: "🍌", category: "Bananas", name: "Bananas", brand: "Tropic Fresh", price: 1.69, size: "per kg",
    owner: { name: "Tropic Fresh Fruit Co. (USA)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Grown in Guatemala. Bananas can't be grown in Canada."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(null, "unknown", "No certification found. This does NOT prove unfair labour."),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(95, "verified", "No packaging.", "Store"),
    }, recycling: "Peels → green cart.", stores: ["s1", "s4", "s5", "s8", "s9"] },

  // ---------------- Tea ----------------
  { id: "p32", barcode: "0628000000325", emoji: "🍵", category: "Tea", name: "Chai Wallah Masala Chai", brand: "Chai Wallah", price: 7.99, size: "40 bags",
    owner: { name: "Chai Wallah Blends (Regina, SK — newcomer-owned)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(40, "verified", "Blended and packed in Regina. Tea and spices come from India.", "Label + SK registry"),
      local: f(100, "verified", "Regina-owned small business.", "SK corporate registry"),
      fairTrade: f(85, "verified", "Fairtrade certified tea.", "Fairtrade Canada"),
      animal: NA(),
      environment: f(60, "claimed", "Says its tea bags are plastic-free.", "Label"),
      packaging: f(75, "claimed", "Paper box, no plastic wrap.", "Label"),
    }, recycling: "Box → blue cart. Used tea bags → green cart.", stores: ["s3", "s6"] },
  { id: "p33", barcode: "0628000000332", emoji: "🍵", category: "Tea", name: "Royal Leaf Orange Pekoe", brand: "Royal Leaf", price: 5.49, size: "72 bags",
    owner: { name: "Royal Leaf Tea Co. (United Kingdom)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(10, "claimed", "Label says 'packed in Canada'. The tea is imported.", "Label"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: f(60, "verified", "Rainforest Alliance certified (not Fairtrade).", "Certifier database"),
      animal: NA(),
      environment: f(55, "verified", "Rainforest Alliance farm standards.", "Certifier database"),
      packaging: f(45, "verified", "Box with plastic over-wrap.", "Label"),
    }, recycling: "Box → blue cart; plastic wrap → garbage.", stores: ["s1", "s2", "s5", "s7", "s8"] },

  // ---------------- Rice ----------------
  { id: "p34", barcode: "0628000000349", emoji: "🍚", category: "Rice", name: "Northern Lakes Wild Rice", brand: "Northern Lakes", price: 9.99, size: "500 g",
    owner: { name: "Northern Lakes Harvesters Co-op (northern SK, Indigenous-owned)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Wild rice harvested from lakes in northern Saskatchewan.", "CFIA label rules"),
      local: f(80, "verified", "Saskatchewan Indigenous-owned co-operative.", "SK co-op registry"),
      fairTrade: NA("Not a fair-trade category, but harvesters own the co-op."),
      animal: NA(),
      environment: f(85, "claimed", "Wild-harvested, no fertilizer or irrigation.", "Co-op website"),
      packaging: f(60, "verified", "Paper bag with small plastic window.", "Label"),
    }, recycling: "Paper bag → blue cart.", stores: ["s3", "s4"] },
  { id: "p35", barcode: "0628000000356", emoji: "🍚", category: "Rice", name: "Basmati Gold Rice", brand: "Basmati Gold", price: 12.99, size: "4 kg",
    owner: { name: "Basmati Gold Exports (India)", status: "claimed" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Grown and packed in India."),
      local: f(40, "claimed", "Imported brand, sold by Regina-owned independent grocers.", "Store"),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Woven plastic bag.", "Label"),
    }, recycling: "Plastic bag → garbage.", stores: ["s6", "s10", "s8"] },
  { id: "p36", barcode: "0628000000363", emoji: "🍚", category: "Rice", name: "Jasmine Pearl Rice", brand: "Jasmine Pearl", price: 10.49, size: "4 kg",
    owner: { name: "Jasmine Pearl Trading (Thailand)", status: "claimed" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Grown and packed in Thailand."),
      local: f(40, "claimed", "Imported brand, sold by a Regina-owned grocer.", "Store"),
      fairTrade: f(null, "unknown", "No certification found."),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic bag.", "Label"),
    }, recycling: "Plastic bag → garbage.", stores: ["s10", "s1"] },

  // ---------------- Cheese ----------------
  { id: "p37", barcode: "0628000000370", emoji: "🧀", category: "Cheese", name: "Prairie Creamery Old Cheddar", brand: "Prairie Creamery", price: 7.99, size: "400 g",
    owner: { name: "Prairie Creamery (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Made from 100% Canadian milk.", "Dairy Farmers of Canada logo"),
      local: f(80, "verified", "Saskatchewan creamery.", "SK registry"),
      fairTrade: NA(),
      animal: f(55, "verified", "Milk from farms in the national dairy animal-care program.", "Dairy Farmers of Canada"),
      environment: f(null, "unknown", "No data."),
      packaging: f(30, "verified", "Plastic vacuum pack.", "Label"),
    }, recycling: "Plastic film → garbage.", stores: ["s1", "s4", "s7"] },
  { id: "p38", barcode: "0628000000387", emoji: "🧀", category: "Cheese", name: "Alpine Imports Aged Gouda", brand: "Alpine Imports", price: 9.49, size: "300 g",
    owner: { name: "Alpine Imports BV (Netherlands)", status: "verified" }, originTier: "imported",
    factors: {
      canadian: f(0, "verified", "Made in the Netherlands."),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: f(60, "claimed", "Says cows graze outdoors in summer.", "Company website"),
      environment: f(null, "unknown", "No data."),
      packaging: f(35, "verified", "Wax rind + plastic wrap.", "Label"),
    }, recycling: "Wax and plastic → garbage.", stores: ["s2", "s8"] },

  // ---------------- Beef ----------------
  { id: "p39", barcode: "0628000000394", emoji: "🥩", category: "Ground beef", name: "Sask Ranchers Lean Ground Beef", brand: "Sask Ranchers", price: 6.99, size: "454 g",
    owner: { name: "Sask Ranchers Association brand (SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Product of Canada — Saskatchewan cattle.", "CFIA label rules"),
      local: f(80, "verified", "Saskatchewan ranchers.", "SK registry"),
      fairTrade: NA(),
      animal: f(60, "verified", "Ranches certified under a national on-farm beef program.", "Program registry"),
      environment: f(30, "verified", "Beef has high greenhouse-gas emissions per kg compared with other proteins.", "Research consensus"),
      packaging: f(35, "verified", "Foam tray + plastic film.", "Store"),
    }, recycling: "Foam tray and film → garbage.", stores: ["s1", "s4", "s7"] },
  { id: "p40", barcode: "0628000000400", emoji: "🥩", category: "Ground beef", name: "Value Lean Ground Beef", brand: "Store brand", price: 5.49, size: "454 g",
    owner: { name: "Retailer private label", status: "claimed" }, originTier: "unknown",
    factors: {
      canadian: f(null, "unknown", "Store-packed; country of origin not shown on the package."),
      local: f(null, "unknown", "Supplier not disclosed."),
      fairTrade: NA(),
      animal: f(null, "unknown", "No animal-welfare information."),
      environment: f(25, "verified", "Beef has high greenhouse-gas emissions per kg compared with other proteins.", "Research consensus"),
      packaging: f(35, "verified", "Foam tray + plastic film.", "Store"),
    }, recycling: "Foam tray and film → garbage.", stores: ["s1", "s5", "s8"] },

  // ---------------- Lentils (extra) ----------------
  { id: "p41", barcode: "0628000000417", emoji: "🫘", category: "Lentils & dal", name: "Prairie Green Lentils", brand: "Prairie Pulse", price: 3.99, size: "900 g",
    owner: { name: "Prairie Pulse Co. (Regina, SK)", status: "verified" }, originTier: "product_of_canada",
    factors: {
      canadian: f(100, "verified", "Grown and packed in Saskatchewan.", "CFIA label rules"),
      local: f(90, "verified", "Grown in SK, packed in Regina.", "SK registry"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(80, "claimed", "Pulses fix their own nitrogen — lower fertilizer use.", "Pulse Canada"),
      packaging: f(35, "verified", "Plastic bag.", "Label"),
    }, recycling: "Plastic bag → garbage.", stores: ["s1", "s4", "s6", "s9"] },
  { id: "p42", barcode: "0628000000424", emoji: "🫘", category: "Lentils & dal", name: "Sahel Black-Eyed Peas", brand: "Sahel Pantry", price: 4.29, size: "900 g",
    owner: { name: "Sahel Pantry Imports (Ontario)", status: "claimed" }, originTier: "unknown",
    factors: {
      canadian: f(null, "unknown", "Packed in Ontario; where the peas were grown is not stated."),
      local: f(40, "claimed", "Sold by a Regina-owned independent grocer.", "Store"),
      fairTrade: NA(),
      animal: NA(),
      environment: f(75, "claimed", "Pulses have a low footprint.", "Pulse Canada"),
      packaging: f(30, "verified", "Plastic bag.", "Label"),
    }, recycling: "Plastic bag → garbage.", stores: ["s9"] },

  // ---------------- Laundry detergent ----------------
  { id: "p43", barcode: "0628000000431", emoji: "🧺", category: "Laundry detergent", name: "Clean Prairie Laundry Strips", brand: "Clean Prairie", price: 14.99, size: "60 loads",
    owner: { name: "Clean Prairie Inc. (Alberta)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(75, "verified", "Made in Canada by a Canadian company.", "Corporate registry"),
      local: f(20, "verified", "Alberta — Prairie, but not SK."),
      fairTrade: NA(),
      animal: f(85, "verified", "Certified not tested on animals.", "Leaping Bunny"),
      environment: f(70, "claimed", "Says it ships 90% less water weight than liquid detergent.", "Company website"),
      packaging: f(90, "verified", "Cardboard sleeve, no plastic jug.", "Label"),
    }, recycling: "Cardboard sleeve → blue cart.", stores: ["s2", "s7"] },
  { id: "p44", barcode: "0628000000448", emoji: "🧺", category: "Laundry detergent", name: "MegaWash Liquid Detergent", brand: "MegaWash", price: 12.99, size: "64 loads",
    owner: { name: "MegaWash Global (USA)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(30, "verified", "Made in a Canadian plant; US-owned parent company.", "Public company filings"),
      local: f(0, "verified", "Not a Regina/SK business."),
      fairTrade: NA(),
      animal: f(null, "unknown", "Animal-testing policy not confirmed."),
      environment: f(40, "claimed", "Says the formula is concentrated.", "Company website"),
      packaging: f(25, "verified", "Large plastic jug.", "Label"),
    }, recycling: "Plastic jug → blue cart (empty, cap on).", stores: ["s1", "s5", "s8"] },

  // ---------------- Coffee (extra) ----------------
  { id: "p45", barcode: "0628000000455", emoji: "☕", category: "Coffee", name: "Store Brand Ground Coffee", brand: "Store brand", price: 9.99, size: "925 g",
    owner: { name: "Retailer private label", status: "claimed" }, originTier: "unknown",
    factors: {
      canadian: f(null, "unknown", "Roasting location not shown."),
      local: f(null, "unknown", "Supplier not disclosed."),
      fairTrade: f(null, "unknown", "No certification found. This does NOT prove unfair labour."),
      animal: NA(),
      environment: f(null, "unknown", "No data."),
      packaging: f(35, "verified", "Plastic canister.", "Label"),
    }, recycling: "Plastic canister → blue cart.", stores: ["s1", "s5", "s8"] },

  // ---------------- Chocolate (extra) ----------------
  { id: "p46", barcode: "0628000000462", emoji: "🍫", category: "Chocolate", name: "Wascana Chocolate Co. Sea Salt Bar", brand: "Wascana Chocolate Co.", price: 5.99, size: "80 g",
    owner: { name: "Wascana Chocolate Co. (Regina, SK)", status: "verified" }, originTier: "made_in_canada",
    factors: {
      canadian: f(55, "verified", "Made in Regina. Cocoa is imported (can't be grown in Canada).", "SK registry"),
      local: f(100, "verified", "Regina-owned small business.", "SK corporate registry"),
      fairTrade: f(70, "claimed", "Says it buys cocoa directly from farmer co-ops ('direct trade'), not certified.", "Company website"),
      animal: NA("Dairy-free dark chocolate."),
      environment: f(null, "unknown", "No data."),
      packaging: f(80, "claimed", "Paper wrapper.", "Label"),
    }, recycling: "Paper → blue cart.", stores: ["s3"] },
];

module.exports = { MORE_STORES, MORE_PRODUCTS };

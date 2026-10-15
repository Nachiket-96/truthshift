// Builds TruthShift_Presentation.pptx
const path = require("path");
const pptxgen = require("pptxgenjs");
// Optional helper that writes the palette into the deck's theme. Set APPLY_THEME_JS to its path to use it;
// without it the deck is still complete (every color on the slides is set directly).
let applyTheme = async () => {};
if (process.env.APPLY_THEME_JS) ({ applyTheme } = require(process.env.APPLY_THEME_JS));

const OUT = path.resolve(__dirname, "..", "TruthShift_Presentation.pptx");

const THEME = {
  name: "TruthShift",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "14302A", lt1: "FFFFFF", dk2: "4A5A52", lt2: "E7EFE9",
    accent1: "1F7A4D", accent2: "D9822B", accent3: "8FD4AE", accent4: "C9DDD2",
    accent5: "1D4038", accent6: "F6F7F2", hlink: "1F7A4D", folHlink: "4A5A52",
  },
};
// Hex copies for hex-only options and for exact tints
const HEX = { dark: "14302A", darkCard: "1D4038", soft: "4A5A52", tint: "E7EFE9", accent: "1F7A4D", amber: "D9822B",
  mint: "8FD4AE", mintText: "C9DDD2", line: "D9E0DA", card: "FFFFFF", page: "F6F7F2", grey: "C9D0CC", muted: "6B7A72" };

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.title = "TruthShift";
pres.author = "[Team name]";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

const W = 10, M = 0.5;

// ---------- Layouts ----------
const footer = color => ({ text: { text: "TruthShift · RODS Tech Skills Showcase 2026", options: { x: M, y: 5.2, w: 7, h: 0.3, fontSize: 10, color, isTextBox: true } } });

pres.defineSlideMaster({
  title: "COVER",
  background: { color: HEX.dark },
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: 0.6, y: 0.55, w: 8.8, h: 0.4, fontSize: 13, bold: true, color: HEX.mint, charSpacing: 2 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.35, w: 8.8, h: 1.9, fontSize: 48, bold: true, color: "F6F7F2", fontFace: THEME.headFontFace, valign: "top", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 3.3, w: 7.8, h: 0.9, fontSize: 18, color: HEX.mintText, valign: "top" }, text: "" } },
  ],
});

const contentLayout = (title, bg, ink, eyebrowColor, footColor) => pres.defineSlideMaster({
  title,
  background: { color: bg },
  margin: [0.4, 0.5, 0.5, 0.5],
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.32, w: 9, h: 0.3, fontSize: 11, bold: true, color: eyebrowColor, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.62, w: 9, h: 0.95, fontSize: 26, bold: true, color: ink, fontFace: THEME.headFontFace, valign: "top", align: "left", margin: 0 }, text: "" } },
    footer(footColor),
  ],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: footColor, align: "right" },
});
contentLayout("CONTENT", HEX.page, HEX.dark, HEX.accent, HEX.muted);
contentLayout("CONTENT_TINT", HEX.tint, HEX.dark, HEX.accent, HEX.muted);
contentLayout("CONTENT_DARK", HEX.dark, "F6F7F2", HEX.mint, "8FA89B");

// ---------- Helpers ----------
const add = (layout, section, eyebrow, title, notes) => {
  const s = pres.addSlide({ masterName: layout, sectionTitle: section });
  s.addText(eyebrow.toUpperCase(), { placeholder: "eyebrow" });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
};
const card = (s, x, y, w, h, name, fill = HEX.card, line = HEX.line) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: line, width: 0.75 }, objectName: name });
const text = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, valign: "top", ...o });
const circle = (s, x, y, d, fill, label, color, size, name) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name });
  text(s, label, { x, y, w: d, h: d, fontSize: size, color, align: "center", valign: "middle", bold: true });
};

// ---------- 1. Cover ----------
pres.addSection({ title: "Problem and audience" });
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Problem and audience" });
  s.addText("RODS TECH SKILLS SHOWCASE 2026", { placeholder: "eyebrow" });
  s.addText("TruthShift", { placeholder: "title" });
  s.addText("Shop by your own values, and see exactly how sure we are about every fact.", { placeholder: "body" });
  text(s, "[Team name] · [Member 1], [Member 2], [Member 3], [Member 4], [Member 5]", { x: 0.6, y: 4.75, w: 8.8, h: 0.35, fontSize: 13, color: HEX.mintText });
  s.addNotes("Hi, we are [team name]. Our project is TruthShift, our answer to the RODS challenge. In one line: you tell the app what matters to you, scan a product, and it tells you how well that product fits your values, and how sure it is.");
}

// ---------- 2. Problem ----------
{
  const s = add("CONTENT", "Problem and audience", "The problem", "People want to shop ethically, but the facts are scattered and hard to trust",
    "Shoppers care about buying Canadian, supporting local business, fair labour, animal welfare and waste. But the information is scattered, and a label can be misleading. Made in Canada can mean imported ingredients. And missing information is not the same as bad behaviour.");
  const items = [
    ["Where is it made?", "“Made in Canada” can still mean imported ingredients."],
    ["Who owns the company?", "A familiar Canadian brand may have a foreign parent company."],
    ["Fair to workers and animals?", "Certifications, company claims and silence all look alike on a shelf."],
    ["What happens to the packaging?", "Recycling rules differ by city, and Regina has its own."],
  ];
  items.forEach(([h, b], i) => {
    const x = M + (i % 2) * 4.6, y = 1.8 + Math.floor(i / 2) * 1.6;
    card(s, x, y, 4.4, 1.4, `problem-card-${i + 1}`);
    circle(s, x + 0.25, y + 0.3, 0.5, HEX.tint, "?", HEX.accent, 18, `problem-icon-${i + 1}`);
    text(s, h, { x: x + 0.95, y: y + 0.25, w: 3.25, h: 0.35, fontSize: 15, bold: true, color: HEX.dark });
    text(s, b, { x: x + 0.95, y: y + 0.65, w: 3.25, h: 0.65, fontSize: 13, color: HEX.soft });
  });
}

// ---------- 3. Audience ----------
{
  const s = add("CONTENT_TINT", "Problem and audience", "Who we built it for", "Newcomers to Regina, shopping in a new country on a real budget",
    "RODS serves newcomers, so we designed for them: their language, their budget, and their new city. For example, red lentils are a staple for many newcomer families, and Saskatchewan grows a large share of the world’s lentils. The app shows that.");
  const cols = [
    ["Aa", "Their language", "English, French and Gujarati screens. Claude answers questions in the chosen language."],
    ["$", "Their budget", "Affordability is a priority like any other, and every alternative shows the price difference."],
    ["R", "Their city", "Regina stores on a map, local businesses, and Regina’s blue- and green-cart rules."],
  ];
  cols.forEach(([icon, h, b], i) => {
    const x = M + i * 3.07;
    card(s, x, 1.85, 2.86, 2.95, `audience-card-${i + 1}`);
    circle(s, x + 0.3, 2.1, 0.7, HEX.accent, icon, "FFFFFF", 20, `audience-icon-${i + 1}`);
    text(s, h, { x: x + 0.3, y: 3.0, w: 2.3, h: 0.4, fontSize: 17, bold: true, color: HEX.dark });
    text(s, b, { x: x + 0.3, y: 3.45, w: 2.3, h: 1.2, fontSize: 13, color: HEX.soft });
  });
}

// ---------- 4. Solution ----------
pres.addSection({ title: "Solution" });
{
  const s = add("CONTENT", "Solution", "Our solution", "One app, five screens",
    "Five screens. Set your priorities once, then scan, compare, ask, or find a store. Every screen uses the same scoring engine, so the numbers always agree.");
  const screens = [
    ["1", "Priorities", "7 sliders or a preset set what “ethical” means to you."],
    ["2", "Scan", "Barcode, photo or search. Score, evidence and better options."],
    ["3", "Compare", "A whole category side by side, sorted by your score."],
    ["4", "Ask", "Plain-language questions, answered from our data only."],
    ["5", "Nearby", "Regina stores, distances and the best picks at each."],
  ];
  screens.forEach(([n, h, b], i) => {
    const x = M + i * 1.82;
    card(s, x, 1.85, 1.7, 2.95, `screen-card-${i + 1}`);
    circle(s, x + 0.22, 2.1, 0.55, HEX.accent, n, "FFFFFF", 16, `screen-number-${i + 1}`);
    text(s, h, { x: x + 0.22, y: 2.85, w: 1.3, h: 0.4, fontSize: 16, bold: true, color: HEX.dark });
    text(s, b, { x: x + 0.22, y: 3.3, w: 1.3, h: 1.4, fontSize: 12, color: HEX.soft });
  });
}

// ---------- 5. Evidence ----------
{
  const s = add("CONTENT_DARK", "Solution", "How we stay honest", "Every fact shows its evidence, and unknown never counts as bad",
    "This is the part of the challenge we took most seriously: communicate uncertainty and do not mislead. Each fact is labelled verified, claimed or unknown. A chocolate bar with no information about labour is not marked unfair. It is marked unknown, and its confidence goes down.");
  const kinds = [
    ["Verified", HEX.mint, "Confirmed by a certifier, government or registry. Counts fully."],
    ["Claimed", "F2C27B", "Said by the company or a community database. Counts at 60%."],
    ["Unknown", HEX.grey, "Left out of the score. Lowers the confidence meter instead."],
  ];
  kinds.forEach(([label, color, b], i) => {
    const x = M + i * 3.07;
    card(s, x, 1.85, 2.86, 2.2, `evidence-card-${i + 1}`, HEX.darkCard, HEX.darkCard);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: 2.15, w: 1.45, h: 0.45, rectRadius: 0.22, fill: { color }, line: { color }, objectName: `evidence-pill-${i + 1}` });
    text(s, label, { x: x + 0.3, y: 2.15, w: 1.45, h: 0.45, fontSize: 14, bold: true, color: HEX.dark, align: "center", valign: "middle" });
    text(s, b, { x: x + 0.3, y: 2.8, w: 2.3, h: 1.1, fontSize: 14, color: HEX.mintText });
  });
  text(s, [
    { text: "Every product gets a score ", options: {} },
    { text: "and", options: { bold: true } },
    { text: " a confidence level. Below 40% known, it is flagged “Limited data”.", options: {} },
  ], { x: M, y: 4.35, w: 9, h: 0.5, fontSize: 16, color: "F6F7F2" });
}

// ---------- 6. Tiers ----------
{
  const s = add("CONTENT", "Solution", "Buy Canadian, precisely", "“Canadian” is four different things, so we show four tiers",
    "The challenge sheet itself says a product made in Canada does not mean all its parts are Canadian. So instead of one Canadian checkmark we show which tier applies, with a one-line explanation.");
  const head = { bold: true, color: "FFFFFF", fill: { color: HEX.dark }, fontSize: 14 };
  const rows = [
    [{ text: "Tier", options: head }, { text: "What it means", options: head }],
    ["Product of Canada", "Nearly all ingredients, processing and labour are Canadian"],
    ["Made in Canada", "Made here, but some ingredients are imported (peanuts, cocoa, coffee)"],
    ["Canadian-owned", "A Canadian company, possibly making the product elsewhere"],
    ["Imported", "Made outside Canada by a non-Canadian company"],
  ].map((r, i) => i === 0 ? r : r.map((c, j) => ({ text: c, options: { fontSize: 13, color: HEX.dark, bold: j === 0, fill: { color: i % 2 ? HEX.card : HEX.page } } })));
  s.addTable(rows, { x: M, y: 1.8, w: 9, colW: [2.6, 6.4], border: { type: "solid", color: HEX.line, pt: 0.75 }, rowH: 0.42, objectName: "tiers-table" });
  card(s, M, 4.15, 9, 0.75, "tiers-example", HEX.tint, HEX.tint);
  text(s, "Example from our data: a honey labelled “Blend of Canada and Argentina” scores 30 on Buy Canadian, not 100.",
    { x: M + 0.25, y: 4.15, w: 8.5, h: 0.75, fontSize: 14, color: HEX.dark, valign: "middle" });
}

// ---------- 7. Scoring ----------
{
  const s = add("CONTENT_TINT", "Solution", "The scoring engine", "Your weights × how much we trust each fact",
    "The formula is simple on purpose, so we can explain any score. Your weight times how much we trust the fact. Verified counts fully, claimed counts 60 percent, unknown is left out. The peanut butter example is a Regina-made product: 76 out of 100, medium confidence, because we could not confirm fair trade.");
  card(s, M, 1.8, 5.3, 0.75, "formula-box");
  text(s, "score = Σ(weight × trust × fact) ÷ Σ(weight × trust)", { x: M + 0.2, y: 1.8, w: 5.0, h: 0.75, fontSize: 15, bold: true, color: HEX.dark, valign: "middle" });
  text(s, [
    { text: "Weight: 0 to 5, set by you", options: { bullet: true, breakLine: true } },
    { text: "Trust: verified 1.0, claimed 0.6, unknown left out", options: { bullet: true, breakLine: true } },
    { text: "Affordability: cheapest in its category = 100", options: { bullet: true, breakLine: true } },
    { text: "Rankings favour products we know more about", options: { bullet: true } },
  ], { x: M, y: 2.8, w: 5.3, h: 2.0, fontSize: 14, color: HEX.soft, paraSpaceAfter: 6 });
  card(s, 6.1, 1.8, 3.4, 3.0, "example-card");
  text(s, "DEFAULT PRIORITIES", { x: 6.35, y: 2.0, w: 3.0, h: 0.3, fontSize: 10, bold: true, color: HEX.accent, charSpacing: 2 });
  text(s, "Prairie Creamy Peanut Butter", { x: 6.35, y: 2.3, w: 3.0, h: 0.6, fontSize: 15, bold: true, color: HEX.dark });
  text(s, "76", { x: 6.35, y: 2.85, w: 3.0, h: 0.9, fontSize: 60, bold: true, color: HEX.accent, fontFace: THEME.headFontFace });
  text(s, "Medium confidence. Strong on Support Regina and Buy Canadian. Fair trade is unknown, so it is not counted.",
    { x: 6.35, y: 3.75, w: 3.0, h: 0.95, fontSize: 12, color: HEX.soft });
}

// ---------- 8. Demo ----------
pres.addSection({ title: "Demo" });
{
  const s = add("CONTENT", "Demo", "Live demo", "Three minutes with a newcomer family shopping at Superstore",
    "Demo script. 1: Priorities tab, Buy Canadian preset, language Gujarati. 2: Scan tab, search peanut, open Prairie Creamy Peanut Butter, 76, medium confidence, point to the evidence badges and the Made in Canada tier. 3: open ChocoMax Milk Bar, low confidence, unknowns are not counted. 4: Ask tab, first example question. 5: Show on map from the product, then type the real barcode 3017620422003 for a live Open Food Facts lookup. Backup if the internet fails: everything except steps 4 and 5 runs offline.");
  const steps = [
    "Choose the “Buy Canadian” preset and switch the language to Gujarati",
    "Scan peanut butter: see the score, the evidence and a better local option",
    "Open a chocolate bar with little information: Low confidence, nothing punished",
    "Ask: “Canadian, no plastic, fair labour. Which coffee?”",
    "Show which nearby stores carry the best pick, then scan a real product live",
  ];
  steps.forEach((t, i) => {
    const y = 1.8 + i * 0.62;
    circle(s, M, y, 0.45, HEX.accent, String(i + 1), "FFFFFF", 14, `demo-step-${i + 1}`);
    text(s, t, { x: M + 0.65, y, w: 8.3, h: 0.45, fontSize: 15, color: HEX.dark, valign: "middle" });
  });
}

// ---------- 9. Architecture ----------
pres.addSection({ title: "How it is built" });
{
  const s = add("CONTENT_TINT", "How it is built", "How it is built", "A React app talks to one FastAPI backend that owns the data and rules",
    "The React frontend never scores anything itself; it asks the backend. The backend has the scoring rules, the dataset, and calls Open Food Facts and Claude. Map tiles load straight into the browser. FastAPI gives us interactive docs for free, which we can show at localhost:8000/docs.");
  card(s, M, 1.9, 2.6, 1.7, "arch-frontend");
  text(s, "React frontend", { x: M + 0.2, y: 2.05, w: 2.2, h: 0.35, fontSize: 15, bold: true, color: HEX.dark });
  text(s, "5 screens · barcode scanner · Leaflet map · 3 languages", { x: M + 0.2, y: 2.45, w: 2.2, h: 1.0, fontSize: 12, color: HEX.soft });
  s.addShape(pres.shapes.LINE, { x: 3.15, y: 2.75, w: 0.5, h: 0, line: { color: HEX.accent, width: 2, endArrowType: "triangle" }, objectName: "arrow-fe-be" });
  card(s, 3.7, 1.9, 2.7, 1.7, "arch-backend", HEX.dark, HEX.dark);
  text(s, "FastAPI backend", { x: 3.9, y: 2.05, w: 2.3, h: 0.35, fontSize: 15, bold: true, color: "F6F7F2" });
  text(s, "Scoring engine · Ask TruthShift · barcode lookup", { x: 3.9, y: 2.45, w: 2.3, h: 1.0, fontSize: 12, color: HEX.mintText });
  s.addShape(pres.shapes.LINE, { x: 5.05, y: 3.6, w: 0, h: 0.45, line: { color: HEX.accent, width: 2, endArrowType: "triangle" }, objectName: "arrow-be-data" });
  card(s, 3.7, 4.1, 2.7, 0.75, "arch-data");
  text(s, "JSON dataset: products, stores, reference", { x: 3.85, y: 4.1, w: 2.4, h: 0.75, fontSize: 12, color: HEX.dark, valign: "middle" });
  const ext = [["Open Food Facts", "real products"], ["Claude API", "written answers"], ["OpenStreetMap", "map tiles"]];
  ext.forEach(([h, b], i) => {
    const y = 1.9 + i * 0.6;
    if (i < 2) s.addShape(pres.shapes.LINE, { x: 6.45, y: y + 0.25, w: 0.5, h: 0, line: { color: HEX.accent, width: 2, endArrowType: "triangle" }, objectName: `arrow-be-ext-${i + 1}` });
    card(s, 7.0, y, 2.5, 0.5, `arch-ext-${i + 1}`);
    text(s, [{ text: h + "  ", options: { bold: true, color: HEX.dark } }, { text: b, options: { color: HEX.soft } }], { x: 7.15, y, w: 2.3, h: 0.5, fontSize: 12, valign: "middle" });
  });
  text(s, "Map tiles load straight into the browser. One scoring engine serves every screen, so the numbers always agree.",
    { x: 6.95, y: 3.75, w: 2.55, h: 1.1, fontSize: 11, color: HEX.soft });
}

// ---------- 10. Datasets ----------
{
  const s = add("CONTENT", "How it is built", "Our data", "118 products: 46 demo products we wrote, 72 real ones from Open Food Facts",
    "We used two kinds of data. 46 synthetic products with fictional brands, which the challenge allows, so we could show every kind of evidence. And 72 real products from Open Food Facts. The real data proved our main design choice: 94 percent of real products do not list where they are made. If missing data counted as zero, nearly everything would look bad.");
  const stats = [["46", "demo products, 18 categories", HEX.dark], ["72", "real products sold in Canada", HEX.accent], ["10", "Regina stores on the map", HEX.dark]];
  stats.forEach(([n, l, c], i) => {
    const y = 1.75 + i * 1.05;
    card(s, M, y, 3.0, 0.92, `stat-${i + 1}`);
    text(s, n, { x: M + 0.2, y: y + 0.08, w: 1.0, h: 0.75, fontSize: 36, bold: true, color: c, fontFace: THEME.headFontFace, valign: "middle" });
    text(s, l, { x: M + 1.25, y: y + 0.08, w: 1.65, h: 0.75, fontSize: 12, color: HEX.soft, valign: "middle" });
  });
  const labels = ["Buy Canadian", "Fair trade", "Animal welfare", "Environment", "Packaging"];
  s.addChart(pres.charts.BAR, [
    { name: "Demo products", labels, values: [89, 50, 73, 65, 100] },
    { name: "Real products (Open Food Facts)", labels, values: [6, 0, 8, 85, 3] },
  ], {
    x: 3.75, y: 1.65, w: 5.75, h: 3.3, barDir: "bar", barGrouping: "clustered",
    chartColors: [HEX.grey, HEX.accent],
    showTitle: true, title: "Share of products with a known fact (%)", titleFontSize: 12, titleColor: HEX.dark, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: HEX.dark, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0\"%\"",
    catAxisLabelColor: HEX.soft, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
    valAxisHidden: true, valAxisMaxVal: 110, valAxisMinVal: 0, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: HEX.soft, legendFontFace: "+mn-lt",
    objectName: "known-facts-chart",
  });
  text(s, "Only 4 of 72 real products say where they are made, and none list a fair-trade label.",
    { x: M, y: 4.95, w: 9, h: 0.25, fontSize: 11, italic: true, color: HEX.accent });
}

// ---------- 11. Stack ----------
{
  const s = add("CONTENT_TINT", "How it is built", "Tech stack", "Free, open tools a student team can extend",
    "Everything here is free and open source except the optional Claude API. The app still works without it.");
  const head = { bold: true, color: "FFFFFF", fill: { color: HEX.dark }, fontSize: 13 };
  const rows = [
    [{ text: "Layer", options: head }, { text: "Technology", options: head }, { text: "Why", options: head }],
    ["Frontend", "React 19 + Vite", "Reusable components, instant reloads"],
    ["Backend", "Python FastAPI + Uvicorn", "Readable, fast, automatic API docs"],
    ["AI", "Claude API (Anthropic SDK)", "Answers in 3 languages from our data only"],
    ["Scanning", "html5-qrcode", "Camera or photo, in the browser"],
    ["Maps", "Leaflet + OpenStreetMap", "Free map data, no API key"],
    ["Data", "JSON files + Open Food Facts API", "Editable without code; real products"],
  ].map((r, i) => i === 0 ? r : r.map((c, j) => ({ text: c, options: { fontSize: 12, color: HEX.dark, bold: j === 0, fill: { color: i % 2 ? HEX.card : HEX.page } } })));
  s.addTable(rows, { x: M, y: 1.8, w: 9, colW: [1.6, 3.4, 4.0], border: { type: "solid", color: HEX.line, pt: 0.75 }, rowH: 0.42, objectName: "stack-table" });
}

// ---------- 12. Next ----------
pres.addSection({ title: "Next steps" });
{
  const s = add("CONTENT", "Next steps", "What’s next", "The method works; the next step is real Regina data",
    "We want to be upfront about the limits. The scores demonstrate the method on synthetic data; they do not judge real brands. With real label photos and certification checks, the same app works on real Regina shelves.");
  const cols = [
    ["Limits today", HEX.amber, ["Demo products use fictional brands", "Store locations are approximate", "Real products have no prices yet", "AI answers need an API key"]],
    ["Next steps", HEX.accent, ["Photograph 20–30 real products in Regina stores", "Check certifications against official registries", "Add flyer prices and a weekly price tracker", "Add Arabic, Ukrainian, Tigrinya and Dari"]],
  ];
  cols.forEach(([h, color, items], i) => {
    const x = M + i * 4.6;
    card(s, x, 1.8, 4.4, 3.05, `next-card-${i + 1}`);
    circle(s, x + 0.25, 2.0, 0.45, color, i ? "→" : "!", "FFFFFF", 16, `next-icon-${i + 1}`);
    text(s, h, { x: x + 0.85, y: 2.0, w: 3.3, h: 0.45, fontSize: 17, bold: true, color: HEX.dark, valign: "middle" });
    text(s, items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })),
      { x: x + 0.25, y: 2.65, w: 3.95, h: 2.05, fontSize: 14, color: HEX.soft, paraSpaceAfter: 6 });
  });
}

// ---------- 13. Thanks ----------
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Next steps" });
  s.addText("QUESTIONS", { placeholder: "eyebrow" });
  s.addText("Thank you", { placeholder: "title" });
  s.addText("Your values, honest evidence, and the store around the corner.", { placeholder: "body" });
  text(s, "Try it live: [demo link]", { x: 0.6, y: 4.75, w: 8.8, h: 0.35, fontSize: 14, color: HEX.mint });
  s.addNotes("Thank you. We are happy to take questions, or let you try it on your own phone.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Wrote", OUT);
})();

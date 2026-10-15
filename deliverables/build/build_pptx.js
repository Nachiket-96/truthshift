// Builds TruthShift_Presentation.pptx: visual deck (app screenshots, icons, charts, few words).
// Screenshots come from screenshots.py (run it with the app running), cropped into shots/*_crop.jpg.
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const lu = require("react-icons/lu");
const pptxgen = require("pptxgenjs");

// Optional helper that writes the palette into the deck's theme. Set APPLY_THEME_JS to its path to use it;
// without it the deck is still complete (every color on the slides is set directly).
let applyTheme = async () => {};
if (process.env.APPLY_THEME_JS) ({ applyTheme } = require(process.env.APPLY_THEME_JS));

const OUT = path.resolve(__dirname, "..", "TruthShift_Presentation.pptx");
const SHOT = name => path.join(__dirname, "shots", `${name}_crop.jpg`);

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
const HEX = { dark: "14302A", darkCard: "1D4038", soft: "4A5A52", tint: "E7EFE9", accent: "1F7A4D", amber: "D9822B",
  mint: "8FD4AE", mintText: "C9DDD2", line: "D9E0DA", card: "FFFFFF", page: "F6F7F2", grey: "AEB8B2", muted: "6B7A72", light: "F6F7F2" };

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.title = "TruthShift";
pres.author = "[Team name]";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const M = 0.5;

// ---------- icons: react-icons (Lucide) → PNG ----------
async function icon(name, color, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(lu[name], { color: "#" + color, size: px }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ---------- layouts ----------
pres.defineSlideMaster({ title: "COVER", background: { color: HEX.dark }, objects: [] });
const contentLayout = (title, bg, ink, footColor) => pres.defineSlideMaster({
  title,
  background: { color: bg },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.35, w: 9, h: 0.75, fontSize: 30, bold: true, color: ink,
      fontFace: THEME.headFontFace, valign: "top", align: "left", margin: 0 }, text: "" } },
    { text: { text: "TruthShift", options: { x: M, y: 5.2, w: 3, h: 0.3, fontSize: 10, bold: true, color: footColor, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: footColor, align: "right" },
});
contentLayout("CONTENT", HEX.page, HEX.dark, HEX.muted);
contentLayout("CONTENT_DARK", HEX.dark, HEX.light, "8FA89B");

// ---------- helpers ----------
const add = (layout, section, title, notes) => {
  const s = pres.addSlide({ masterName: layout, sectionTitle: section });
  if (title) s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
};
const text = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, valign: "top", ...o });
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.18, blur: 8, offset: 3, angle: 90 });
const shot = (s, name, x, y, w, h, alt) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, rectRadius: 0.08,
    fill: { color: "FFFFFF" }, line: { color: HEX.line, width: 0.75 }, shadow: shadow(), objectName: `frame-${name}` });
  s.addImage({ path: SHOT(name), x, y, w, h, altText: alt, objectName: `screenshot-${name}` });
};
async function iconCircle(s, name, x, y, d, bg, fg, objectName) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg }, objectName: `${objectName}-circle` });
  const pad = d * 0.24;
  s.addImage({ data: await icon(name, fg), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: `${objectName}-icon`, altText: "" });
}

(async () => {
  // ---------- 1. Cover ----------
  pres.addSection({ title: "Why" });
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Why" });
    text(s, "RODS TECH SKILLS SHOWCASE 2026", { x: 0.6, y: 0.6, w: 5.5, h: 0.3, fontSize: 12, bold: true, color: HEX.mint, charSpacing: 2 });
    text(s, "TruthShift", { x: 0.6, y: 1.55, w: 5.6, h: 1.1, fontSize: 64, bold: true, color: HEX.light, fontFace: THEME.headFontFace });
    text(s, "Shop by your values.\nSee what’s true.", { x: 0.6, y: 2.75, w: 5.2, h: 1.0, fontSize: 24, color: HEX.mintText });
    text(s, "[Team name] · [Member 1], [Member 2], [Member 3], [Member 4], [Member 5]", { x: 0.6, y: 4.85, w: 5.6, h: 0.3, fontSize: 11, color: HEX.mintText });
    // phone screenshot, framed like a device
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.55, y: 0.45, w: 2.85, h: 4.72, rectRadius: 0.22, fill: { color: "0B1B17" }, line: { color: "35574D", width: 1.5 }, shadow: shadow(), objectName: "phone-frame" });
    s.addImage({ path: SHOT("phone"), x: 6.67, y: 0.57, w: 2.61, h: 4.24, altText: "TruthShift on a phone: Prairie Creamy Peanut Butter scores 76 with Medium confidence", objectName: "phone-screenshot" });
    s.addNotes("Hi, we are [team name]. Our project is TruthShift, our answer to the RODS challenge The Ethical Consumer Compass. In one line: you tell the app what matters to you, scan a product, and it tells you how well that product fits your values, and how sure it is. This is the real app on a phone.");
  }

  // ---------- 2. Big stat ----------
  {
    const s = add("CONTENT_DARK", "Why", null,
      "We imported 72 real products sold in Canada from Open Food Facts, the largest open food database. 68 of them, 94 percent, do not say where they are made. None list a fair-trade label. This is the problem: shoppers want to buy Canadian and ethically, but the facts are simply not there. And a tool that treats missing facts as bad would call almost everything unethical.");
    text(s, "94%", { x: M, y: 0.9, w: 9, h: 2.2, fontSize: 150, bold: true, color: HEX.mint, fontFace: THEME.headFontFace, align: "left" });
    text(s, "of real products don’t say where they’re made", { x: M, y: 3.2, w: 8.5, h: 0.6, fontSize: 28, color: HEX.light });
    text(s, "68 of 72 Canadian products in Open Food Facts", { x: M, y: 3.9, w: 8, h: 0.4, fontSize: 14, color: HEX.mintText });
  }

  // ---------- 3. Four questions ----------
  {
    const s = add("CONTENT", "Why", "Shoppers can’t see the facts",
      "Four questions every ethical shopper asks, and none are easy to answer on a shelf. Where is it made? Made in Canada can still mean imported ingredients. Who owns the company? A familiar brand may have a foreign parent. Is it fair to workers and animals? Certifications, company claims and silence all look alike. And what happens to the packaging? Recycling rules differ by city, and Regina has its own.");
    const qs = [["LuFactory", "Made where?"], ["LuBuilding2", "Owned by whom?"], ["LuHandshake", "Fair to workers?"], ["LuRecycle", "Packaging waste?"]];
    for (let i = 0; i < qs.length; i++) {
      const x = M + i * 2.3;
      await iconCircle(s, qs[i][0], x + 0.35, 1.7, 1.4, HEX.tint, HEX.accent, `question-${i + 1}`);
      text(s, qs[i][1], { x, y: 3.35, w: 2.1, h: 0.5, fontSize: 18, bold: true, color: HEX.dark, align: "center" });
    }
  }

  // ---------- 4. Newcomers ----------
  {
    const s = add("CONTENT", "Why", "Built for newcomers to Regina",
      "RODS serves newcomers, so we designed for them. Their language: English, French and Gujarati screens, and the AI answers in the chosen language. Their budget: affordability is a priority like any other, and every better option shows the price difference. Their city: Regina stores on a map, local businesses, and Regina’s blue and green cart recycling rules.");
    const cols = [["LuLanguages", "3 languages", "English · Français · ગુજરાતી"], ["LuWallet", "Real budgets", "Price is a priority too"], ["LuMapPin", "Regina stores", "Local shops on a map"]];
    for (let i = 0; i < cols.length; i++) {
      const x = M + i * 3.07;
      await iconCircle(s, cols[i][0], x + 0.78, 1.6, 1.3, HEX.accent, "FFFFFF", `newcomer-${i + 1}`);
      text(s, cols[i][1], { x, y: 3.1, w: 2.86, h: 0.45, fontSize: 20, bold: true, color: HEX.dark, align: "center" });
      text(s, cols[i][2], { x, y: 3.6, w: 2.86, h: 0.4, fontSize: 14, color: HEX.soft, align: "center" });
    }
  }

  // ---------- 5. Solution: product screen ----------
  pres.addSection({ title: "What it does" });
  {
    const s = add("CONTENT", "What it does", "Scan. See the score. See the proof.",
      "This is the product screen. Prairie Creamy Peanut Butter scores 76 out of 100 for the default priorities, with Medium confidence. Every fact shows its evidence: verified, claimed or unknown, with the source. Below, it shows where to buy it in Regina and how to recycle the jar.");
    shot(s, "detail", M, 1.3, 5.6, 3.62, "Product screen: score 76, Medium confidence, evidence badges for each factor");
    const pts = [["LuScanLine", "Scan or search"], ["LuShieldCheck", "Evidence on every fact"], ["LuStore", "Better options nearby"]];
    for (let i = 0; i < pts.length; i++) {
      const y = 1.55 + i * 1.1;
      await iconCircle(s, pts[i][0], 6.55, y, 0.75, HEX.accent, "FFFFFF", `solution-${i + 1}`);
      text(s, pts[i][1], { x: 7.45, y, w: 2.1, h: 0.75, fontSize: 16, bold: true, color: HEX.dark, valign: "middle" });
    }
  }

  // ---------- 6. Evidence ----------
  {
    const s = add("CONTENT_DARK", "What it does", "Every fact shows its evidence",
      "The part of the challenge we took most seriously: communicate uncertainty and do not mislead. Verified means a certifier, government or registry confirmed it, and it counts fully. Claimed means the company or a community database says so, and it counts at 60 percent. Unknown is left out of the score completely and lowers the confidence meter instead. So a product with no labour information is not called unfair. It is called unknown.");
    const kinds = [["LuCircleCheck", HEX.mint, "Verified", "counts 100%"], ["LuTriangleAlert", "F2C27B", "Claimed", "counts 60%"], ["LuCircleHelp", "C9D0CC", "Unknown", "not counted"]];
    for (let i = 0; i < kinds.length; i++) {
      const x = M + i * 3.07;
      s.addImage({ data: await icon(kinds[i][0], kinds[i][1]), x: x + 0.88, y: 1.45, w: 1.1, h: 1.1, objectName: `evidence-icon-${i + 1}`, altText: "" });
      text(s, kinds[i][2], { x, y: 2.75, w: 2.86, h: 0.5, fontSize: 24, bold: true, color: kinds[i][1], align: "center" });
      text(s, kinds[i][3], { x, y: 3.25, w: 2.86, h: 0.4, fontSize: 15, color: HEX.mintText, align: "center" });
    }
    text(s, "Unknown ≠ bad", { x: M, y: 4.15, w: 9, h: 0.6, fontSize: 28, bold: true, color: HEX.light, align: "center", fontFace: THEME.headFontFace });
  }

  // ---------- 7. Personalization chart ----------
  {
    const s = add("CONTENT", "What it does", "Different shopper, different winner",
      "Ethical means different things to different people, so the score is personal. These are three coffees from our demo data, scored for three shopper types using the app’s presets. A Buy Canadian shopper gets Queen City Dark Roast, roasted in Regina, at 61. A fair-labour shopper gets Fairway Organic, Fairtrade certified, at 68. A shopper on a tight budget gets Big Bean Instant at 68. Same products, same facts, different priorities.");
    const shoppers = ["Buy Canadian", "Fair labour", "Tight budget"];
    s.addChart(pres.charts.BAR, [
      { name: "Queen City Dark Roast", labels: shoppers, values: [61, 66, 35] },
      { name: "Fairway Organic", labels: shoppers, values: [42, 68, 49] },
      { name: "Big Bean Instant", labels: shoppers, values: [30, 48, 68] },
    ], {
      x: M, y: 1.25, w: 9, h: 3.8, barDir: "col", barGrouping: "clustered", barGapWidthPct: 60,
      chartColors: [HEX.accent, HEX.amber, "7C8C84"],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: HEX.dark, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true,
      catAxisLabelColor: HEX.dark, catAxisLabelFontSize: 14, catAxisLabelFontFace: "+mn-lt",
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 80, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "t", legendFontSize: 13, legendColor: HEX.soft, legendFontFace: "+mn-lt",
      objectName: "personal-score-chart",
    });
  }

  // ---------- 8. App tour ----------
  pres.addSection({ title: "Demo" });
  {
    const s = add("CONTENT", "Demo", "Live demo",
      "Demo script. 1: Priorities tab, Buy Canadian preset, switch language to Gujarati. 2: Scan tab, search peanut, open Prairie Creamy Peanut Butter: 76, medium confidence, point at the evidence badges and the Made in Canada tier. 3: Compare tab, Coffee: well-documented products first, limited-data products last. 4: Ask tab: Canadian, no plastic, fair labour, which coffee? 5: Nearby tab: stores and distances. 6: type the real barcode 3017620422003 for a live Open Food Facts lookup. Backup if the internet fails: everything except the live lookup runs locally.");
    const tiles = [["priorities", "Priorities"], ["compare", "Compare"], ["ask", "Ask"], ["nearby", "Nearby"]];
    tiles.forEach(([name, label], i) => {
      const x = 1.22 + (i % 2) * 3.98, y = 1.2 + Math.floor(i / 2) * 2.02;
      shot(s, name, x, y, 3.58, 1.82, `${label} screen of the TruthShift app`);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.12, y: y + 1.35, w: 1.25, h: 0.35, rectRadius: 0.17, fill: { color: HEX.dark }, line: { color: HEX.dark }, objectName: `label-pill-${name}` });
      text(s, label, { x: x + 0.12, y: y + 1.35, w: 1.25, h: 0.35, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    });
  }

  // ---------- 9. Architecture ----------
  pres.addSection({ title: "How it is built" });
  {
    const s = add("CONTENT", "How it is built", "How it works",
      "The React frontend never scores anything itself; it asks the FastAPI backend. The backend owns the scoring rules and the dataset, looks up real products on Open Food Facts, and asks Claude for written answers when an API key is set. Map tiles load from OpenStreetMap straight into the browser. FastAPI gives us interactive API docs for free at localhost:8000/docs.");
    const node = async (name, label, sub, x, y, bg, fg, id) => {
      await iconCircle(s, name, x, y, 1.0, bg, fg, id);
      text(s, label, { x: x - 0.45, y: y + 1.08, w: 1.9, h: 0.35, fontSize: 15, bold: true, color: HEX.dark, align: "center" });
      text(s, sub, { x: x - 0.45, y: y + 1.42, w: 1.9, h: 0.3, fontSize: 11, color: HEX.soft, align: "center" });
    };
    await node("LuMonitorSmartphone", "React app", "phone or laptop", 0.95, 2.1, HEX.tint, HEX.accent, "arch-react");
    await node("LuServer", "FastAPI", "scoring engine", 3.85, 2.1, HEX.dark, HEX.mint, "arch-api");
    await node("LuDatabase", "Our data", "118 products", 7.6, 1.15, HEX.tint, HEX.accent, "arch-data");
    await node("LuBarcode", "Open Food Facts", "real products", 7.6, 2.95, HEX.tint, HEX.accent, "arch-off");
    await node("LuSparkles", "Claude", "AI answers", 5.85, 3.55, HEX.tint, HEX.accent, "arch-claude");
    const arrow = (x, y, w, h, id) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: HEX.accent, width: 2.25, endArrowType: "triangle" }, objectName: id });
    arrow(2.1, 2.6, 1.6, 0, "arrow-react-api");
    s.addShape(pres.shapes.LINE, { x: 5.0, y: 1.75, w: 2.45, h: 0.6, line: { color: HEX.accent, width: 2.25, endArrowType: "triangle" }, flipV: true, objectName: "arrow-api-data" });
    arrow(5.0, 2.85, 2.45, 0.6, "arrow-api-off");
    arrow(4.75, 3.1, 1.0, 0.75, "arrow-api-claude");
  }

  // ---------- Model explanation (2 slides for a teammate to fill in PowerPoint) ----------
  pres.addSection({ title: "Model" });
  const modelSlide = async (title, boxLabel, points, notes, n) => {
    const s = add("CONTENT", "Model", title, notes);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.3, w: 5.6, h: 3.6, rectRadius: 0.12, fill: { color: HEX.tint },
      line: { color: HEX.accent, width: 1.25, dashType: "dash" }, objectName: `model-${n}-visual-area` });
    s.addImage({ data: await icon(n === 1 ? "LuChartColumn" : "LuSparkles", HEX.accent), x: M + 2.45, y: 2.35, w: 0.7, h: 0.7, objectName: `model-${n}-visual-icon`, altText: "" });
    text(s, boxLabel, { x: M + 0.4, y: 3.2, w: 4.8, h: 0.6, fontSize: 14, color: HEX.accent, align: "center" });
    for (let i = 0; i < points.length; i++) {
      const y = 1.5 + i * 1.15;
      await iconCircle(s, ["LuCircleCheck", "LuArrowRight", "LuBadgeCheck"][i], 6.55, y, 0.6, HEX.accent, "FFFFFF", `model-${n}-point-${i + 1}`);
      text(s, points[i], { x: 7.3, y, w: 2.2, h: 0.6, fontSize: 15, bold: true, color: HEX.dark, valign: "middle" });
    }
  };
  await modelSlide("[Model name]: what it does", "Replace with a diagram, chart or screenshot of the model",
    ["[Input: what goes in]", "[Output: what comes out]", "[Why it helps shoppers]"],
    "[Teammate name] presents the model. Explain in plain words what the model takes in, what it produces, and how that helps a shopper.", 1);
  await modelSlide("How the model works", "Replace with the model's steps or architecture",
    ["[Step 1]", "[Step 2]", "[Result or accuracy]"],
    "[Teammate name]: walk through the steps of the model, the data it was trained or tested on, and how well it works. Mention one limitation honestly.", 2);

  // ---------- 10. Data ----------
  {
    const s = add("CONTENT", "How it is built", "118 products, honestly labelled",
      "We used two kinds of data. 46 synthetic products with fictional brands, which the challenge allows, so we could show every kind of evidence. And 72 real products sold in Canada, from Open Food Facts. The chart shows how often a fact is known. In real data, origin, fair trade and packaging are almost always missing; only the Eco-Score is usually there. That is why unknown must never count as bad. Plus 10 Regina stores on the map.");
    const stats = [["46", "demo products"], ["72", "real products"], ["10", "Regina stores"]];
    stats.forEach(([n, l], i) => {
      const y = 1.35 + i * 1.2;
      text(s, n, { x: M, y, w: 1.4, h: 0.8, fontSize: 44, bold: true, color: i === 1 ? HEX.accent : HEX.dark, fontFace: THEME.headFontFace });
      text(s, l, { x: M + 1.45, y: y + 0.2, w: 1.6, h: 0.45, fontSize: 15, color: HEX.soft });
    });
    const labels = ["Origin", "Fair trade", "Animal welfare", "Environment", "Packaging"];
    s.addChart(pres.charts.BAR, [
      { name: "Demo products", labels, values: [89, 50, 73, 65, 100] },
      { name: "Real products", labels, values: [6, 0, 8, 85, 3] },
    ], {
      x: 3.6, y: 1.2, w: 5.9, h: 3.85, barDir: "bar", barGrouping: "clustered", barGapWidthPct: 50,
      chartColors: [HEX.grey, HEX.accent],
      showTitle: true, title: "Facts known (% of products)", titleFontSize: 13, titleColor: HEX.dark, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: HEX.dark, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0\"%\"",
      catAxisLabelColor: HEX.dark, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
      valAxisHidden: true, valAxisMaxVal: 115, valAxisMinVal: 0, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.soft, legendFontFace: "+mn-lt",
      objectName: "known-facts-chart",
    });
  }

  // ---------- 11. Sustainability model ----------
  pres.addSection({ title: "Business model" });
  {
    const s = add("CONTENT", "Business model", "Free for every shopper",
      "TruthShift stays free for shoppers, because our users are newcomers on tight budgets. Three ways to pay for it. One: grants from settlement agencies, the City of Regina and community foundations, because the app supports newcomer integration and local business. Two: verified listings, where a local Regina business pays to have its claims checked, for example its ownership or a certification. If the evidence holds, the fact turns from Claimed to Verified. Paying never raises a score; only evidence does. Three: an optional TruthShift Plus subscription for extra features. The rule on the slide is the one that matters: money never changes a score.");
    const cols = [["LuHandshake", "Grants", "Settlement & city funding"], ["LuBadgeCheck", "Verified listings", "Local businesses pay for checks"], ["LuSparkles", "TruthShift Plus", "Optional premium features"]];
    for (let i = 0; i < cols.length; i++) {
      const x = M + i * 3.07;
      await iconCircle(s, cols[i][0], x + 0.83, 1.35, 1.2, HEX.accent, "FFFFFF", `model-${i + 1}`);
      text(s, cols[i][1], { x, y: 2.7, w: 2.86, h: 0.45, fontSize: 20, bold: true, color: HEX.dark, align: "center" });
      text(s, cols[i][2], { x, y: 3.15, w: 2.86, h: 0.4, fontSize: 14, color: HEX.soft, align: "center" });
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.25, y: 4.05, w: 5.5, h: 0.65, rectRadius: 0.32, fill: { color: HEX.dark }, line: { color: HEX.dark }, objectName: "rule-pill" });
    text(s, "Money never changes a score", { x: 2.25, y: 4.05, w: 5.5, h: 0.65, fontSize: 20, bold: true, color: HEX.mint, align: "center", valign: "middle" });
  }

  // ---------- 12. Free vs Plus ----------
  {
    const s = add("CONTENT", "Business model", "Free today. Plus tomorrow.",
      "Everything in the app today stays free: scanning, personal scores with evidence, compare, the store map, all languages, and a few AI questions a day. A future TruthShift Plus, proposed at about 3 dollars a month, would add unlimited AI questions, a shopping-list planner that finds the best store, price-drop alerts from flyers, and family profiles. RODS clients could get Plus free through a sponsorship. The price is a proposal, to test with users.");
    const plans = [
      { name: "Free", price: "$0", note: "for everyone, always", fill: HEX.card, ink: HEX.dark, sub: HEX.soft, iconBg: HEX.tint, iconFg: HEX.accent,
        items: [["LuScanLine", "Scan & personal scores"], ["LuShieldCheck", "Evidence on every fact"], ["LuMapPin", "Compare & store map"], ["LuMessageCircle", "5 AI questions a day"]] },
      { name: "TruthShift Plus", price: "~$3/mo", note: "proposed · free for RODS clients", fill: HEX.dark, ink: HEX.light, sub: HEX.mintText, iconBg: HEX.darkCard, iconFg: HEX.mint,
        items: [["LuSparkles", "Unlimited AI assistant"], ["LuStore", "Best-store shopping list"], ["LuTag", "Price-drop alerts"], ["LuUsers", "Family profiles"]] },
    ];
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i], x = M + i * 4.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.25, w: 4.4, h: 3.7, rectRadius: 0.12, fill: { color: p.fill }, line: { color: i ? p.fill : HEX.line, width: 0.75 }, shadow: shadow(), objectName: `plan-${i + 1}` });
      text(s, p.name, { x: x + 0.3, y: 1.45, w: 2.4, h: 0.45, fontSize: 20, bold: true, color: p.ink });
      text(s, p.price, { x: x + 2.4, y: 1.4, w: 1.75, h: 0.55, fontSize: 26, bold: true, color: i ? HEX.mint : HEX.accent, align: "right", fontFace: THEME.headFontFace });
      text(s, p.note, { x: x + 0.3, y: 1.92, w: 3.85, h: 0.3, fontSize: 12, color: p.sub });
      for (let k = 0; k < p.items.length; k++) {
        const y = 2.4 + k * 0.6;
        await iconCircle(s, p.items[k][0], x + 0.3, y, 0.45, p.iconBg, p.iconFg, `plan-${i + 1}-item-${k + 1}`);
        text(s, p.items[k][1], { x: x + 0.9, y, w: 3.3, h: 0.45, fontSize: 15, color: p.ink, valign: "middle" });
      }
    }
  }

  // ---------- 13. Running costs ----------
  {
    const s = add("CONTENT", "Business model", "About $8 a month to launch",
      "Running costs in US dollars per month, checked October 2026. Hosting: the React app as a free static site, the FastAPI backend on a Render Starter instance at 7 dollars a month. A .ca domain is about 10 dollars a year, so about 1 dollar a month. Open Food Facts and OpenStreetMap data are free; for heavy map traffic we would move to a map provider such as MapTiler, which is free up to 5,000 sessions a month for non-commercial use. The AI is the only cost that grows with use: about 2 cents per question on Claude with prompt caching, because each question sends about 12,000 tokens of product data. So 1,000 AI questions a month cost about 20 dollars, 10,000 about 200. That is why unlimited AI is the Plus feature.");
    const scen = ["Pilot (no AI)", "1,000 AI questions", "10,000 AI questions"];
    s.addChart(pres.charts.BAR, [
      { name: "Hosting (Render)", labels: scen, values: [7, 7, 7] },
      { name: "Domain (.ca)", labels: scen, values: [1, 1, 1] },
      { name: "AI answers (Claude)", labels: scen, values: [0, 20, 200] },
    ], {
      x: M, y: 1.2, w: 5.9, h: 3.85, barDir: "col", barGrouping: "stacked", barGapWidthPct: 70,
      chartColors: [HEX.accent, HEX.mint, HEX.amber],
      showValue: false,
      catAxisLabelColor: HEX.dark, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt",
      valAxisLabelColor: HEX.soft, valAxisLabelFontSize: 11, valAxisLabelFontFace: "+mn-lt", valAxisLabelFormatCode: "$0",
      valAxisMinVal: 0, valAxisMaxVal: 220, valAxisMajorUnit: 50, valGridLine: { color: "DDE3DE", size: 0.5 }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "t", legendFontSize: 12, legendColor: HEX.soft, legendFontFace: "+mn-lt",
      objectName: "running-cost-chart",
    });
    const totals = [["~$8", "per month to launch"], ["~$28", "with 1,000 AI questions"], ["Free", "Open Food Facts · OpenStreetMap"]];
    totals.forEach(([n, l], i) => {
      const y = 1.35 + i * 1.2;
      text(s, n, { x: 6.7, y, w: 2.8, h: 0.6, fontSize: 32, bold: true, color: i === 2 ? HEX.accent : HEX.dark, fontFace: THEME.headFontFace });
      text(s, l, { x: 6.7, y: y + 0.6, w: 2.8, h: 0.35, fontSize: 13, color: HEX.soft });
    });
    text(s, "USD, October 2026 prices. Estimates; check before launch.", { x: 6.7, y: 4.75, w: 2.8, h: 0.3, fontSize: 10, italic: true, color: HEX.muted });
  }

  // ---------- 14. Next ----------
  pres.addSection({ title: "Next" });
  {
    const s = add("CONTENT", "Next", "What’s next",
      "Today the demo products use fictional brands and store locations are approximate. Next: photograph 20 to 30 real products in Regina stores; check certifications against Fairtrade Canada and organic registries; add real prices from store flyers and a weekly price tracker; and add more languages used by RODS clients, such as Arabic, Ukrainian, Tigrinya and Dari.");
    const steps = [["LuCamera", "Real Regina labels"], ["LuBadgeCheck", "Verified certifications"], ["LuTag", "Flyer prices"], ["LuGlobe", "More languages"]];
    for (let i = 0; i < steps.length; i++) {
      const x = M + i * 2.3;
      await iconCircle(s, steps[i][0], x + 0.45, 1.75, 1.2, HEX.accent, "FFFFFF", `next-${i + 1}`);
      text(s, steps[i][1], { x, y: 3.15, w: 2.1, h: 0.7, fontSize: 17, bold: true, color: HEX.dark, align: "center" });
    }
  }

  // ---------- 12. Thanks ----------
  {
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Next" });
    text(s, "Thank you", { x: 0.6, y: 1.35, w: 8.8, h: 1.1, fontSize: 60, bold: true, color: HEX.light, fontFace: THEME.headFontFace });
    text(s, "Questions?", { x: 0.6, y: 2.5, w: 8.8, h: 0.6, fontSize: 26, color: HEX.mintText });
    s.addImage({ data: await icon("LuGithub", HEX.mint), x: 0.6, y: 3.75, w: 0.45, h: 0.45, objectName: "github-icon", altText: "GitHub" });
    text(s, [{ text: "github.com/Nachiket-96/truthshift", options: { hyperlink: { url: "https://github.com/Nachiket-96/truthshift" } } }],
      { x: 1.2, y: 3.75, w: 6, h: 0.45, fontSize: 18, color: HEX.mint, valign: "middle" });
    s.addNotes("Thank you. The code, this presentation and the documentation are on GitHub. We are happy to take questions, or let you try the app.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Wrote", OUT);
})();

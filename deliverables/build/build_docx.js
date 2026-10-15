// Builds TruthShift_Documentation.docx
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, ImageRun, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents,
} = require("docx");

const OUT = path.resolve(__dirname, "..", "TruthShift_Documentation.docx");
const C = { dark: "14302A", accent: "1F7A4D", soft: "4A5A52", tint: "E7EFE9", line: "D9E0DA", code: "F2F4F1" };
const CONTENT_W = 9360; // US Letter, 1" margins

// ---------- helpers ----------
const runs = text => {
  // **bold** and `code` inline markup
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map(part =>
    part.startsWith("**") ? new TextRun({ text: part.slice(2, -2), bold: true })
      : part.startsWith("`") ? new TextRun({ text: part.slice(1, -1), font: "Consolas", size: 20 })
        : new TextRun(part));
};
const P = (text, opts = {}) => new Paragraph({ children: runs(text), spacing: { after: 140 }, ...opts });
const H1 = text => new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
const H2 = text => new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
const bullet = text => new Paragraph({ children: runs(text), numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 } });
const numbered = text => new Paragraph({ children: runs(text), numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 } });
const code = lines => lines.map((l, i) => new Paragraph({
  children: [new TextRun({ text: l || " ", font: "Consolas", size: 19 })],
  shading: { type: ShadingType.CLEAR, color: "auto", fill: C.code },
  spacing: { after: i === lines.length - 1 ? 160 : 0 },
  indent: { left: 144, right: 144 },
}));
const image = (file, widthPx, heightPx, alt) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 120, after: 80 },
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(__dirname, file)),
    transformation: { width: 600, height: Math.round(600 * heightPx / widthPx) }, altText: { title: alt, description: alt, name: alt } })],
});
const caption = text => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text, italics: true, size: 18, color: C.soft })] });

const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
const table = (widths, rows) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: widths,
  rows: rows.map((row, r) => new TableRow({
    tableHeader: r === 0,
    children: row.map((cell, c) => new TableCell({
      width: { size: widths[c], type: WidthType.DXA },
      borders: { top: border, bottom: border, left: border, right: border },
      shading: r === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: C.dark } : r % 2 === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "F7F9F7" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ children: r === 0 ? [new TextRun({ text: cell, bold: true, color: "FFFFFF", size: 20 })]
        : runs(cell).map(x => x), spacing: { after: 0 } })],
    })),
  })),
});
const gap = () => new Paragraph({ text: "", spacing: { after: 120 } });

// ---------- content ----------
const children = [
  new Paragraph({ spacing: { before: 1200, after: 120 }, children: [new TextRun({ text: "RODS TECH SKILLS SHOWCASE 2026", bold: true, color: C.accent, size: 22, characterSpacing: 40 })] }),
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("TruthShift")] }),
  new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: "Project documentation: features, tech stack, architecture, scoring method and datasets", size: 26, color: C.soft })] }),
  P("**Team:** [Team name] · [Member 1], [Member 2], [Member 3], [Member 4], [Member 5]"),
  P("**Date:** October 15, 2026"),
  P("**Challenge:** The Ethical Consumer Compass (Regina Open Door Society)"),
  new Paragraph({ spacing: { before: 240 }, children: [] }),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ pageBreakBefore: true, children: [] }),

  // 1. Overview
  H1("1. Overview"),
  P("TruthShift is a web app that scores grocery products against each shopper’s own values, and shows how sure it is about every fact. We built it for the Regina Open Door Society (RODS) Tech Skills Showcase 2026 challenge, “The Ethical Consumer Compass”."),
  P("**The problem.** People want to buy Canadian, support Regina businesses, choose fair trade, protect animal welfare and cut packaging waste. The information they need (where a product is made, who owns the company, how workers and animals are treated, what happens to the packaging) is scattered and hard to compare."),
  P("**Our solution.** The shopper sets how much each issue matters to them. They scan or search a product and get a personal score from 0 to 100, a plain-language explanation, and better alternatives at a similar price in nearby stores. Every fact carries an evidence label: Verified, Claimed by the business, or Unknown. Unknown facts never count against a product; they lower a separate confidence meter instead. The app is built for newcomers to Regina, with English, French and Gujarati screens and local recycling guidance."),

  // 2. Features
  H1("2. Features"),
  P("The app has five screens, and each one answers part of the challenge brief."),
  table([1700, 4560, 3100], [
    ["Screen", "What the shopper does", "Challenge point it answers"],
    ["My priorities", "Sets 7 sliders (Buy Canadian, Support Regina/SK, Fair trade, Animal welfare, Environment, Low-waste packaging, Affordability) or picks a preset", "Users set their own priorities; different definitions of ethical"],
    ["Scan & search", "Scans a barcode with the camera or a photo, types a barcode, or searches by name. Gets a personal score, confidence meter, evidence badge on every fact, Canadian-content tier, Regina recycling tip and better alternatives with the price difference", "Buy Canadian scanner; barcode app that explains its score"],
    ["Compare", "Sees every product in a category side by side, sorted by their own score", "Ethical product comparison tool; personalized dashboard"],
    ["Ask TruthShift", "Asks in plain words (“Canadian, no plastic, under $5”) and gets a ranked list, plus a written answer from Claude in English, French or Gujarati", "AI shopping assistant"],
    ["Nearby", "Picks an area or shares location; sees Regina stores on an OpenStreetMap map with distances and the best picks at each store", "Local shopping tool; geo-locator; availability"],
  ]),
  gap(),
  P("Three design choices answer the brief’s “communicate uncertainty and avoid misleading consumers” point directly:"),
  bullet("**Evidence labels.** Every fact is Verified, Claimed or Unknown, and the source is shown."),
  bullet("**Unknown is not bad.** Unknown facts are left out of the score and lower a separate confidence meter. Products with fewer than 40% of facts known get a “Limited data” flag."),
  bullet("**Canadian-content tiers.** “Product of Canada”, “Made in Canada with imported ingredients”, “Canadian-owned” and “Imported” are kept apart instead of one Canadian checkmark."),
  P("The brief also asks for price and access context. The app shows price differences on every alternative, includes affordability as a priority, and lists which nearby stores carry each product."),

  // 3. Tech stack
  H1("3. Tech stack"),
  P("The app is a React single-page app talking to a Python FastAPI backend; the dataset lives in plain JSON files."),
  table([1600, 3200, 4560], [
    ["Layer", "Technology", "Why we chose it"],
    ["Frontend", "React 19 + Vite 8 (JavaScript)", "Component-based UI that is easy to extend; Vite gives instant reloads"],
    ["Maps", "Leaflet 1.9 + React Leaflet 5, OpenStreetMap tiles", "Free, open map data; no API key needed"],
    ["Barcode scanning", "html5-qrcode 2.3", "Reads EAN/UPC barcodes from the camera or an uploaded photo, in the browser"],
    ["Backend", "Python 3.13, FastAPI, Uvicorn", "Simple to read, fast, and auto-generates interactive API docs at /docs"],
    ["HTTP client", "httpx", "Calls the Open Food Facts API from the backend (avoids browser CORS limits)"],
    ["AI assistant", "Anthropic Python SDK, model claude-opus-5-5 at low effort, with refusal fallbacks", "Writes plain-language answers in English, French or Gujarati using only our data. Optional: runs only when an API key is set"],
    ["Data", "JSON files (products, stores, reference tables)", "Anyone on the team can edit them without touching code"],
    ["Real product data", "Open Food Facts API", "Free, open, crowd-sourced database with Canadian products"],
  ]),

  // 4. Architecture
  H1("4. Architecture"),
  P("The browser only talks to our backend; the backend owns the dataset, the scoring rules and every outside API except the map tiles."),
  image("architecture.png", 1344, 738, "Architecture diagram: React frontend calls the FastAPI backend, which reads the JSON dataset and calls Open Food Facts and the Claude API; map tiles load from OpenStreetMap into the browser"),
  caption("Figure 1. System architecture"),
  P("Scoring runs on the backend, so the same rules serve every screen and could serve a future mobile app."),
  table([2400, 1000, 5960], [
    ["Endpoint", "Method", "What it returns"],
    ["/api/meta", "GET", "Factors, Canadian-content tiers, categories, default weights, dataset counts"],
    ["/api/stores", "GET", "All Regina stores with coordinates"],
    ["/api/score", "POST", "Every product (optionally filtered by category or search text) with score, confidence and breakdown for the given weights"],
    ["/api/products/{id}", "POST", "One product’s breakdown, up to 3 better alternatives, and the stores that carry it"],
    ["/api/barcode/{code}", "GET", "A product by barcode: our dataset first, then a live Open Food Facts lookup"],
    ["/api/ask", "POST", "Rule-based ranking for a plain-language question, plus Claude’s answer when an API key is set"],
    ["/api/health", "GET", "Health check"],
  ]),

  // 5. Scoring
  H1("5. Scoring method"),
  P("The personal score is a weighted average of only the facts we know, weighted by how much the shopper cares and how trustworthy each fact is."),
  ...code(["score      = Σ (w × t × s) ÷ Σ (w × t)", "confidence = Σ (w × t) ÷ Σ w"]),
  P("Here **w** is the shopper’s weight for a factor (0 to 5), **s** is the factor’s score (0 to 100), and **t** is the trust given to its evidence."),
  table([3600, 1400, 4360], [
    ["Evidence", "Trust t", "Effect"],
    ["Verified (certifier, government, registry)", "1.0", "Counts fully"],
    ["Claimed (company or community database)", "0.6", "Counts, but less"],
    ["Unknown", "0", "Left out of the score; lowers confidence"],
    ["Not applicable (e.g. animal welfare for pasta)", "—", "Ignored completely"],
  ]),
  gap(),
  bullet("**Confidence labels:** High at 75% or more, Medium at 45% or more, otherwise Low. Below 40% the product is flagged “Limited data”."),
  bullet("**Affordability** is relative within a category: the cheapest product scores 100 and the most expensive scores 0."),
  bullet("**Rankings** (alternatives, Ask TruthShift) multiply the score by (0.5 + 0.5 × confidence), so well-documented products rank above ones we know little about."),
  bullet("**Explanations** are generated from the same numbers: the two strongest factors, the weakest ones, which facts are only claimed, and which are unknown."),
  P("**Worked example.** With the default priorities, Prairie Creamy Peanut Butter (a demo product) scores 76 with Medium confidence: strong on Support Regina and Buy Canadian, two facts only claimed by the company, and fair trade unknown, so it is not counted against it."),

  // 6. Datasets
  H1("6. Datasets"),
  P("The app serves 118 products in 18 categories: 46 synthetic demo products we wrote, and 72 real products sold in Canada, imported from Open Food Facts."),
  table([1700, 2300, 1500, 2360, 1500], [
    ["Dataset", "File", "Size", "Real or synthetic", "Evidence status"],
    ["Demo products", "backend/data/products_synthetic.json", "46 products, 18 categories", "Synthetic: fictional brands, invented certifications, ownership and prices (allowed by the challenge)", "Verified, claimed, unknown or N/A per fact"],
    ["Real products", "backend/data/products_off.json", "72 products, 12 categories (6 each)", "Real, from Open Food Facts (ODbL licence), imported with scripts/import_off.py", "Claimed (crowd-sourced) or unknown; no prices"],
    ["Live barcode lookups", "In memory only", "Any barcode scanned", "Real, from the Open Food Facts product API", "Same as above"],
    ["Regina stores", "backend/data/stores.json", "10 stores", "7 real chains or markets with approximate coordinates; 3 fictional independent grocers", "N/A"],
    ["Reference tables", "backend/data/reference.json", "7 factors, 4 Canadian-content tiers", "Written by us from the CFIA “Product of Canada” / “Made in Canada” labelling rules", "N/A"],
    ["Map", "OpenStreetMap tiles", "Regina", "Real, loaded live", "N/A"],
  ]),
  gap(),
  P("Across the 46 demo products, the 276 facts break down as 139 verified, 42 claimed, 38 unknown and 57 not applicable."),
  image("known_facts_chart.png", 1344, 720, "Bar chart: share of products with a known fact by factor. Demo products: Buy Canadian 89%, fair trade 50%, animal welfare 73%, environment 65%, packaging 100%. Real products: 6%, 0%, 8%, 85%, 3%"),
  caption("Figure 2. Share of products with a known fact, demo vs real data"),
  P("The real data shows why the evidence labels matter: 68 of the 72 real products don’t list where they are made, and none record a fair-trade label. Only the Eco-Score (85% of products) is usually present. A tool that scored missing facts as zero would call almost every real product unethical."),
  P("Background facts in the demo notes (CFIA label tiers, Saskatchewan as a major lentil and wild-rice producer, Canadian supply-managed eggs and milk) were written from general knowledge and should be checked before any public launch."),

  // 7. Run
  H1("7. How to run and customize"),
  P("You need two terminals: one for the backend and one for the frontend. Python 3.10+ and Node.js 20+ are required."),
  H2("Backend (API on http://localhost:8000, docs at /docs)"),
  ...code(["cd truthshift/backend", "pip install -r requirements.txt", "uvicorn app.main:app --port 8000"]),
  H2("Frontend (app on http://localhost:5173)"),
  ...code(["cd truthshift/frontend", "npm install", "npm run dev"]),
  P("To turn on Claude’s written answers, set an Anthropic API key before starting the backend (PowerShell: `$env:ANTHROPIC_API_KEY=\"sk-ant-...\"`). Without a key, Ask TruthShift still works using the rule-based ranking."),
  table([3400, 4160, 1800], [
    ["To change", "Edit", "Code change?"],
    ["Add or fix a product", "backend/data/products_synthetic.json", "No, restart the backend"],
    ["Add a store", "backend/data/stores.json", "No"],
    ["Factor names, Canadian-content tiers", "backend/data/reference.json", "No"],
    ["Refresh real products", "python -m scripts.import_off (in backend/)", "No"],
    ["Trust levels, default weights", "backend/app/scoring.py", "Small"],
    ["Add a language", "frontend/src/i18n.js (copy the en block)", "Small"],
    ["Priority presets", "frontend/src/components/Priorities.jsx", "Small"],
  ]),
  gap(),
  P("To test on a phone, run both servers on the laptop and open the laptop’s network address on port 5173 (Vite prints it). The phone camera needs https, so on a phone use the photo upload or type the barcode."),

  // 8. Limitations
  H1("8. Limitations and future work"),
  P("The biggest limitation is data: most product facts are synthetic, so the scores demonstrate the method rather than judge real brands."),
  bullet("**Synthetic products.** All 46 demo products use fictional brands; certifications, ownership and prices are invented. Real products from Open Food Facts carry only crowd-sourced facts, no prices and no store availability."),
  bullet("**Approximate locations.** Store coordinates are approximate, and three independent grocers are fictional."),
  bullet("**Regina recycling tips** were written from general knowledge and should be checked against the City of Regina’s official waste guide."),
  bullet("**No accounts.** Priorities are saved only in the shopper’s browser."),
  bullet("**AI answers need an API key** and cost a small amount per question."),
  H2("Next steps"),
  numbered("Photograph labels of 20 to 30 real products at Regina stores and replace the synthetic records"),
  numbered("Check certifications against Fairtrade Canada, Certified Humane and organic registries"),
  numbered("Add real prices from store flyers and a weekly price tracker"),
  numbered("Add more languages used by RODS clients (Arabic, Ukrainian, Tigrinya, Dari)"),
  numbered("Deploy with https so the phone camera scanner works everywhere"),
];

const doc = new Document({
  creator: "[Team name]",
  title: "TruthShift — Project Documentation",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: "222222" } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { font: "Cambria", size: 60, bold: true, color: C.dark }, paragraph: { spacing: { after: 120 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 34, bold: true, color: C.dark }, paragraph: { spacing: { before: 360, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 26, bold: true, color: C.accent }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
      new TextRun({ text: "TruthShift · page ", size: 18, color: C.soft }),
      new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.soft })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync(OUT, buf); console.log("Wrote", OUT); });

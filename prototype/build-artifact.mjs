// Bundles the app into ONE html file for publishing as a claude.ai Artifact.
// Run: node build-artifact.mjs   →  dist/truthshift-artifact.html
// Leaflet is left out (map tiles are blocked in Artifacts; the outline map is used instead).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const read = f => readFileSync(new URL(f, import.meta.url), "utf8");
const html = read("index.html");

const title = html.match(/<title>[\s\S]*?<\/title>/)[0];
const fontLinks = (html.match(/<link[^>]+fonts\.googleapis[^>]*>/g) || []).join("\n");
let body = html.match(/<body>([\s\S]*)<\/body>/)[1];

// Drop all <script> tags from the body; re-add them below in a known order.
body = body.replace(/<script[\s\S]*?<\/script>\s*/g, "");

const out = `${title}
${fontLinks}
<style>
${read("styles.css")}
</style>
${body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
<script>
${read("data.js")}
${read("scoring.js")}
${read("app.js")}
</script>
`;

mkdirSync(new URL("dist/", import.meta.url), { recursive: true });
writeFileSync(new URL("dist/truthshift-artifact.html", import.meta.url), out);
console.log("Wrote dist/truthshift-artifact.html", (out.length / 1024).toFixed(1) + " KB");

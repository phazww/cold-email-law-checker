// Copies the checked rules from ../coldcheck/data.js into src/rules.json, so the Actor and the site give the same verdicts.
const fs = require("fs");
const path = require("path");
globalThis.window = globalThis;
require(path.join(__dirname, "..", "..", "coldcheck", "data.js"));
const rules = globalThis.RULES.map((r) => ({
  code: r.code, slug: r.slug, name: r.name, tlds: r.tlds, checked: r.checked || globalThis.CHECKED,
  named: r.named, generic: r.generic, personal: r.personal, bySource: r.bySource || null,
  rule: r.rule, must: r.must, notes: r.notes,
  sources: r.sources.map((s) => ({ label: s.label, url: s.url, type: s.type }))
}));
fs.writeFileSync(path.join(__dirname, "..", "src", "rules.json"), JSON.stringify(rules, null, 1));
console.log(`src/rules.json: ${rules.length} countries`);

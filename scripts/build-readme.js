// Writes README.md with the coverage table generated from src/rules.json.
const fs = require("fs");
const path = require("path");
const RULES = require("../src/rules.json");
const L = { ok: "No consent needed", cond: "Specific cases", consent: "Consent first", unknown: "Not verified" };
const table = ["| Country | Named person (jane@company) | Generic (info@company) | Personal mailbox (gmail) | Checked |", "|---|---|---|---|---|"]
  .concat([...RULES].sort((a, b) => a.name.localeCompare(b.name)).map((r) =>
    `| [${r.name}](https://phazww.github.io/can-i-cold-email/c/${r.slug}.html) | ${L[r.named]} | ${L[r.generic]} | ${L[r.personal]} | ${r.checked} |`))
  .join("\n");
const tpl = fs.readFileSync(path.join(__dirname, "README.template.md"), "utf8");
fs.writeFileSync(path.join(__dirname, "..", "README.md"), tpl.replace("{{TABLE}}", table).replace(/\{\{COUNT\}\}/g, RULES.length));
console.log("README.md written");

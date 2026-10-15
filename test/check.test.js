const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { flatten, detectFields, checkLead, parseCsv } = require("../src/check");

const run = (rows, opts = {}) => {
  const flat = rows.map((r) => flatten(r));
  const fields = detectFields(flat[0], opts);
  return flat.map((f) => checkLead(f, fields, opts));
};

test("example export gives the same verdicts as the site", () => {
  const rows = parseCsv(fs.readFileSync(path.join(__dirname, "sample-export.csv"), "utf8"));
  const out = run(rows);
  const got = Object.fromEntries(out.map((r) => [r.email, r.verdict]));
  assert.deepStrictEqual(got, {
    "anna.schmidt@example.de": "consent",
    "info@example.de": "consent",
    "jan.novak@example.sk": "ok",
    "eva.kral@example.sk": "consent",
    "ana.kovac@example.si": "ok",
    "tom.baker@example.co.uk": "ok",
    "tombakerplumbing@gmail.com": "consent",
    "marie.dupont@example.fr": "ok",
    "bob.martin@example.ca": "consent",
    "lisa.chen@example.com": "ok"
  });
});

test("nested scraper output: person's country wins over company HQ", () => {
  const [r] = run([{ fullName: "A", workEmail: "a.b@acme.com", company: { country: "US" }, location: { country: "Germany" } }]);
  assert.strictEqual(r.country, "DE");
  assert.strictEqual(r.verdict, "consent");
});

test("ISO-3 codes, freemail and unknown countries", () => {
  const out = run([
    { email: "info@firma.at", countryCode: "AUT" },
    { email: "someone@gmail.com", countryCode: "" },
    { email: "x@shop.lt", countryCode: "" },
    { email: "not-an-email", countryCode: "DE" }
  ]);
  assert.strictEqual(out[0].country, "AT");
  assert.strictEqual(out[0].verdict, "consent");
  assert.match(out[1].reason, /Country unknown/);
  assert.match(out[2].reason, /not covered yet/);
  assert.match(out[3].reason, /No valid email/);
});

test("default country is used only when nothing else is known", () => {
  const out = run([{ email: "jane@acme.com" }, { email: "jan@acme.nl" }], { defaultCountry: "UK" });
  assert.strictEqual(out[0].country, "UK");
  assert.strictEqual(out[1].country, "NL");
});

test("consent verdicts carry no must-include list, others do", () => {
  const out = run([{ email: "jane@acme.com", country: "US" }, { email: "jane@acme.de", country: "DE" }]);
  assert.ok(out[0].mustInclude.length > 0);
  assert.deepStrictEqual(out[1].mustInclude, []);
  assert.ok(out[0].lawSource.startsWith("http"));
});

test("field detection works when the first row lacks a key", () => {
  const rows = [{ email: "info@example.de", countryCode: "DE" }, { email: "jan.novak@example.sk", countryCode: "SK", source: "company website" }];
  const flat = rows.map((r) => flatten(r));
  const sample = {};
  for (const f of flat) for (const [k, v] of Object.entries(f)) if (sample[k] == null || sample[k] === "") sample[k] = v;
  const fields = detectFields(sample);
  assert.strictEqual(fields.source, "source");
  assert.strictEqual(checkLead(flat[1], fields).verdict, "ok");
});

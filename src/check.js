// Gives each lead a verdict for the first unsolicited marketing email to it,
// from the recipient's country and the kind of address. Same logic as the
// list checker on https://phazww.github.io/can-i-cold-email/.
const RULES = require("./rules.json");

const byCode = Object.fromEntries(RULES.map((r) => [r.code, r]));

const GENERIC = new Set(("info contact hello hi sales support office admin team mail email kontakt contacto contatto contatti bonjour hola hallo post service " +
  "kundenservice kundservice enquiries inquiries press presse marketing hr jobs careers billing accounts orders order shop booking bookings reception " +
  "secretariat sekretariat help customerservice customercare care general welcome web webmaster postmaster media pr partners partnerships business " +
  "commercial vendas ventas vente verkauf buero biuro kontor legal privacy datenschutz finance invoice invoices rechnung purchasing procurement einkauf " +
  "achat compras news newsletter feedback studio agency hq company direction direktion management ask connect getintouch reservations sav serviceclient " +
  "clientes atencion boutique commande bestellung tienda").split(" "));
const FREEMAIL = new Set(("gmail.com googlemail.com yahoo.com yahoo.co.uk yahoo.fr yahoo.de yahoo.es yahoo.it outlook.com hotmail.com hotmail.co.uk hotmail.fr " +
  "hotmail.de hotmail.it hotmail.es live.com msn.com icloud.com me.com mac.com aol.com gmx.de gmx.net gmx.at gmx.ch web.de t-online.de freenet.de proton.me " +
  "protonmail.com orange.fr free.fr laposte.net sfr.fr wanadoo.fr libero.it virgilio.it tiscali.it alice.it btinternet.com sky.com telia.com bluewin.ch wp.pl " +
  "o2.pl onet.pl interia.pl ziggo.nl kpnmail.nl telenet.be skynet.be eircom.net bigpond.com shaw.ca rogers.com mail.com yandex.com zoho.com fastmail.com " +
  "hey.com tutanota.com tuta.io pm.me").split(" "));
// Two-letter endings that are used as generic domains, not as a country signal.
const GENERIC_CC = new Set("io co ai me tv cc eu gg so to fm ly sh im is vc ws".split(" "));

const tldToCode = {};
RULES.forEach((r) => r.tlds.forEach((t) => (tldToCode[t] = r.code)));
const nameToCode = {};
RULES.forEach((r) => { nameToCode[r.name.toUpperCase()] = r.code; });
Object.assign(nameToCode, {
  "GREAT BRITAIN": "UK", "ENGLAND": "UK", "SCOTLAND": "UK", "WALES": "UK", "USA": "US", "UNITED STATES OF AMERICA": "US",
  "DEUTSCHLAND": "DE", "ESPAÑA": "ES", "ESPANA": "ES", "ITALIA": "IT", "NEDERLAND": "NL", "HOLLAND": "NL", "THE NETHERLANDS": "NL",
  "SVERIGE": "SE", "DANMARK": "DK", "ÖSTERREICH": "AT", "OSTERREICH": "AT", "POLSKA": "PL", "SCHWEIZ": "CH", "SUISSE": "CH",
  "BELGIQUE": "BE", "BELGIË": "BE", "BELGIE": "BE", "IRELAND": "IE", "FRANCE": "FR",
  "CZECHIA": "CZ", "ČESKO": "CZ", "CESKO": "CZ", "NORGE": "NO", "SUOMI": "FI", "EESTI": "EE", "LATVIJA": "LV", "LËTZEBUERG": "LU",
  "LUXEMBURG": "LU", "SLOVENSKO": "SK", "SLOVENIJA": "SI", "HRVATSKA": "HR", "ELLADA": "GR", "HELLAS": "GR", "KYPROS": "CY",
  "BALGARIYA": "BG", "БЪЛГАРИЯ": "BG"
});
const codeAlias = { GB: "UK", GBR: "UK", USA: "US", DEU: "DE", FRA: "FR", ESP: "ES", ITA: "IT", NLD: "NL", BEL: "BE", IRL: "IE", SWE: "SE",
  DNK: "DK", AUT: "AT", POL: "PL", CHE: "CH", CZE: "CZ", NOR: "NO", FIN: "FI", PRT: "PT", EST: "EE", LVA: "LV", MLT: "MT", LUX: "LU",
  SVK: "SK", SVN: "SI", HRV: "HR", GRC: "GR", CYP: "CY", BGR: "BG", LIE: "LI", CAN: "CA", AUS: "AU", SGP: "SG", JPN: "JP" };
RULES.forEach((r) => (codeAlias[r.code] = r.code));

const EMAIL = /^[A-Z0-9._%+'-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const LABEL = { ok: "No consent needed", cond: "Only in specific cases", consent: "Consent first", unknown: "Not verified" };
const WHY = {
  ok: (n) => `No prior consent needed in ${n} for this kind of address. Identify yourself and offer an opt-out.`,
  cond: (n) => `Allowed in ${n} only in specific cases. Read the conditions before sending.`,
  consent: (n) => `Prior consent required in ${n} for this kind of address.`,
  unknown: (n) => `Not verified for this kind of address in ${n}.`
};
const SOURCE_NOTE = { published: "published by the company", vendor: "found by a tool, not published by the company" };

const norm = (k) => k.toLowerCase().replace(/[\s_.-]+/g, "");

// Nested objects from scrapers become dotted keys: { location: { country } } -> "location.country".
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

// Finds which keys hold the email, the person's country and the address source.
function detectFields(sample, given = {}) {
  const keys = Object.keys(sample);
  const pick = (test) => keys.find((k) => test(norm(k), k));
  const email = given.emailField || pick((n, k) => /(^|work|business|personal|contact)e?mail(address)?$/.test(n) && EMAIL.test(String(sample[k] || "").trim()))
    || pick((n, k) => EMAIL.test(String(sample[k] || "").trim()));
  const country = given.countryField
    || pick((n) => /^(country|countrycode|countryname|pays|land|pa[ií]s|paese|kraj)$/.test(n))
    || pick((n) => /(country|countrycode)$/.test(n) && !/^(phone|tel)/.test(n) && !/(company|org|organization|hq)/.test(n))
    || pick((n) => /(country|countrycode)$/.test(n) && !/^(phone|tel)/.test(n));
  const source = given.sourceField || pick((n) => /^(source|addresssource|emailsource|contactsource|origin|published)$/.test(n));
  return { email, country, source };
}

// "published" = the company put this address out itself (website, imprint, register);
// "vendor" = found, enriched, guessed or bought. Anything else leaves the verdict as it is.
function sourceOf(v) {
  v = String(v == null ? "" : v).toLowerCase().trim();
  if (!v) return "";
  if (/^(yes|true|1|published|public|website|site|web|own site|company site|contact page|imprint|impressum|register|directory)$/.test(v) || /publish|website|contact page|imprint|impressum/.test(v)) return "published";
  if (/^(no|false|0)$/.test(v) || /vendor|enrich|apollo|zoominfo|hunter|clearbit|lusha|apify|scrap|guess|pattern|bought|purchas|database|finder|linkedin/.test(v)) return "vendor";
  return "";
}

function countryOf(value) {
  if (value == null || value === "") return null;
  const v = String(value).trim().toUpperCase();
  return codeAlias[v] || nameToCode[v] || null;
}

function addressType(email) {
  const [local, domain] = email.split("@");
  if (FREEMAIL.has(domain)) return "personal";
  return GENERIC.has(local.replace(/[._-]/g, "")) || GENERIC.has(local) ? "generic" : "named";
}

// One lead in, one verdict out. `fields` comes from detectFields.
function checkLead(flat, fields, options = {}) {
  const email = String(flat[fields.email] || "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { email, verdict: "unknown", reason: "No valid email address in this row." };
  const domain = email.split("@")[1];
  const type = addressType(email);

  let code = null, countryFrom = "";
  if (fields.country && flat[fields.country] != null && flat[fields.country] !== "") {
    code = countryOf(flat[fields.country]);
    if (!code) return base(email, type, null, "", `"${flat[fields.country]}" is not covered yet.`);
    countryFrom = `column ${fields.country}`;
  }
  if (!code && type !== "personal") {
    const tld = domain.split(".").pop();
    if (tldToCode[tld]) { code = tldToCode[tld]; countryFrom = `guessed from .${tld}`; }
    else if (tld.length === 2 && !GENERIC_CC.has(tld)) return base(email, type, null, "", `.${tld} looks like a country that is not covered yet.`);
  }
  if (!code && options.defaultCountry) { code = countryOf(options.defaultCountry); countryFrom = code ? "default country" : ""; }
  if (!code) return base(email, type, null, "", "Country unknown. Map a country field or set a default country.");

  const src = fields.source ? sourceOf(flat[fields.source]) : "";
  const r = byCode[code];
  const override = src && r.bySource && r.bySource[src] && r.bySource[src][type];
  const verdict = override || r[type];
  let reason = WHY[verdict](r.name);
  if (override) reason += ` In ${r.name} this depends on whether the company published the address (here: ${SOURCE_NOTE[src]}).`;
  return {
    email,
    country: r.code,
    countryName: r.name,
    countryFrom,
    addressType: type,
    addressSource: src,
    verdict,
    verdictLabel: LABEL[verdict],
    sendWithoutConsent: verdict === "ok",
    reason,
    rule: r.rule,
    mustInclude: verdict === "consent" ? [] : r.must,
    lawSource: r.sources[0].url,
    rulesPage: `https://phazww.github.io/can-i-cold-email/c/${r.slug}.html`,
    checked: r.checked
  };
}

function base(email, type, code, countryFrom, reason) {
  return { email, country: code || "", countryName: "", countryFrom, addressType: type, addressSource: "", verdict: "unknown",
    verdictLabel: LABEL.unknown, sendWithoutConsent: false, reason, rule: "", mustInclude: [], lawSource: "", rulesPage: "", checked: "" };
}

// Minimal CSV reader: quoted fields, commas, semicolons or tabs.
function parseCsv(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = [",", ";", "\t"].map((s) => [s, lines[0].split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const split = (line) => {
    const out = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { out.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const header = split(lines[0]);
  if (header.some((h) => EMAIL.test(h))) return lines.map((l) => ({ email: split(l).find((c) => EMAIL.test(c)) || "" }));
  return lines.slice(1).map((l) => { const c = split(l); return Object.fromEntries(header.map((h, i) => [h, c[i] ?? ""])); });
}

module.exports = { RULES, flatten, detectFields, checkLead, parseCsv, sourceOf, countryOf, addressType };

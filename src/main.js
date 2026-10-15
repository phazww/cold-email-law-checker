const { Actor, log } = require("apify");
const { flatten, detectFields, checkLead, parseCsv, countryOf, RULES } = require("./check");

Actor.main(async () => {
  const input = (await Actor.getInput()) || {};
  const {
    leads = [],
    datasetId,
    csvUrl,
    emailField,
    countryField,
    sourceField,
    defaultCountry,
    keepOriginalFields = true,
    maxLeads = 0
  } = input;

  // Leads can come from three places, in this order of preference.
  let rows = [];
  if (datasetId) {
    const ds = await Actor.openDataset(datasetId, { forceCloud: true });
    await ds.forEach((item) => { rows.push(item); });
    log.info(`Read ${rows.length} items from dataset ${datasetId}.`);
  } else if (csvUrl) {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`Could not download the CSV (${res.status}).`);
    rows = parseCsv(await res.text());
    log.info(`Read ${rows.length} rows from the CSV.`);
  } else {
    rows = leads.map((l) => (typeof l === "string" ? { email: l } : l));
  }
  if (maxLeads > 0) rows = rows.slice(0, maxLeads);
  if (!rows.length) {
    log.warning("No leads in the input. Add leads, a dataset ID or a CSV URL.");
    return;
  }
  if (defaultCountry && !countryOf(defaultCountry)) {
    throw new Error(`Default country "${defaultCountry}" is not covered. Covered: ${RULES.map((r) => r.code).join(", ")}.`);
  }

  const flat = rows.map((r) => flatten(r));
  // Field detection looks at the first rows together, since a key can be missing or empty in any single row.
  const sample = {};
  for (const f of flat.slice(0, 50)) for (const [k, v] of Object.entries(f)) if (sample[k] == null || sample[k] === "") sample[k] = v;
  const fields = detectFields(sample, { emailField, countryField, sourceField });
  if (!fields.email) throw new Error("Could not find an email field. Set emailField in the input.");
  log.info(`Fields used: email = ${fields.email}, country = ${fields.country || "(none, guessed from the domain)"}, source = ${fields.source || "(none)"}.`);

  const counts = { ok: 0, cond: 0, consent: 0, unknown: 0 };
  const out = flat.map((f, i) => {
    const verdict = checkLead(f, fields, { defaultCountry });
    counts[verdict.verdict]++;
    return keepOriginalFields ? { ...rows[i], ...prefix(verdict) } : prefix(verdict);
  });

  // Push in chunks so very large lists do not hold everything in one request.
  for (let i = 0; i < out.length; i += 1000) await Actor.pushData(out.slice(i, i + 1000));

  const summary = {
    leads: out.length,
    noConsentNeeded: counts.ok,
    onlyInSpecificCases: counts.cond,
    consentFirst: counts.consent,
    notVerified: counts.unknown,
    fields,
    rulesChecked: [...new Set(RULES.map((r) => r.checked))].sort().pop(),
    note: "Research summary, not legal advice. Rules cover the first unsolicited marketing email to a business recipient in the recipient's country."
  };
  await Actor.setValue("OUTPUT", summary);
  log.info(`Done: ${counts.ok} no consent needed, ${counts.cond} only in specific cases, ${counts.consent} consent first, ${counts.unknown} not verified.`);
});

// Verdict fields get a prefix so they never overwrite the lead's own columns.
function prefix(v) {
  return Object.fromEntries(Object.entries(v).map(([k, val]) => [k === "email" ? "checkedEmail" : `law_${k}`, val]));
}

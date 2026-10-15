# Cold Email Law Checker

Before you send a cold email campaign to another country, check whether the law there lets you. This Actor gives every lead in your list a verdict for the **first unsolicited marketing email** to it, based on the recipient's country and the kind of address.

{{COUNT}} countries, each checked against the law text or the regulator's guidance, with a link to the source.

## Why

The rules change at every border. Germany, Spain and Italy want consent before the first email, even to a company address. France allows it if the offer relates to the person's job. The US allows it but wants a postal address and an opt-out in every email. Sweden protects people but not companies. Slovakia, Slovenia and Japan care whether the company published the address itself.

Email verifiers tell you whether an address exists. This tells you whether you may write to it.

## What you get for each lead

| Field | Example |
|---|---|
| `law_country` | `DE` |
| `law_addressType` | `named`, `generic` (info@, sales@) or `personal` (gmail) |
| `law_verdict` | `ok`, `cond`, `consent` or `unknown` |
| `law_verdictLabel` | `Consent first` |
| `law_sendWithoutConsent` | `false` |
| `law_reason` | `Prior consent required in Germany for this kind of address.` |
| `law_rule` | The rule in one paragraph |
| `law_mustInclude` | What the email itself must contain (opt-out, postal address...) |
| `law_lawSource` | Link to the law or the regulator |
| `law_rulesPage` | Page with all verdicts and sources for that country |
| `law_checked` | Date the rules were checked |

Your own fields are kept, so you can filter the dataset and send only the rows you may email. The run summary (counts per verdict) is saved as `OUTPUT` in the key-value store.

## Input

Give it leads in one of three ways:

- **Dataset ID** from another Actor run, such as a lead scraper. Nested fields like `location.country` are found automatically.
- **CSV URL** of an export.
- **Leads** as JSON: plain email addresses or objects.

The email, country and source fields are detected automatically. You can set them by name if detection picks the wrong one.

**Use the person's country, not the company HQ.** The rules follow the recipient: a German employee of a US company is a German recipient. If no country is given, it is guessed from the domain (.de, .fr) and the row says so.

**Optional source field.** `published` (the company put the address on its own site or in a register) or `vendor` (a tool found or guessed it; values like `apollo` or `hunter` count as vendor). In Canada, Australia, Japan, the Netherlands, Slovakia and Slovenia this changes the verdict.

## Countries covered

{{TABLE}}

Not covered yet: everything else. Rows for other countries come back as `unknown` with the reason.

## Limits

This is a research summary, not legal advice. It covers the first unsolicited marketing email to a business recipient. Data protection law (GDPR, UK GDPR) applies separately whenever an address identifies a person. Every verdict links to its source so you can check it.

The same rules power the free web checker at [phazww.github.io/can-i-cold-email](https://phazww.github.io/can-i-cold-email/). Corrections are welcome: open an issue on [GitHub](https://github.com/phazww/cold-email-law-checker).

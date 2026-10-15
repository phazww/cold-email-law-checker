# Cold Email Law Checker

Before you send a cold email campaign to another country, check whether the law there lets you. This Actor gives every lead in your list a verdict for the **first unsolicited marketing email** to it, based on the recipient's country and the kind of address.

33 countries, each checked against the law text or the regulator's guidance, with a link to the source.

## Why

The rules change at every border. Germany, Spain and Italy want consent before the first email, even to a company address. France allows it if the offer relates to the person's job. The US allows it but wants a postal address and an opt-out in every email. Sweden protects people but not companies. Slovakia and Slovenia care whether the company published the address itself.

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

| Country | Named person (jane@company) | Generic (info@company) | Personal mailbox (gmail) | Checked |
|---|---|---|---|---|
| [Australia](https://phazww.github.io/can-i-cold-email/c/australia.html) | Specific cases | Specific cases | Specific cases | 2026-10-10 |
| [Austria](https://phazww.github.io/can-i-cold-email/c/austria.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Belgium](https://phazww.github.io/can-i-cold-email/c/belgium.html) | Consent first | No consent needed | Consent first | 2026-10-10 |
| [Bulgaria](https://phazww.github.io/can-i-cold-email/c/bulgaria.html) | Specific cases | Specific cases | Specific cases | 2026-10-14 |
| [Canada](https://phazww.github.io/can-i-cold-email/c/canada.html) | Specific cases | Specific cases | Consent first | 2026-10-10 |
| [Croatia](https://phazww.github.io/can-i-cold-email/c/croatia.html) | Not verified | No consent needed | Consent first | 2026-10-14 |
| [Cyprus](https://phazww.github.io/can-i-cold-email/c/cyprus.html) | Not verified | Not verified | Consent first | 2026-10-14 |
| [Czech Republic](https://phazww.github.io/can-i-cold-email/c/czech-republic.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Denmark](https://phazww.github.io/can-i-cold-email/c/denmark.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Estonia](https://phazww.github.io/can-i-cold-email/c/estonia.html) | Not verified | No consent needed | Consent first | 2026-10-14 |
| [Finland](https://phazww.github.io/can-i-cold-email/c/finland.html) | Not verified | No consent needed | Consent first | 2026-10-10 |
| [France](https://phazww.github.io/can-i-cold-email/c/france.html) | No consent needed | No consent needed | Not verified | 2026-10-10 |
| [Germany](https://phazww.github.io/can-i-cold-email/c/germany.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Greece](https://phazww.github.io/can-i-cold-email/c/greece.html) | Consent first | Consent first | Consent first | 2026-10-14 |
| [Ireland](https://phazww.github.io/can-i-cold-email/c/ireland.html) | Specific cases | No consent needed | Consent first | 2026-10-10 |
| [Italy](https://phazww.github.io/can-i-cold-email/c/italy.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Japan](https://phazww.github.io/can-i-cold-email/c/japan.html) | Specific cases | Specific cases | Specific cases | 2026-10-15 |
| [Latvia](https://phazww.github.io/can-i-cold-email/c/latvia.html) | Not verified | No consent needed | Consent first | 2026-10-14 |
| [Liechtenstein](https://phazww.github.io/can-i-cold-email/c/liechtenstein.html) | Consent first | Consent first | Consent first | 2026-10-14 |
| [Luxembourg](https://phazww.github.io/can-i-cold-email/c/luxembourg.html) | Not verified | No consent needed | Consent first | 2026-10-14 |
| [Malta](https://phazww.github.io/can-i-cold-email/c/malta.html) | Consent first | Consent first | Consent first | 2026-10-14 |
| [Netherlands](https://phazww.github.io/can-i-cold-email/c/netherlands.html) | Specific cases | Specific cases | Consent first | 2026-10-10 |
| [Norway](https://phazww.github.io/can-i-cold-email/c/norway.html) | Consent first | No consent needed | Consent first | 2026-10-10 |
| [Poland](https://phazww.github.io/can-i-cold-email/c/poland.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Portugal](https://phazww.github.io/can-i-cold-email/c/portugal.html) | Not verified | No consent needed | Consent first | 2026-10-11 |
| [Singapore](https://phazww.github.io/can-i-cold-email/c/singapore.html) | No consent needed | No consent needed | No consent needed | 2026-10-15 |
| [Slovakia](https://phazww.github.io/can-i-cold-email/c/slovakia.html) | Specific cases | Specific cases | Specific cases | 2026-10-14 |
| [Slovenia](https://phazww.github.io/can-i-cold-email/c/slovenia.html) | Specific cases | No consent needed | Consent first | 2026-10-14 |
| [Spain](https://phazww.github.io/can-i-cold-email/c/spain.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [Sweden](https://phazww.github.io/can-i-cold-email/c/sweden.html) | No consent needed | No consent needed | Consent first | 2026-10-10 |
| [Switzerland](https://phazww.github.io/can-i-cold-email/c/switzerland.html) | Consent first | Consent first | Consent first | 2026-10-10 |
| [United Kingdom](https://phazww.github.io/can-i-cold-email/c/united-kingdom.html) | No consent needed | No consent needed | Consent first | 2026-10-10 |
| [United States](https://phazww.github.io/can-i-cold-email/c/united-states.html) | No consent needed | No consent needed | No consent needed | 2026-10-10 |

Not covered yet: everything else. Rows for other countries come back as `unknown` with the reason.

## Limits

This is a research summary, not legal advice. It covers the first unsolicited marketing email to a business recipient. Data protection law (GDPR, UK GDPR) applies separately whenever an address identifies a person. Every verdict links to its source so you can check it.

The same rules power the free web checker at [phazww.github.io/can-i-cold-email](https://phazww.github.io/can-i-cold-email/). Corrections are welcome: open an issue on [GitHub](https://github.com/phazww/cold-email-law-checker).

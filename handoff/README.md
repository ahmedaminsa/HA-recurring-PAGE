# The Barakah Circle — monthly & annual giving page

Handoff package for the Human Appeal USA web team.

A single page that sets up a recurring donation in four questions and hands the
donor to the existing basket. Built on the classes and IDs the site already
ships, so it inherits the live theme and needs no back-end work.

**Open `preview.html` first** — it is this page rendered inside the real site
header, footer and `theme.css`, offline, in one file. What you see there is
what Umbraco will render.

---

## 1. What to deploy

| File | Destination |
|---|---|
| `recurring-giving-block.css` | `/css/recurring-giving-block.css` |
| `recurring-giving-block.js` | `/js/recurring-giving-block.js` |
| `page-body.html` | page content in Umbraco (see §3) |

No external dependencies. Vanilla JS, no jQuery. ~12 KB CSS, ~12 KB JS.

`preview.html` is for review only — do not deploy it.

---

## 2. ⚠️ Required before publish: seven product IDs

`page-body.html` contains **seven `REPLACE_ME` placeholders** — one
`data-item-id` on each of the six cause options, plus the hidden
`donationItemId` field. Each needs the CRM's `donationItemId` for the
corresponding recurring product.

```
grep -c REPLACE_ME page-body.html    # must be 0 before publishing
```

The recurring products may need to be created first: the monthly and annual
variants likely carry different `donationItemId`s from the weekly Jummah Club
products.

Everything else is already filled in with values read off the live site:

| Field | Value | Meaning |
|---|---|---|
| `regularCurrencyId` | `1332` | USD |
| `paymentScheduleId` | `1316` | **Monthly** — used here |
| `paymentScheduleId` | `1346` | **Annual** — used here |
| `paymentScheduleId` | `1325` / `1996` | single / weekly — for reference |
| `stipulationId` | `1329` / `1337` / `1314` | Sadaqah / Zakat / General |
| `locationId` | `3397` / `1434` | Gaza / where most needed |

---

## 3. Adding the content

**Fastest:** if you have a block or macro that accepts raw HTML, paste
`page-body.html` into one block at the top of the page. Done.

**Cleaner:** each section in the file is marked with a numbered comment and
maps to a block the site already has:

| # | Section | Existing block |
|---|---|---|
| 1 | Hero | Hero carousel / full width slider, one slide |
| 2 | ★ The four questions | **new block** — the only new one |
| 3 | Why recurring + 3 columns | Text one column + text three columns |
| 4 | Pull quote | Pull quote block |
| 5 | FAQ | Accordion / rich text |
| 6 | Trust badges | Rich text / image row |
| 7 | Closing CTA | Text one column, purple background |

Suggested page setup: same document type as `The Jummah Club`, URL segment
`the-barakah-circle`.

---

## 4. How the block works

One form. The four questions are `<fieldset>`s inside it; the JS shows one at a
time and writes the donor's answers into the hidden fields:

| Question | Writes |
|---|---|
| Monthly or annual | `paymentScheduleId` — 1316 / 1346 |
| Which cause | `donationItemId` + `locationId` |
| Zakat / Sadaqah / General | `stipulationId` |
| How much | `regularAmountText` |

The form keeps the site's `__add-to-givers-club-cart` class and the standard
field names, so the existing basket handler picks it up like any other donation
form.

**One thing to confirm:** the form's `action` is currently `""`, matching how
The Jummah Club forms post. If your recurring endpoint differs, that one
attribute is the only change needed.

### Editing without touching the JS

- **Add a cause** — copy one `<label class="rg-option">` and set `data-label`,
  `data-item-id`, `data-location-id`, `data-amounts`, `data-min`.
- **Pin a cause to one stipulation** — add
  `data-stipulation-fixed="1337" data-stipulation-label="Zakat"`. Question three
  then skips itself for that cause (the Zakat Fund and Clean Water already do).
- **Change suggested amounts** — edit `data-amounts="25,50,100"`. Annual values
  are derived by multiplying by 12.

### Without JavaScript

All four questions render stacked and the page stays readable; a `<noscript>`
note points the donor at `/donate/`.

---

## 5. Two things worth knowing

**The block deliberately does not use the `form form--donate` classes.**
`theme.css` styles `.form label, .form legend` at `0.875rem` with specificity
`0,1,1`, which overrides the block's question headings and flattens them to
14px. The block's own rules are scoped under `.rg-quiz` to keep this from
happening if it is ever nested inside a `.form` wrapper.

**The block declares `box-sizing: border-box` within its own subtree**, because
the theme does not set one globally.

---

## 6. Content still needing sign-off

- Suggested amounts are proposals, except orphan sponsorship at **$60/month and
  $720/year**, which is taken from the current sponsorship page. Adjust freely
  via `data-amounts`.
- Minimum of $5/month is a proposal.
- Zakat eligibility per fund needs a scholarly review.
- The orphan card uses a Gaza photo as a placeholder; a general sponsorship
  image would be better.
- There are deliberately **no dollar-for-impact claims** ("$50 feeds a family
  for a month"). Add them only with figures your programs team can source.

---

## 7. Post-launch checklist

- [ ] Link from `/donate/` and from The Jummah Club page
- [ ] Add to main navigation under Ways to Give
- [ ] Redirect `/monthly-giving` → `/the-barakah-circle`
- [ ] Test a real $1 monthly gift, then cancel it; repeat for annual
- [ ] Confirm choosing the Zakat Fund skips question three
- [ ] Check on mobile

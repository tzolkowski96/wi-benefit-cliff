# Wisconsin Benefit Cliff Calculator

A free tool that shows Wisconsin families exactly how a raise or income change affects their total public benefits. Models seven programs simultaneously, calculates gradual FoodShare reductions (not just binary cutoffs), and identifies "safe raise zones" where income can increase without triggering benefit losses.

**[Try it →](https://YOUR_USERNAME.github.io/wi-benefit-cliff/)**

## The Problem

Wisconsin runs at least seven major benefit programs for low-income families. Each has a different income threshold. A $2/hour raise can push a family over one or more of those thresholds, erasing benefits worth more than the raise. Social workers know this as the "benefit cliff." Most families don't see it until they've already accepted the raise and start losing benefits the following month.

The data exists in scattered government PDFs, DHS memos, and UW Extension info sheets. No tool models them all together, calculates the actual net dollar impact, and tells you the maximum safe raise you can take.

This one does.

## What It Does

Enter your household size, number of children, hourly wage (or monthly income), and a potential raise. The calculator:

- Runs your income against all seven program thresholds simultaneously
- Calculates FoodShare benefits using the actual USDA formula (not a binary eligible/ineligible guess)
- Shows school meal impacts per child, including the free→reduced tier shift
- Shows eligibility status for programs where dollar values vary too much to estimate (BadgerCare, Wisconsin Shares)
- Reports the **net financial impact** counting only defensible, sourced dollar values
- Tells you the **maximum safe raise** you can take without losing anything
- Generates a printable one-page summary for case files
- Encodes your scenario in the URL so caseworkers can share links directly

## Programs Modeled (FFY 2025)

| Program | Threshold | Cliff Type | Family of 4 Limit |
|---------|-----------|------------|-------------------|
| FoodShare (SNAP) | 200% FPL | Gradual phase-out | $5,200/mo |
| BadgerCare Plus (Adults) | 100% FPL | Hard cutoff | $2,600/mo |
| BadgerCare Plus (Children) | 306% FPL | Hard cutoff | $7,956/mo |
| Wisconsin Shares (Child Care) | 85% SMI (exit) | Hard cutoff | $8,340/mo |
| WHEAP (Energy Assistance) | 60% SMI | Hard cutoff | $5,887/mo |
| Free School Meals | 130% FPL | Tier shift → reduced | $3,380/mo |
| Reduced School Meals | 185% FPL | Hard cutoff | $4,810/mo |

**Sources:** UW-Madison Division of Extension (2025 thresholds); Wisconsin DHS Operations Memo 2024-18 (FoodShare allotments and deductions); USDA Food and Nutrition Service, FR 07/24/2025 (school meal reimbursement rates SY 2025-26); Wisconsin DCF (Wisconsin Shares entry/exit thresholds).

## Why This Is Different

Most benefit calculators check one program at a time and give binary answers. This tool:

**Models interactions.** Programs don't exist in isolation. A raise that's safe for FoodShare might kill your BadgerCare eligibility. You need to see all the cliffs at once.

**Distinguishes cliff types.** FoodShare benefits shrink gradually — you lose roughly $24 for every $100 raise, not the whole amount. BadgerCare is a hard wall. School meals shift from free to reduced before disappearing entirely. These differences matter for the advice.

**Only shows numbers it can defend.** FoodShare uses the published USDA formula. School meals use published USDA reimbursement rates scaled by your number of children. Programs where the dollar value depends on usage, county, or plan choice (BadgerCare, Wisconsin Shares) show eligibility status instead of a made-up number.

**Shareable.** Every scenario encodes to a URL. A caseworker configures a client's situation, copies the link, texts it. The client opens it on their phone and sees their exact picture. No app download, no account, no sign-up.

## Tech Stack

React + TypeScript + Vite + Tailwind CSS. Progressive Web App on GitHub Pages.

- Zero cost to host
- Zero cost to use
- No backend, no database, no tracking, no cookies, no ads
- Works offline once loaded
- Installable on phone home screens

## Development

```bash
git clone https://github.com/YOUR_USERNAME/wi-benefit-cliff.git
cd wi-benefit-cliff
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Deploys to GitHub Pages via the `gh-pages` branch.

## Updating Thresholds

Income thresholds change annually. FPL updates in January/February; SMI updates vary.

All threshold data lives in three files:
- `src/data/fpl.ts` — Federal Poverty Level tables
- `src/data/smi.ts` — Wisconsin State Median Income tables
- `src/data/programs.ts` — Program definitions referencing the above

To update for a new year: edit the numbers in these files, run the test scenarios in `CLAUDE.md`, and deploy.

## Contributing

This project is useful only if the data is accurate. Contributions that improve data accuracy are the highest priority:

1. **Threshold corrections** — if you find a number that doesn't match a published DHS or DCF source, open an issue with the source link.
2. **Additional deductions** — the FoodShare formula currently excludes excess shelter and dependent care deductions. Adding optional inputs for these would improve accuracy.
3. **Spanish translation** — the i18n scaffolding is in place (`src/i18n/es.ts`). Strings need translation by a native speaker, not machine translation.
4. **Hmong translation** — third language priority for Dane County demographics.
5. **Accessibility audit** — screen reader testing, keyboard navigation testing, color contrast verification.

## Who This Is For

- **Families** receiving Wisconsin public benefits who are considering a raise, promotion, or job change
- **Social workers and benefit navigators** at the Tenant Resource Center, Covering Wisconsin, county financial education offices, and community action agencies
- **Employers** trying to understand why employees are reluctant to accept raises
- **Policymakers** who want to see how cliff effects interact across programs
- **Educators** teaching financial literacy in the UW Extension network

## Disclaimer

This tool provides estimates based on published 2025 income eligibility thresholds. FoodShare benefit estimates use a simplified formula that excludes shelter and dependent care deductions. School meal estimates use USDA federal reimbursement rates as an upper-bound proxy — these reflect the cost of providing meals, not your family's direct out-of-pocket savings, which may be lower. Programs marked as "eligibility only" (BadgerCare, Wisconsin Shares) do not include dollar estimates because actual value varies too much by individual circumstances.

**This tool does not replace official eligibility determinations.** Apply through [ACCESS Wisconsin](https://access.wisconsin.gov) for official benefit decisions. Contact your county financial educator ([find yours](https://counties.extension.wisc.edu/)) or call 211 (877-847-2211) for personalized guidance.

## License

MIT

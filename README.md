# Smart Cashier — marketing website (v2)

Static site for **Smart Cashier**, self-hosted payment orchestration for iGaming.
Deployed on GitHub Pages at `https://artrudolf.github.io/smart-router/`.

## Positioning (v2)

The site sells two connected offers:

1. **Controlled pilot** — validation of the routing model on the operator's own payment data (data assessment → historical replay → shadow routing → controlled traffic).
2. **Perpetual non-exclusive source-code license** — self-hosted deployment on the operator's infrastructure.

Cloud ($0 monthly + 0.5% of successful routed deposits) remains a secondary option on the pricing page.

## Structure

| Path | Purpose |
|---|---|
| `/` | Homepage (hero, pilot, operator view, calculator, source code, team, FAQ) |
| `/pilot/` | Pilot process in detail |
| `/source-code/` | Source-code license and delivery scope |
| `/pricing/` | Pilot + license (primary), Cloud (secondary), comparison, calculator |
| `/faq/` | Full FAQ |
| `/demo/` | Standalone player-side demo (opens in the same tab, no email gate) |
| 5 SEO pages | casinos, sportsbooks, cascading, self-hosted, orchestration explained |
| `/privacy/`, `/terms/`, `/cookies/` | Legal (company details live only here) |

## Forms

All three forms send via FormSubmit AJAX to the **activated hashed endpoint**
`https://formsubmit.co/ajax/9e1ca1f15a7783c7356372d979551f91` (no raw email in the code).

| Form | Subject |
|---|---|
| Pilot | `Smart Cashier Pilot Request` |
| Source-code licensing | `Smart Cashier Source-Code Licensing Request` |
| Operator walkthrough | `Smart Cashier Operator Walkthrough Request` |

Each submission includes timestamp, page, URL, UTM parameters, locale, timezone, referrer, and consent status.

## Central configuration

- `assets/js/main.js` → `SC_CONFIG`: `DEMO_URL`, `FORM_ENDPOINT`, `CALENDAR_URL`, `ANALYTICS_PROVIDER`.
  - Set `CALENDAR_URL` to a booking link to show "Book a technical discovery call" after form success. Empty = hidden.
- Generator constants (in the build scripts): `BASE`, `DEMO_PATH`, CTA labels, company name.

## Analytics

`window.scTrack(event, props)` is a no-op event layer (`window.scEvents` buffer). Wire a provider inside `scTrack()`; update the Cookie Policy and consent flow first.

## Deploy

Upload the contents of this folder to the repository root (drag-and-drop **folders** into GitHub "Upload files"). Keep `.nojekyll`.

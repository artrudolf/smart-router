# Smart Cashier Marketing Website

Static marketing website for Smart Cashier, a payment orchestration product for iGaming operators.
Built as plain HTML, CSS, and JavaScript. No build step, no backend, no database, no secrets.

Provider: ALGORITMO REGENTE - LDA. Form destination: prodmic@gmail.com.

## Structure

```
index.html                              Homepage
pricing/                                Pricing page (full Cloud vs Self-Hosted comparison)
payment-routing-online-casinos/         SEO landing page
payment-orchestration-sportsbooks/      SEO landing page
igaming-psp-cascading/                  SEO landing page
self-hosted-payment-routing/            SEO landing page
payment-orchestration-igaming/          SEO landing page
privacy/  terms/  cookies/              Legal pages
demo/                                   Interactive product demo (opened after the email gate)
404.html                                Custom not-found page
assets/css/main.css                     Design system and all styles
assets/js/main.js                       Menu, modals, forms, calculator, routing animation
assets/img/                             Logo, favicon, Open Graph image
sitemap.xml  robots.txt  .nojekyll
```

## 1. Run locally

Any static server works. From the repository root:

```
python3 -m http.server 8000
```

Open http://localhost:8000. Note: on a local server the site lives at `/` while on GitHub Pages
it lives at `/smart-router/`, so the absolute links inside 404.html point to the deployed path.

## 2. Build

There is no build step. The files in this repository are the final output.
(The site was generated from templates once; you edit the HTML files directly.)

## 3. Publish to GitHub Pages

1. Replace the entire contents of the `smart-router` repository with the contents of this folder
   (keep `.nojekyll` at the root).
2. Commit and push to the branch GitHub Pages is configured to serve (usually `main`).
3. In the repository, open Settings > Pages and confirm the source branch and root folder.
4. The site becomes available at https://artrudolf.github.io/smart-router/ within a minute or two.

## 4. Add a custom domain later

1. In Settings > Pages, add the custom domain. GitHub creates a CNAME file.
2. Point the domain's DNS (CNAME to artrudolf.github.io, or A/AAAA records per GitHub docs).
3. Then replace the base URL as described below.

## 5. Replace the temporary canonical domain

The base URL https://artrudolf.github.io/smart-router appears in canonical tags, Open Graph tags,
JSON-LD, sitemap.xml, and robots.txt. To switch to a custom domain, run from the repository root:

```
grep -rl "https://artrudolf.github.io/smart-router" --include="*.html" --include="*.xml" --include="*.txt" . \
  | xargs sed -i 's|https://artrudolf.github.io/smart-router|https://your-domain.example|g'
```

Also update the two absolute `/smart-router/` links inside 404.html to `/`.

## 6. Activate FormSubmit

Forms are delivered by FormSubmit AJAX to prodmic@gmail.com.
The FIRST submission triggers a one-time activation email from formsubmit.co to that inbox.
Open it and click the confirmation link. Until this is done, submissions are not delivered.

## 7. Test each form

1. Get started (header, hero, pricing): fill Work email, Company, Role, tick consent, send.
   Expect the success message about the Cloud request.
2. Get a quote: same fields; expect the Self-Hosted success message.
3. View the demo: only Work email plus consent; on success the demo opens in a new tab
   (https://artrudolf.github.io/smart-router/demo/). If the browser blocks the tab,
   a fallback link is shown in the success message.
4. Negative tests: submit empty (inline errors), untick consent (consent error),
   disconnect network (error message, demo tab closes).

## 8. Verify email subjects

- Cloud form: "Smart Cashier Cloud Application"
- Self-Hosted form: "Smart Cashier Self-Hosted Quote Request"
- Demo form: "demo"

Each email also contains a hidden "Plan summary" field describing the selected model,
plus timestamp, source page, page URL, UTM parameters, locale, timezone, and referrer.

## 9. Update the demo URL

The demo URL is set once in `assets/js/main.js` (constant `DEMO_URL`).

## 10. Add analytics later, with consent

The site currently sets no cookies (only a localStorage flag `sc-cookie-notice`).
Before adding Google Analytics or any advertising or tracking technology:
1. Add a real consent-management platform (accept and reject controls).
2. Load analytics only after consent.
3. Update the Cookie Policy and the cookie notice text.

## 11. Which claims are illustrative

All financial scenarios (including the calculator and every "Illustrative scenario" block)
and all demo metrics (96.2%, 1,247 deposits, 12 providers, 1.8s, method approval percentages)
are demonstration data, not customer results. No uplift is guaranteed. Keep these labels intact.

## 12. Legal review

The Privacy Policy, Terms of Use, and Cookie Policy are working drafts and must be reviewed
by Portuguese counsel before commercial launch (GDPR specifics, governing-law wording,
data-retention periods, and the use of a gmail.com mailbox for data-subject requests).

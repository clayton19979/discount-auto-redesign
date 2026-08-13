# Discount Auto LLC — website redesign

A static, no-build-step redesign of the Discount Auto LLC (used car dealership)
site, built from the Claude Design mockup. Plain HTML/CSS/JS — open any page
directly in a browser, or serve the folder with any static file server.

## Pages

- `index.html` — home
- `inventory.html` — full lot with body-type + price filters and sorting
- `vehicle.html?id=<id>` — vehicle detail with a live payment calculator
- `financing.html` — pre-qualify form and trade-in CTA

## Local preview

No build step. Either open `index.html` directly, or run a quick local server
so relative links behave the same as they will on Vercel:

```bash
npx serve .
```

## Editing inventory

All vehicle data lives in one place: [`data.js`](data.js). Each entry there
drives its card everywhere it appears (home, inventory grid, vehicle detail,
"similar on the lot"). The current list is the same sample data from the
design mockup — replace it with a real feed, or hand-edit the array, once
live inventory is ready.

Photos are placeholder boxes (`.photo-slot`) until real vehicle/lot photos are
dropped in — search each HTML file for `data-label` to find every slot and
its caption.

## Colour and contrast

The palette is defined once, as CSS custom properties at the top of
[`styles.css`](styles.css) — change it there and the whole site follows.

Every piece of text on the site meets **WCAG AA** contrast (4.5:1 for normal
text, 3:1 for large). Two rules keep it that way:

- Yellow surfaces always take navy text, never white.
- `--muted-2` is for placeholder text and is already at the AA floor; don't
  lighten it.

After changing any colour, re-check with the bundled auditor. Serve the site,
open a page, and paste this in the browser console — it walks every text
element, resolves its real background, and lists anything under threshold:

```js
fetch('/tools/contrast-audit.js').then(r => r.text()).then(eval)
```

It reports `{"failures": 0}` when the page is clean. Note it reads text nodes
only, so input **placeholder** colours need checking by hand.

## Known gaps before this goes live

- The financing pre-qualify form (`financing.js`) only toggles a client-side
  success state — it doesn't send the lead anywhere yet. Wire it to a real
  endpoint or form service before launch.
- "Visit Discount Auto Repair" on the home page service section links to
  <https://discount-auto-repair-website.vercel.app/>, the shop's existing
  redesign — update if that site moves to a permanent domain.
- Vehicle photos, lot photos, and the Google Maps link are placeholders.

## Deploying to Vercel

This is a static site with zero build config — Vercel's "Other" framework
preset (no build command, output directory `.`) serves it as-is. Push to
GitHub and import the repo in Vercel, or run `vercel` from this directory.

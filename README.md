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

## Inventory

[`data.js`](data.js) holds the full lot — 126 vehicles, pulled from the live
listings on <https://cars-nwi.com>. Each entry drives its card everywhere it
appears (home, inventory grid, vehicle detail, "similar on the lot").

**Photos are referenced, not committed.** `data.js` stores only the filenames;
`PHOTO_BASE + vehicle id + filename` builds the URL, and the images are served
from the dealership's existing DealerCarSearch CDN. That keeps the repo small
and the photos current as stock turns over. If a photo ever fails to load the
card falls back to a striped placeholder rather than a broken-image icon.

### Refreshing after the lot changes

```bash
python tools/refresh-inventory.py
```

That re-scrapes the listings and galleries and rewrites `data.js` (takes a
couple of minutes — it fetches one detail page per vehicle). Two things it
does *not* update, so check them by hand if the lot changes a lot:

- the price slider's `min`/`max` in [`inventory.html`](inventory.html) — the
  script prints the new price range so you can compare
- the body-type lists at the top of the script, which map model names to
  Car / Truck / SUV / Van. A model it hasn't seen falls back to "Car".

The "shop by type" tiles on the home page also pull from the inventory: each
shows the newest vehicle of that body type, with a live count, so they update
themselves when `data.js` is regenerated. To pin a specific car to a tile,
replace the `.media` fill for that card in the script at the foot of
[`index.html`](index.html).

The hero, service and map photos are still placeholders — search the HTML for
`data-label` to find them.

## Carfax

Each vehicle page links to Carfax through the dealership's existing
DealerCarSearch partner lookup:

```
https://www.carfax.com/cfm/check_order.cfm?partner=DCS_2&vin=<VIN>
```

That's the same link the current cars-nwi.com site uses. The VIN comes from
`data.js`; a vehicle with no VIN drops the button instead of opening an empty
search.

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
- Vehicle photos load from the DealerCarSearch CDN. If the dealership ever
  leaves that platform the URLs go dead — self-host the images at that point.
- The home page lot/service photos and the Google Maps link are placeholders.
- `data.js` is a snapshot, not a live feed. Re-run the refresh script to
  update it; sold cars stay listed until you do.

## Deploying to Vercel

This is a static site with zero build config — Vercel's "Other" framework
preset (no build command, output directory `.`) serves it as-is. Push to
GitHub and import the repo in Vercel, or run `vercel` from this directory.

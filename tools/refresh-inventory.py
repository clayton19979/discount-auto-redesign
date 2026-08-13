#!/usr/bin/env python3
"""Regenerate data.js from the live inventory on cars-nwi.com.

The dealership's DealerCarSearch site is the system of record for stock. This
pulls the current listings and their photo galleries and rewrites ../data.js.

    python tools/refresh-inventory.py

Photo URLs are referenced, not downloaded — the images keep coming from the
dealership's existing CDN, so they stay current as stock turns over.
"""
import json, re, html, time, urllib.request, pathlib, sys

DEALER_ID = "22725"
BASE = "https://cars-nwi.com"
PHOTO_BASE = f"https://imagescdn.dealercarsearch.com/Media/{DEALER_ID}/"
MAX_PHOTOS = 10
UA = {"User-Agent": "Mozilla/5.0 (compatible; discount-auto-redesign refresh)"}

ROOT = pathlib.Path(__file__).resolve().parent.parent

TRUCK = {"C/K 1500","Colorado","Silverado 1500","Ram 1500","1500","F-150","Ranger",
         "Super Duty F-250 SRW","Canyon","Sierra 1500","Tacoma","Tundra","Tundra 4WD Truck"}
SUV   = {"Escalade ESV","Suburban","Tahoe","TrailBlazer","Escape","Explorer","Flex","Acadia",
         "Yukon","Yukon XL","H3","CR-V","Pilot","Tucson","Grand Cherokee","Sorento","Navigator",
         "GL","GL-Class","M-Class","Pathfinder","RAV4","Highlander","Forester (Natl)"}
VAN   = {"Grand Caravan","Transit Connect"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def field(pat, blob, default=None):
    m = re.search(pat, blob, re.S | re.I)
    if not m:
        return default
    txt = html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).replace("\xa0", " ")
    return re.sub(r"\s+", " ", txt).strip()


def body_type(model):
    if model in TRUCK: return "Truck"
    if model in SUV:   return "SUV"
    if model in VAN:   return "Van"
    return "Car"


def badge(drive, miles):
    if drive == "4WD": return "4x4"
    if drive == "AWD": return "AWD"
    if miles and miles < 100_000: return "Low miles"
    return ""


def scrape_listings():
    vehicles, seen, page = [], set(), 1
    while True:
        print(f"  listing page {page}...", flush=True)
        src = get(f"{BASE}/inventory?clearall=1&pagesize=100&page={page}")
        blocks = [b for b in re.split(r'(?=<div class="i10r_image)', src)
                  if "i10r_vehicleTitle" in b]
        if not blocks:
            break
        for b in blocks:
            vid = field(r"/vdp/(\d+)/", b)
            if not vid or vid in seen:
                continue
            seen.add(vid)
            title = field(r'<h4 class="i10r_vehicleTitle[^>]*>(.*?)</h4>', b) or ""
            trim = field(r'<span class="vehicleTrim">(.*?)</span>', b) or ""
            head = title[: len(title) - len(trim)].strip() if trim and title.endswith(trim) else title
            m = re.match(r"(\d{4})\s+(\S+)\s*(.*)", head)
            price_s = field(r"<span class='price-2'>(.*?)</span>", b)
            miles_s = field(r'i10r_optMileage">.*?</label>(.*?)</p>', b)
            miles = int(miles_s.replace(",", "")) if miles_s and miles_s.replace(",", "").isdigit() else None
            colour = field(r'i10r_optColor">.*?</label>(.*?)</p>', b) or ""
            vehicles.append({
                "id": vid,
                "year": int(m.group(1)) if m else None,
                "make": m.group(2) if m else "",
                "model": m.group(3).strip() if m else "",
                "trim": trim,
                "price": int(float(price_s.replace("$", "").replace(",", ""))) if price_s else None,
                "miles": miles,
                "drive": field(r'i10r_optDrive">.*?</label>(.*?)</p>', b) or "",
                "trans": field(r'i10r_optTrans">.*?</label>(.*?)</p>', b) or "",
                "engine": field(r'i10r_optEngine">.*?</label>(.*?)</p>', b) or "",
                "color": colour.title() if colour.isupper() else colour,
                "interior": field(r'i10r_optInterior">.*?</label>(.*?)</p>', b) or "",
                "stock": field(r'i10r_optStock">.*?</label>(.*?)</p>', b) or "",
                "vin": field(r'i10r_optVin">.*?</label>(.*?)</p>', b) or "",
                "vdp": field(r'href="(/vdp/[^"]+)"', b),
            })
        page += 1
        if page > 20:            # guard against a pager that never runs out
            break
    return vehicles


def scrape_gallery(v):
    src = get(BASE + v["vdp"])
    urls = re.findall(
        r"https://imagescdn\.dealercarsearch\.com/Media/\d+/%s/[^\s\"'<>]+?\.jpg" % v["id"], src)
    seen, ordered = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u.rsplit("/", 1)[-1])
    return ordered[:MAX_PHOTOS]


def main():
    print("Fetching inventory listings...")
    raw = scrape_listings()
    print(f"  {len(raw)} vehicles")

    print("Fetching photo galleries...")
    for i, v in enumerate(raw, 1):
        try:
            v["photos"] = scrape_gallery(v)
        except Exception as e:
            print(f"  !! {v['id']}: {e}")
            v["photos"] = []
        if i % 25 == 0:
            print(f"  {i}/{len(raw)}", flush=True)
        time.sleep(0.25)

    out = [{
        "id": v["id"], "year": v["year"], "make": v["make"], "model": v["model"],
        "trim": v["trim"], "price": v["price"], "miles": v["miles"],
        "type": body_type(v["model"]), "drive": v["drive"], "trans": v["trans"],
        "engine": v["engine"], "color": v["color"], "interior": v["interior"],
        "stock": v["stock"], "vin": v["vin"],
        "badge": badge(v["drive"], v["miles"]), "photos": v["photos"],
    } for v in raw]
    out.sort(key=lambda v: (-(v["year"] or 0), v["make"], v["model"]))

    js = f'''// Live inventory for Discount Auto LLC, pulled from cars-nwi.com.
// Regenerate with tools/refresh-inventory.py when the lot changes.
//
// `photos` holds filenames only; PHOTO_BASE + vehicle id + filename gives the
// full URL. Images are served from the dealership's existing DealerCarSearch
// CDN rather than committed here, so they stay current as stock turns over.
window.PHOTO_BASE = {json.dumps(PHOTO_BASE)};

window.photoURL = (v, i) => v.photos && v.photos[i]
  ? window.PHOTO_BASE + v.id + '/' + v.photos[i]
  : null;

window.VEHICLES = {json.dumps(out, indent=0, separators=(",", ":"))};

window.VEHICLES.forEach(v => {{
  v.title = [v.year, v.make, v.model].filter(Boolean).join(' ');
  v.fullTitle = [v.title, v.trim].filter(Boolean).join(' ');
  v.milesLabel = v.miles == null ? '—' : v.miles.toLocaleString();
  v.priceLabel = v.price == null ? 'Call for price' : '$' + v.price.toLocaleString();
}});
'''
    (ROOT / "data.js").write_text(js, encoding="utf-8")

    prices = [v["price"] for v in out if v["price"]]
    print(f"\nWrote data.js — {len(out)} vehicles, "
          f"{sum(len(v['photos']) for v in out)} photos")
    if prices:
        print(f"Price range ${min(prices):,} – ${max(prices):,}")
        print("NOTE: inventory.html hard-codes the price slider min/max — "
              "update it if this range moved.")


if __name__ == "__main__":
    sys.exit(main())

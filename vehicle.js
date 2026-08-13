// Vehicle detail page: reads ?id= from the URL, renders the photo gallery,
// specs and payment calculator for that vehicle.

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const vehicle = window.VEHICLES.find(v => v.id === params.get("id")) || window.VEHICLES[0];

  document.title = `${vehicle.fullTitle} — Discount Auto LLC`;
  document.getElementById("crumb-title").textContent = vehicle.title;
  document.getElementById("veh-title").textContent = vehicle.fullTitle;
  document.getElementById("veh-price").textContent = vehicle.priceLabel;

  const metaBits = [`${vehicle.milesLabel} miles`, vehicle.drive, `Stock ${vehicle.stock}`].filter(Boolean);
  document.getElementById("veh-meta").innerHTML =
    metaBits.map(b => `<span>${b}</span>`).join("<span>·</span>");

  // Carfax lookup — same DealerCarSearch partner link the current site uses.
  // No VIN means no report to look up, so drop the button rather than send
  // someone to an empty search.
  const carfax = document.getElementById("carfax-link");
  if (vehicle.vin) {
    carfax.href = "https://www.carfax.com/cfm/check_order.cfm?partner=DCS_2&vin=" +
      encodeURIComponent(vehicle.vin);
    carfax.title = `Carfax history for VIN ${vehicle.vin}`;
  } else {
    carfax.remove();
  }

  // --- gallery ---
  const mainPhoto = document.getElementById("main-photo");
  const thumbRow = document.querySelector(".thumb-row");
  const badge = document.getElementById("main-badge");

  if (vehicle.badge) badge.textContent = vehicle.badge;
  else badge.remove();

  let current = 0;
  function showPhoto(i) {
    current = i;
    mainPhoto.querySelectorAll(".veh-photo, .photo-slot").forEach(el => el.remove());
    mainPhoto.insertAdjacentHTML("afterbegin", vehPhotoHTML(vehicle, i, { eager: true }));
    thumbRow.querySelectorAll("button").forEach((b, n) =>
      b.classList.toggle("active", n === i));
  }

  const thumbCount = Math.min(vehicle.photos.length, 8);
  if (thumbCount > 1) {
    thumbRow.innerHTML = Array.from({ length: thumbCount }, (_, i) =>
      `<button type="button" class="thumb" aria-label="Show photo ${i + 1} of ${thumbCount}">
         ${vehPhotoHTML(vehicle, i)}
       </button>`).join("");
    thumbRow.querySelectorAll("button").forEach((b, i) =>
      b.addEventListener("click", () => showPhoto(i)));
  } else {
    thumbRow.remove();
  }
  showPhoto(0);

  const photoCount = vehicle.photos.length;
  const counter = document.getElementById("photo-count");
  if (counter) counter.textContent = photoCount ? `${photoCount} photos` : "";

  // --- specs ---
  const specRows = [
    ["Mileage", vehicle.milesLabel],
    ["Engine", vehicle.engine],
    ["Transmission", vehicle.trans],
    ["Drivetrain", vehicle.drive],
    ["Exterior", vehicle.color],
    ["Interior", vehicle.interior],
    ["Body type", vehicle.type],
    ["Stock #", vehicle.stock],
    ["VIN", vehicle.vin],
  ].filter(([, v]) => v);
  document.getElementById("spec-grid").innerHTML = specRows
    .map(([k, v]) => `<div class="spec-row"><span class="k">${k}</span><span>${v}</span></div>`)
    .join("");

  // --- similar: same body type, nearest price ---
  const similar = window.VEHICLES
    .filter(v => v.id !== vehicle.id && v.type === vehicle.type)
    .sort((a, b) => Math.abs((a.price ?? 0) - (vehicle.price ?? 0)) -
                    Math.abs((b.price ?? 0) - (vehicle.price ?? 0)))
    .slice(0, 3);
  document.getElementById("similar-grid").innerHTML = similar.map(vehCardHTML).join("");

  // --- payment calculator ---
  const calc = document.querySelector(".calc");
  if (vehicle.price == null) { calc.remove(); return; }

  const downRange = document.getElementById("down-range");
  const downLabel = document.getElementById("down-label");
  const monthlyAmt = document.getElementById("monthly-amt");
  const termBtns = document.querySelectorAll(".term-btn");
  const APR = 0.099;
  let term = 60;

  downRange.max = String(Math.max(500, Math.round(vehicle.price * 0.6 / 250) * 250));
  downRange.value = String(Math.min(+downRange.max, 1500));

  function recalc() {
    const down = Number(downRange.value);
    downLabel.textContent = "$" + down.toLocaleString();
    const principal = Math.max(0, vehicle.price - down);
    const r = APR / 12;
    const monthly = principal > 0 ? (principal * r) / (1 - Math.pow(1 + r, -term)) : 0;
    monthlyAmt.textContent = "$" + Math.round(monthly).toLocaleString();
  }

  downRange.addEventListener("input", recalc);
  termBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      term = Number(btn.dataset.term);
      termBtns.forEach(b => b.classList.toggle("active", b === btn));
      recalc();
    });
  });

  recalc();
});

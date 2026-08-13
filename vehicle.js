// Vehicle detail page: reads ?id= from the URL, renders specs + payment calculator for that vehicle.

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const wantedId = params.get("id");
  const vehicle = window.VEHICLES.find(v => v.id === wantedId) || window.VEHICLES[1];

  document.title = `${vehicle.title} — Discount Auto LLC`;
  document.getElementById("crumb-title").textContent = vehicle.title;
  document.getElementById("main-photo").insertAdjacentHTML(
    "afterbegin",
    `<div class="photo-slot" style="position:absolute; inset:0">${photoSlotHTML("Main photo — " + vehicle.title)}</div>`
  );
  document.getElementById("main-badge").textContent = vehicle.badge;

  document.getElementById("veh-title").textContent = vehicle.title;
  document.getElementById("veh-meta").innerHTML =
    `<span>${vehicle.milesLabel} miles</span><span>·</span><span>${vehicle.drive}</span><span>·</span><span>Stock ${vehicle.stock}</span>`;
  document.getElementById("veh-price").textContent = vehicle.priceLabel;

  const specRows = [
    ["Mileage", vehicle.milesLabel],
    ["Engine", vehicle.engine],
    ["Transmission", vehicle.trans],
    ["Drivetrain", vehicle.drive],
    ["Exterior", vehicle.exterior],
    ["Interior", vehicle.interior],
    ["Body type", vehicle.cab || vehicle.type],
    ["Stock #", vehicle.stock],
  ];
  document.getElementById("spec-grid").innerHTML = specRows
    .map(([k, v]) => `<div class="spec-row"><span class="k">${k}</span><span>${v}</span></div>`)
    .join("");

  document.getElementById("similar-grid").innerHTML = window.VEHICLES
    .filter(v => v.id !== vehicle.id)
    .slice(0, 3)
    .map(vehCardHTML)
    .join("");

  // --- payment calculator ---
  const downRange = document.getElementById("down-range");
  const downLabel = document.getElementById("down-label");
  const monthlyAmt = document.getElementById("monthly-amt");
  const termBtns = document.querySelectorAll(".term-btn");
  const APR = 0.099;
  let term = 60;

  downRange.max = String(Math.max(1000, Math.round(vehicle.price * 0.6)));

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

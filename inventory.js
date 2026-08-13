// Inventory page: body-type + max-price filters, sort, live count. All client-side over data.js.

document.addEventListener("DOMContentLoaded", () => {
  const els = {
    car: document.getElementById("f-car"),
    truck: document.getElementById("f-truck"),
    suv: document.getElementById("f-suv"),
    van: document.getElementById("f-van"),
    price: document.getElementById("f-price"),
    priceLabel: document.getElementById("f-price-label"),
    sort: document.getElementById("sort-select"),
    grid: document.getElementById("results-grid"),
    empty: document.getElementById("empty-state"),
    resultCount: document.getElementById("result-count"),
    headCount: document.getElementById("head-count"),
  };

  const typeToCheckbox = { Car: els.car, Truck: els.truck, SUV: els.suv, Van: els.van };

  // A ?type=SUV link from the homepage narrows to just that body type.
  const params = new URLSearchParams(location.search);
  const presetType = params.get("type");
  if (presetType && typeToCheckbox[presetType]) {
    Object.values(typeToCheckbox).forEach(cb => (cb.checked = false));
    typeToCheckbox[presetType].checked = true;
  }

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "miles-asc": (a, b) => a.miles - b.miles,
    "year-desc": (a, b) => b.year - a.year,
  };

  function render() {
    const typeOn = { Car: els.car.checked, Truck: els.truck.checked, SUV: els.suv.checked, Van: els.van.checked };
    const maxPrice = Number(els.price.value);
    els.priceLabel.textContent = "$" + maxPrice.toLocaleString();

    let list = window.VEHICLES.filter(v => typeOn[v.type] && v.price <= maxPrice);
    list = list.slice().sort(sorters[els.sort.value]);

    els.grid.innerHTML = list.map(vehCardHTML).join("");
    els.resultCount.textContent = list.length;
    els.headCount.textContent = window.VEHICLES.length;
    els.empty.style.display = list.length === 0 ? "" : "none";
    els.grid.style.display = list.length === 0 ? "none" : "";
  }

  [els.car, els.truck, els.suv, els.van, els.price, els.sort].forEach(el =>
    el.addEventListener("input", render)
  );

  render();
});

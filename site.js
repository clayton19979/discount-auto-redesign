// Shared behavior + markup helpers used across all four pages.

const CAR_ICON = `<svg width="34" height="20" viewBox="0 0 34 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 14.5V11L5 6.5C5.6 5.6 6.6 5 7.7 5H21.5C22.7 5 23.8 5.7 24.3 6.8L26.5 11.5H30C31.1 11.5 32 12.4 32 13.5V14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 14.5H32" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="9" cy="14.5" r="3" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="25" cy="14.5" r="3" stroke="currentColor" stroke-width="1.6"/>
  <path d="M9 5.5V11.5H24" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;

function photoSlotHTML(label) {
  return CAR_ICON + `<span>${label}</span>`;
}

// Renders a vehicle result card. `dark` swaps the card to sit on a dark section (see .similar on vehicle.html).
function vehCardHTML(v) {
  return `<a class="veh-card" href="vehicle.html?id=${encodeURIComponent(v.id)}">
    <div class="media">
      <div class="photo-slot">${photoSlotHTML(v.title + " photo")}</div>
      <span class="badge">${v.badge}</span>
    </div>
    <div class="body">
      <div class="title">${v.title}</div>
      <div class="meta"><span>${v.milesLabel} mi</span><span>·</span><span>${v.drive}</span><span>·</span><span>${v.type}</span></div>
      <div class="foot">
        <div class="price">${v.priceLabel}</div>
        <span class="details-link">Details →</span>
      </div>
    </div>
  </a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".hamburger");
  const panel = document.querySelector(".mobile-nav");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "✕" : "☰";
    });
  }

  document.querySelectorAll(".photo-slot[data-label]").forEach(el => {
    el.innerHTML = photoSlotHTML(el.dataset.label);
  });
});

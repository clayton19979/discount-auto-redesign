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

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// A vehicle photo that degrades to the striped placeholder if the CDN doesn't
// answer — the alternative is a broken-image icon in front of a customer.
function vehPhotoHTML(v, i, { eager = false } = {}) {
  const url = window.photoURL(v, i);
  const label = esc(v.fullTitle || v.title);
  if (!url) return `<div class="photo-slot">${photoSlotHTML(label)}</div>`;
  return `<img class="veh-photo" src="${esc(url)}" alt="${label}"
    loading="${eager ? 'eager' : 'lazy'}" decoding="async"
    onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'photo-slot',innerHTML:photoSlotHTML(${JSON.stringify(label)})}))">`;
}

// `i` is the card's position in its grid: the first row is above the fold on
// most screens, so those load eagerly instead of waiting for a scroll.
function vehCardHTML(v, i = 99) {
  return `<a class="veh-card" href="vehicle.html?id=${encodeURIComponent(v.id)}">
    <div class="media">
      ${vehPhotoHTML(v, 0, { eager: i < 3 })}
      ${v.badge ? `<span class="badge">${esc(v.badge)}</span>` : ''}
    </div>
    <div class="body">
      <div class="title">${esc(v.title)}</div>
      <div class="meta"><span>${v.milesLabel} mi</span><span>·</span><span>${esc(v.drive)}</span><span>·</span><span>${esc(v.type)}</span></div>
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

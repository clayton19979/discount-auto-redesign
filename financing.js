// Pre-qualify form: client-side only for the demo — no backend is wired up yet.
// Swap the submit handler for a real request (or a form service) before going live.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("prequal-form");
  const success = document.getElementById("form-success");
  const resetBtn = document.getElementById("reset-form");

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.classList.add("hide");
    success.classList.add("show");
  });

  resetBtn.addEventListener("click", () => {
    success.classList.remove("show");
    form.classList.remove("hide");
    form.reset();
  });
});

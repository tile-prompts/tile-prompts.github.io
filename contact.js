document.addEventListener("click", e => {
  const el = e.target.closest(".contact-tile[data-copy]");
  if (!el) return;

  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  e.preventDefault();
  const text = (el.getAttribute("data-copy") || el.textContent || "").trim();
  navigator.clipboard.writeText(text);

  const prevShadow = el.style.boxShadow;
  el.style.boxShadow = "0 0 0 1px rgba(160, 255, 200, 0.35), 0 0 22px rgba(160, 255, 200, 0.25)";
  setTimeout(() => {
    el.style.boxShadow = prevShadow;
  }, 650);
});
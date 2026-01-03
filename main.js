function autoCopy(el) {
  const text = el.textContent;
  navigator.clipboard.writeText(text);
  el.dataset.copied = "true";
  el.style.textShadow = "0 0 12px rgba(160, 255, 200, 0.8)";
  setTimeout(() => {
    el.style.textShadow = "";
    delete el.dataset.copied;
  }, 600);
}
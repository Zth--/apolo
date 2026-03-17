function updateClock() {
  const el = document.getElementById('utc-clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  el.textContent = `UTC ${h}:${m}:${s}`;
}

function hyperText(element, text, duration = 800) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let iterations = 0;

  element.classList.remove('hidden-text');

  const interval = setInterval(() => {
    if (iterations < text.length) {
      element.textContent = text.split("").map((l, i) => {
        if (l === " ") return l;
        if (i <= iterations) return text[i];
        return alphabet[Math.floor(Math.random() * alphabet.length)];
      }).join("");
      iterations += 0.3;
    } else {
      element.textContent = text;
      clearInterval(interval);
    }
  }, Math.max(duration / (text.length * 10), 30));
}

function initTyping() {
  const elements = document.querySelectorAll('.type-me');
  elements.forEach(el => {
    const text = el.textContent.trim();
    const delay = parseInt(el.getAttribute('data-delay') || '0');

    el.textContent = text.replace(/./g, '\u00A0');
    el.classList.add('hidden-text');

    setTimeout(() => {
      hyperText(el, text, 800);
    }, delay);
  });
}

function init() {
  updateClock();
  setInterval(updateClock, 1000);
  initTyping();
}

init();

function hyperText(element, text, duration = 800, onComplete) {
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
      if (onComplete) onComplete();
    }
  }, Math.max(duration / (text.length * 10), 30));
}

function initTyping() {
  const elements = document.querySelectorAll('.type-me');
  elements.forEach(el => {
    const text = el.textContent.trim();
    const delay = parseInt(el.getAttribute('data-delay') || '0');

    const originalHTML = el.innerHTML;
    el.textContent = text.replace(/./g, '\u00A0');
    el.classList.add('hidden-text');

    setTimeout(() => {
      hyperText(el, text, 800, () => {
        el.innerHTML = originalHTML;
      });
    }, delay);
  });
}

function initCopyButtons() {
  document.querySelectorAll('.entry-body pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.textContent.replace('copy', '').trim()).then(() => {
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'copy';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
    pre.appendChild(btn);
  });
}

function init() {
  initTyping();
  initCopyButtons();
}

init();

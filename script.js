function hyperText(element, text, duration = 800, onComplete) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let iterations = 0;

  element.classList.remove('hidden-text');
  element.style.visibility = 'visible';

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

function scrambleIn(element, options = {}) {
  const {
    scrambleSpeed = 25,
    scrambledLetterCount = 5,
    step = 1,
    delay = 0,
    onComplete = null,
  } = options;

  const text = element.textContent.trim();
  const originalHTML = element.innerHTML;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let revealedCount = 0;
  let interval = null;

  element.textContent = '\u00A0';
  element.style.visibility = 'visible';

  function tick() {
    if (revealedCount >= text.length) {
      element.innerHTML = originalHTML;
      clearInterval(interval);
      if (onComplete) onComplete();
      return;
    }

    let result = text.slice(0, revealedCount);
    const scrambleEnd = Math.min(revealedCount + scrambledLetterCount, text.length);
    for (let i = revealedCount; i < scrambleEnd; i++) {
      result += text[i] === ' '
        ? ' '
        : chars[Math.floor(Math.random() * chars.length)];
    }

    element.textContent = result;
    revealedCount = Math.min(revealedCount + step, text.length);
  }

  setTimeout(() => {
    interval = setInterval(tick, scrambleSpeed);
  }, delay);
}

function initScrambleIn() {
  document.querySelectorAll('.entry-title').forEach(el => {
    scrambleIn(el, { scrambleSpeed: 30, scrambledLetterCount: 4, step: 2, delay: 100 });
  });

  document.querySelectorAll('.entry-meta').forEach(el => {
    scrambleIn(el, { scrambleSpeed: 12, scrambledLetterCount: 5, step: 2, delay: 50 });
  });

  document.querySelectorAll('.feed-title').forEach((el, i) => {
    scrambleIn(el, { scrambleSpeed: 12, scrambledLetterCount: 5, step: 2, delay: 250 + i * 40 });
  });

  document.querySelectorAll('.feed-desc').forEach((el, i) => {
    scrambleIn(el, { scrambleSpeed: 10, scrambledLetterCount: 6, step: 2, delay: 280 + i * 40 });
  });

  const bodyEls = document.querySelectorAll('.entry-body p:not(.img-caption), .entry-body h2');
  if (!bodyEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    visible.forEach((entry, i) => {
      observer.unobserve(entry.target);
      const stagger = i * 60;
      entry.target.style.transition = 'opacity 0.3s ease';
      entry.target.style.opacity = '1';
      scrambleIn(entry.target, {
        scrambleSpeed: 14,
        scrambledLetterCount: 6,
        step: 3,
        delay: stagger,
      });
    });
  }, { threshold: 0.1 });

  bodyEls.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
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
  initScrambleIn();
  initCopyButtons();
}

document.fonts.ready.then(init);

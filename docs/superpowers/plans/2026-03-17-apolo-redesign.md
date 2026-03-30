# Apolo Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Apolo blog from a bland light-gray minimal site to a dark navy Mission Control / Signal Feed aesthetic where blog entries appear as incoming satellite transmissions.

**Architecture:** Pure static HTML/CSS/JS — no build tools, no framework. All pages share one `style.css` and one `script.js`. The system header is copy-pasted into each HTML file. Verification is done by opening files in a browser.

**Tech Stack:** HTML5, CSS3 custom properties, vanilla JS, JetBrains Mono + Inter (Google Fonts, already loaded)

**Spec:** `docs/superpowers/specs/2026-03-17-apolo-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `style.css` | Rewrite | All visual styles — variables, sys-header, hero, signal feed, entry pages, footer |
| `index.html` | Modify | Homepage — sys-header, hero, signal feed replacing iso-garden |
| `script.js` | Modify | Add UTC clock; keep typing effect; no iso-specific JS exists so nothing to remove |
| `blog/entry-1.html` | Rewrite | Convert raw text → full HTML with new template |
| `blog/entry-2.html` | Modify | Replace old structure (masthead/frame/whisper) with new sys-header/container/sys-footer |
| `blog/entry-3.html` | Modify | Same as entry-2.html |

---

## Task 1: Rewrite style.css

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Replace CSS custom properties**

Replace everything in the `:root {}` block with:

```css
:root {
  --bg:             #020810;
  --surface:        #03070f;
  --border:         #0d1f3c;
  --accent:         #4a9eff;
  --text-hi:        #e8f0ff;
  --text-mid:       #8aa8cc;
  --text-lo:        #2a5a8a;
  --status-active:  #2d9a5a;
  --status-locked:  #8a3a1a;

  --font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

- [ ] **Step 2: Replace base/reset styles**

Replace the `body, html` and `.page-wrapper` blocks:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: var(--font-mono);
  background: var(--bg);
  color: var(--text-mid);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Add sys-header styles**

```css
/* System Header */
.sys-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.sys-logo {
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.sys-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.sys-blog-name { color: var(--text-lo); }
.sys-clock     { color: var(--text-lo); }

.sys-back {
  color: var(--text-lo);
  text-decoration: none;
  transition: color 0.2s;
}
.sys-back:hover { color: var(--accent); }

.sys-status { font-size: 10px; letter-spacing: 0.05em; }
.status-active { color: var(--status-active); }
.status-locked { color: var(--status-locked); }
```

- [ ] **Step 4: Add container and grid-bg styles**

```css
/* Layout */
.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 32px;
  flex: 1;
  width: 100%;
}

.grid-bg {
  background-image:
    linear-gradient(rgba(30,80,180,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,80,180,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

- [ ] **Step 5: Add hero styles**

```css
/* Hero */
.hero {
  padding: 48px 0 40px;
}

.hero-tag {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--text-lo);
  margin-bottom: 12px;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  color: var(--text-hi);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 14px;
}

.accent-dot { color: var(--accent); }

.hero-sub {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--text-lo);
}
```

- [ ] **Step 6: Add signal feed styles**

```css
/* Signal Feed */
.signal-feed {
  display: flex;
  flex-direction: column;
}

.feed-entry {
  display: flex;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid #080f1e;
  text-decoration: none;
  transition: background 0.15s;
  color: inherit;
}

.feed-entry:last-child { border-bottom: none; }

a.feed-entry:hover {
  background: rgba(74, 158, 255, 0.03);
  padding-left: 4px;
}

.feed-ts {
  font-size: 10px;
  color: var(--text-lo);
  min-width: 72px;
  padding-top: 2px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.feed-content { flex: 1; }

.feed-title {
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.feed-desc {
  color: var(--text-mid);
  font-size: 11px;
  margin-bottom: 6px;
}

.feed-status {
  display: flex;
  gap: 14px;
}

.status-dot {
  font-size: 10px;
  letter-spacing: 0.05em;
}

.feed-freq {
  font-size: 10px;
  color: var(--text-lo);
}

.feed-locked { opacity: 0.65; }
.feed-ghost  { opacity: 0.2; }
```

- [ ] **Step 7: Add entry page styles**

```css
/* Entry Pages */
.entry-meta {
  font-size: 10px;
  color: var(--text-lo);
  letter-spacing: 0.15em;
  margin-bottom: 14px;
}

.entry-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: var(--text-hi);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 32px;
}

.entry-body {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.85;
  color: var(--text-mid);
  max-width: 640px;
}

.entry-body p         { margin-bottom: 1.4rem; }
.entry-body h2        { color: var(--text-hi); font-family: var(--font-mono); font-size: 1rem; letter-spacing: 0.05em; margin: 2rem 0 1rem; }
.entry-body em,
.entry-body strong    { color: var(--text-hi); }
.entry-body pre       { background: var(--surface); border: 1px solid var(--border); padding: 1rem; font-family: var(--font-mono); font-size: 13px; color: var(--text-mid); overflow-x: auto; margin-bottom: 1.4rem; }
```

- [ ] **Step 8: Add footer styles**

```css
/* Footer */
.sys-footer {
  text-align: center;
  padding: 20px 32px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--text-lo);
}
```

- [ ] **Step 9: Keep typing effect CSS, remove isometric CSS**

Keep these existing blocks unchanged:
- `.typing-cursor::after` and `@keyframes blink`
- `.hidden-text`
- `.fade-in` and `@keyframes fadeIn`

Delete all of the following blocks entirely:
- `.navbar`, `.logo`, `.subtitle`
- `.iso-garden-section`, `.iso-garden-container`, `.iso-grid`, `.iso-grid::before`
- `.iso-pillar`, `.iso-pillar > div`
- `.face-top`, `.face-left`, `.face-right`
- `.iso-title`, `.iso-desc`
- `.iso-pillar:hover` and all its child selectors
- `.iso-plant`, `.iso-stem`, `.iso-leaf`, `.iso-leaf-1`, `.iso-leaf-2`, `.iso-leaf-3`

Also delete the old `.hero-title`, `.hero-subtitle`, `.hero-section`, `.container` (will be replaced by new versions above).

Keep the blog-specific styles at the bottom (`.back-link`, `.blog-content`, `.locked-container`, `.lock-*`, `.error-msg`, `.ciphertext`, `.decoding-char`) — they're used by the existing entries and no harm leaving them.

- [ ] **Step 10: Open index.html in browser, verify no obvious breakage yet**

At this point the page will look broken (still uses old HTML classes) — that's expected. Just confirm the page loads without a JS error.

- [ ] **Step 11: Commit**

```bash
git add style.css
git commit -m "redesign: rewrite style.css — mission control dark theme"
```

---

## Task 2: Update index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `<header class="navbar">` block**

Remove:
```html
<header class="navbar">
  <div class="logo type-me" data-delay="0">nudo · un blog</div>
  <nav class="nav-links">
    <span class="subtitle type-me" data-delay="200">adrifo</span>
  </nav>
</header>
```

Replace with:
```html
<header class="sys-header">
  <span class="sys-logo">APOLO.SYS</span>
  <div class="sys-right">
    <span class="sys-blog-name">NUDO · UN BLOG</span>
    <span class="sys-clock" id="utc-clock">UTC --:--:--</span>
    <span class="sys-status status-active">● NOMINAL</span>
  </div>
</header>
```

- [ ] **Step 2: Replace the `<main class="container">` content**

Replace the entire `<main>` element (hero section + iso-garden section) with:

```html
<main class="container grid-bg">
  <section class="hero">
    <div class="hero-tag">N U D O · U N · B L O G</div>
    <h1 class="hero-title type-me" data-delay="200">Apolo<span class="accent-dot">.</span></h1>
    <div class="hero-sub type-me" data-delay="400">INCOMING TRANSMISSIONS</div>
  </section>

  <section class="signal-feed fade-in">

    <a href="blog/entry-1.html" class="feed-entry">
      <span class="feed-ts">14:32:07Z</span>
      <div class="feed-content">
        <div class="feed-title">// nudo</div>
        <div class="feed-desc">pre-apocalipsis — thoughts before the break</div>
        <div class="feed-status">
          <span class="status-dot status-active">● received</span>
          <span class="feed-freq">437.525 MHz</span>
        </div>
      </div>
    </a>

    <a href="blog/entry-2.html" class="feed-entry">
      <span class="feed-ts">13:17:44Z</span>
      <div class="feed-content">
        <div class="feed-title">// twelve-minute tones</div>
        <div class="feed-desc">a sound from the vents that lasted exactly twelve minutes</div>
        <div class="feed-status">
          <span class="status-dot status-active">● received</span>
          <span class="feed-freq">440.000 MHz</span>
        </div>
      </div>
    </a>

    <a href="blog/entry-3.html" class="feed-entry">
      <span class="feed-ts">11:58:22Z</span>
      <div class="feed-content">
        <div class="feed-title">// static_void</div>
        <div class="feed-desc">a function that never gets called</div>
        <div class="feed-status">
          <span class="status-dot status-active">● received</span>
          <span class="feed-freq">433.920 MHz</span>
        </div>
      </div>
    </a>

    <div class="feed-entry feed-locked">
      <span class="feed-ts">??:??:??Z</span>
      <div class="feed-content">
        <div class="feed-title">// lock</div>
        <div class="feed-desc">enc_data — [contents encrypted]</div>
        <div class="feed-status">
          <span class="status-dot status-locked">● locked</span>
          <span class="feed-freq">auth required</span>
        </div>
      </div>
    </div>

    <div class="feed-entry feed-ghost">
      <span class="feed-ts">??:??:??Z</span>
      <div class="feed-content">
        <div class="feed-title">// [signal lost]</div>
        <div class="feed-desc">awaiting transmission</div>
      </div>
    </div>

  </section>
</main>
```

- [ ] **Step 3: Replace the footer**

Remove:
```html
<footer class="footer">
  <div class="footer-content">
    <span class="type-me" data-delay="1200">fuerza, integridad, verdad.</span>
  </div>
</footer>
```

Replace with:
```html
<footer class="sys-footer">
  FUERZA · INTEGRIDAD · VERDAD
</footer>
```

- [ ] **Step 4: Open index.html in browser, verify design looks correct**

Expected: dark navy background, APOLO.SYS header, "Apolo." hero with blue dot, signal feed entries with timestamps and status dots, footer at bottom.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "redesign: update homepage — signal feed replaces iso-garden"
```

---

## Task 3: Update script.js — add UTC clock

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add UTC clock function**

Add the following before the existing `function hyperText(...)`:

```js
function updateClock() {
  const el = document.getElementById('utc-clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  el.textContent = `UTC ${h}:${m}:${s}`;
}
```

- [ ] **Step 2: Start the clock in init()**

In the existing `function init()`, add two lines:

```js
function init() {
  updateClock();
  setInterval(updateClock, 1000);
  initTyping();
}
```

- [ ] **Step 3: Open index.html in browser, verify the clock ticks**

The header should show a live `UTC HH:MM:SS` that updates every second.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add live UTC clock to system header"
```

---

## Task 4: Convert blog/entry-1.html from raw text to HTML

**Files:**
- Rewrite: `blog/entry-1.html`

- [ ] **Step 1: Replace the entire file with a proper HTML document**

The current file is raw text. Replace it entirely with:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>nudo :: apolo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="page-wrapper">
    <header class="sys-header">
      <a href="../index.html" class="sys-back">← apolo.sys</a>
      <div class="sys-right">
        <span class="sys-status status-active">● TRANSMISSION RECEIVED</span>
      </div>
    </header>

    <main class="container">
      <div class="entry-meta">ENTRY_001 · 14:32:07Z · 437.525 MHz</div>
      <h1 class="entry-title">nudo</h1>
      <div class="entry-body">
        <p>Me pregunto bastante sobre cuál es el punto de escribir sobre algo que muchos otros están hablando o escribiendo.</p>
        <p>Podría difundir lo que otros hacen o dicen y listo, ¿no? Pero creo que sí hay valor en repetir lo ya dicho, pero a mi manera.</p>
        <p>Que el mundo se va a la mierda lo venimos escuchando todos los años desde que tengo memoria. Las prosperidades que conozco son individuales, o de un grupo chico de personas que no conozco. No son comunitarias.</p>
        <p>Aquellos que la pegan se van a vivir a sus grandes casas, yates, islas, y medio que se olvidan de todo. Se codean de otros en su misma fortuna, y generalmente viven en burbujas alejadas de la sociedad.</p>
        <p>Aquellos que la pegan mucho se meten en la cocina de cosas mucho más grandes que ellos: ciudades, estados. Creen tener la fórmula para arreglar todo y subordinan a los políticos que tienen cada vez menos poder. Y los políticos son nuestros representantes. O sea, nos subordinan a nosotros.</p>
        <p>Por suerte también existen wozniaks en el mundo. Aquel que la pega mucho y no se cree el superhumano que puede arreglar el problema de las masas desde un yate. Las herramientas son para liberarnos de aquellos que buscan subordinarnos.</p>
        <p>¿Qué te une a vos de tu vecino, de tu amigo, de tu pareja?</p>

        <h2>La ciencia ficción es historia. Pero del futuro.</h2>
        <p>Son profecías autocumplidas. Los mismos científicos que se divierten leyendo ciencia ficción son los que luego quedan en la vanguardia de la tecnología y construyen esos mismos sistemas que alguna vez les divirtieron.</p>
        <p>El humano crea lo que imagina. Lo que visualiza.</p>
        <p>Y hace rato que no existe una visión optimista del mundo.</p>
        <p>Me puedo poner a listarlos; los que más me divierten son los de Neal Stephenson. La dark web aparece en William Gibson con su mercado negro de datos. ¿Celebridades virtuales? Hatsune Miku existe hace décadas. El metaverso se acuñó en Snow Crash en 1992. En Snow Crash ya no existen los países — solo megacorporaciones.</p>
      </div>
    </main>

    <footer class="sys-footer">FUERZA · INTEGRIDAD · VERDAD</footer>
  </div>
  <script src="../script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open blog/entry-1.html in browser, verify it renders correctly**

Expected: dark background, back link to apolo.sys, entry metadata, title "nudo", readable body text.

- [ ] **Step 3: Commit**

```bash
git add blog/entry-1.html
git commit -m "redesign: convert entry-1 from raw text to HTML, apply new template"
```

---

## Task 5: Update blog/entry-2.html

**Files:**
- Modify: `blog/entry-2.html`

- [ ] **Step 1: Replace the old structure**

The current file has: `<div id="bg-gems">`, `<main class="frame">`, `<header class="masthead">`, `<section class="garden">`, `<footer class="whisper">`.

Replace the entire `<body>` content with:

```html
<body>
  <div class="page-wrapper">
    <header class="sys-header">
      <a href="../index.html" class="sys-back">← apolo.sys</a>
      <div class="sys-right">
        <span class="sys-status status-active">● TRANSMISSION RECEIVED</span>
      </div>
    </header>

    <main class="container">
      <div class="entry-meta">ENTRY_002 · 13:17:44Z · 440.000 MHz</div>
      <h1 class="entry-title">Twelve-Minute Tones</h1>
      <div class="entry-body">
        <p>I heard a sound today that lasted exactly twelve minutes. It wasn't music, but it had a rhythm. Like a heartbeat, but slower. Much slower.</p>
        <p>It came from the vents. Or maybe it came from the speakers I thought were disconnected. The frequency was low, almost sub-perceptual. It made the water in my glass ripple in concentric circles.</p>
        <p>I recorded it. When I sped it up 100x, it sounded like a voice. It said one word, over and over again: "Wake."</p>
      </div>
    </main>

    <footer class="sys-footer">FUERZA · INTEGRIDAD · VERDAD</footer>
  </div>
  <script src="../script.js"></script>
</body>
```

- [ ] **Step 2: Open blog/entry-2.html in browser, verify**

Expected: same dark sys-header as entry-1, entry metadata, title, readable body.

- [ ] **Step 3: Commit**

```bash
git add blog/entry-2.html
git commit -m "redesign: update entry-2 to new template"
```

---

## Task 6: Update blog/entry-3.html

**Files:**
- Modify: `blog/entry-3.html`

- [ ] **Step 1: Replace the old structure**

Same approach as entry-2. Replace entire `<body>` content:

```html
<body>
  <div class="page-wrapper">
    <header class="sys-header">
      <a href="../index.html" class="sys-back">← apolo.sys</a>
      <div class="sys-right">
        <span class="sys-status status-active">● TRANSMISSION RECEIVED</span>
      </div>
    </header>

    <main class="container">
      <div class="entry-meta">ENTRY_003 · 11:58:22Z · 433.920 MHz</div>
      <h1 class="entry-title">static_void</h1>
      <div class="entry-body">
        <pre>void main() {
  // nothing here
  // just empty space
}</pre>
        <p>Sometimes I feel like a function that never gets called. Defined, compiled, optimized, but never executed. Sitting in memory, taking up space.</p>
        <p>Is there a garbage collector for lost thoughts? A way to free up the heap of my mind? I try to <code>free()</code> the pointers to the past, but I get a segmentation fault every time.</p>
        <p>Maybe I'm just a dangling reference.</p>
      </div>
    </main>

    <footer class="sys-footer">FUERZA · INTEGRIDAD · VERDAD</footer>
  </div>
  <script src="../script.js"></script>
</body>
```

Also add `.entry-body code { font-family: var(--font-mono); color: var(--accent); font-size: 0.9em; }` to `style.css`.

- [ ] **Step 2: Open blog/entry-3.html in browser, verify**

- [ ] **Step 3: Final pass — open all pages and check navigation**

- Click each feed entry on the homepage → correct entry opens
- `← apolo.sys` on each entry → returns to homepage
- UTC clock ticks on homepage
- Typing animation fires on hero title

- [ ] **Step 4: Commit**

```bash
git add blog/entry-3.html style.css
git commit -m "redesign: update entry-3 to new template, add code inline style"
```

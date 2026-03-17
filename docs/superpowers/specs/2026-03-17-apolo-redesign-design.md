# Apolo — Visual Redesign Spec

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Full visual redesign of index.html, style.css, script.js, and all blog entry pages

---

## Overview

Apolo is a personal blog by adrifo about hacking, running code, reaching the stars, and satellite work. The current design is minimal and bland — light gray background, white cards, floating isometric cubes — nothing that reflects the subject matter or energy of the writing.

The new direction is **Mission Control / Signal Feed**: a dark navy terminal aesthetic inspired by satellite operations centers. Blog posts are presented as incoming transmissions on a signal feed. The site should feel like entering a system, not visiting a blog.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#020810` | Page background |
| `--surface` | `#03070f` | Card / panel surface |
| `--border` | `#0d1f3c` | All borders and dividers |
| `--accent` | `#4a9eff` | Primary accent (titles, active elements) |
| `--text-hi` | `#e8f0ff` | High-contrast text (entry titles, hero) |
| `--text-mid` | `#8aa8cc` | Body text, descriptions |
| `--text-lo` | `#2a5a8a` | Muted text (timestamps, labels, metadata) |
| `--status-active` | `#2d9a5a` | ● received / active status |
| `--status-locked` | `#8a3a1a` | ● locked / encrypted status |

---

## Typography

- **JetBrains Mono** — all UI chrome: header, timestamps, metadata, labels, entry titles, footer. Already loaded via Google Fonts.
- **Inter** — blog post body text only. Increases readability for long-form writing. Already loaded.
- All other uses of Inter (outside blog body) switch to JetBrains Mono.

---

## Shared HTML Component: System Header

Every page uses the same system header structure. It is copy-pasted into each HTML file (no server-side includes). Two variants:

**Homepage variant:**
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

**Blog post variant:**
```html
<header class="sys-header">
  <a href="../index.html" class="sys-back">← apolo.sys</a>
  <div class="sys-right">
    <span class="sys-status status-active">● TRANSMISSION RECEIVED</span>
  </div>
</header>
```

CSS for `.sys-header`: `display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; border-bottom: 1px solid var(--border);`

The UTC clock (`#utc-clock`) is updated every second by JS (see script.js section).

---

## Homepage (`index.html`)

### Structure

```html
<body>
  <!-- system header (homepage variant) -->
  <header class="sys-header">...</header>

  <main class="container grid-bg">
    <!-- hero -->
    <section class="hero">...</section>

    <!-- signal feed -->
    <section class="signal-feed">...</section>
  </main>

  <footer class="sys-footer">
    FUERZA · INTEGRIDAD · VERDAD
  </footer>
</body>
```

### Hero

```html
<section class="hero">
  <div class="hero-tag">N U D O · U N · B L O G</div>
  <h1 class="hero-title">Apolo<span class="accent-dot">.</span></h1>
  <div class="hero-sub">INCOMING TRANSMISSIONS</div>
</section>
```

- `.hero-tag`: `font-size: 11px; letter-spacing: 0.25em; color: var(--text-lo);`
- `.hero-title`: `font-size: clamp(2.5rem, 6vw, 4rem); color: var(--text-hi); font-weight: 600; letter-spacing: -0.02em;`
- `.accent-dot`: `color: var(--accent);` — the period at the end of "Apolo" is a `<span>` colored in accent blue
- `.hero-sub`: `font-size: 11px; letter-spacing: 0.2em; color: var(--text-lo);`

### Signal Feed

Each entry is a row. The feed shows all known entries chronologically, newest first. Placeholder rows ("signal lost") for future entries.

```html
<section class="signal-feed">
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

  <!-- Placeholder for future encrypted entry -->
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

  <!-- Future slot -->
  <div class="feed-entry feed-ghost">
    <span class="feed-ts">??:??:??Z</span>
    <div class="feed-content">
      <div class="feed-title">// [signal lost]</div>
      <div class="feed-desc">awaiting transmission</div>
    </div>
  </div>
</section>
```

CSS notes:
- `.feed-entry`: `display: flex; gap: 20px; padding: 14px 0; border-bottom: 1px solid #080f1e; text-decoration: none; transition: background 0.15s;`
- `.feed-entry:hover`: `background: rgba(74,158,255,0.03);`
- `.feed-ts`: `font-size: 10px; color: var(--text-lo); min-width: 72px; padding-top: 2px; letter-spacing: 0.05em;`
- `.feed-title`: `color: var(--accent); font-size: 12px; letter-spacing: 0.05em; margin-bottom: 3px;`
- `.feed-desc`: `color: var(--text-mid); font-size: 11px;`
- `.feed-status`: `display: flex; gap: 14px; margin-top: 5px;`
- `.status-dot`: `font-size: 10px; letter-spacing: 0.05em;`
- `.status-active`: `color: var(--status-active);`
- `.status-locked`: `color: var(--status-locked);`
- `.feed-freq`: `font-size: 10px; color: var(--text-lo);`
- `.feed-locked`: like a normal entry but `opacity: 0.7;` and is a `<div>` not `<a>` (not clickable yet)
- `.feed-ghost`: `opacity: 0.2;` and is a `<div>`

### Grid Background

Applied to `.grid-bg` (the `<main>` element):
```css
.grid-bg {
  background-image:
    linear-gradient(rgba(30,80,180,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,80,180,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

### Footer

```html
<footer class="sys-footer">
  FUERZA · INTEGRIDAD · VERDAD
</footer>
```

CSS: `text-align: center; padding: 20px; border-top: 1px solid var(--border); font-size: 10px; letter-spacing: 0.2em; color: var(--text-lo);`

---

## Blog Post Pages

### entry-1.html — needs full HTML scaffolding

`entry-1.html` is currently a raw text file with no HTML structure. It must be converted to a full HTML document using the template below before applying styles.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>nudo :: apolo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <!-- system header (blog post variant) -->
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
      <!-- paste converted content here as <p> tags -->
    </div>
  </main>

  <footer class="sys-footer">FUERZA · INTEGRIDAD · VERDAD</footer>
  <script src="../script.js"></script>
</body>
</html>
```

The raw text content of the current `entry-1.html` becomes `<p>` paragraphs inside `.entry-body`. Section headings (lines starting with `#`) become `<h2>` elements.

### entry-2.html and entry-3.html

Both already have full HTML structure. Changes:
- Replace the `<header class="masthead">` with the blog post variant sys-header
- Replace `<main class="frame">` with `<main class="container">`
- Remove `<div id="bg-gems">` and `<section class="garden">`
- Wrap `<div class="blog-content">` content with the new entry header structure:

```html
<main class="container">
  <div class="entry-meta">ENTRY_00X · HH:MM:SSZ</div>
  <h1 class="entry-title"><!-- existing h1 text --></h1>
  <div class="entry-body">
    <!-- existing <p> content -->
  </div>
</main>
```

- Replace `<footer class="whisper">end of file</footer>` with `<footer class="sys-footer">FUERZA · INTEGRIDAD · VERDAD</footer>`

### Entry CSS

```css
.entry-meta {
  font-size: 10px;
  color: var(--text-lo);
  letter-spacing: 0.15em;
  margin-bottom: 14px;
}

.entry-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: var(--text-hi);
  letter-spacing: -0.02em;
  font-weight: 600;
  margin-bottom: 28px;
}

.entry-body {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.85;
  color: var(--text-mid);
  max-width: 640px;
}

.entry-body p { margin-bottom: 1.4rem; }
.entry-body h2 { color: var(--text-hi); font-size: 1.2rem; margin: 2rem 0 1rem; letter-spacing: -0.01em; }
.entry-body em, .entry-body strong { color: var(--text-hi); }
.entry-body pre { background: var(--surface); border: 1px solid var(--border); padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-mid); overflow-x: auto; margin-bottom: 1.4rem; }
```

---

## script.js Changes

### Add: UTC clock

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
updateClock();
setInterval(updateClock, 1000);
```

### Keep: Typing effect

The existing `type-me` / `typing-cursor` character reveal animation is kept as-is. It fits the "receiving transmission" metaphor. No changes needed.

### Remove: Any isometric-specific JS

Check for any JS referencing `.iso-pillar`, `.iso-plant`, `.iso-leaf`, or `.iso-stem` and remove those sections.

---

## What Is Removed

### From style.css
- All CSS variables with light values (`--bg-primary: #F9FAFB`, `--bg-secondary: #FFFFFF`, etc.)
- `.iso-garden-section`, `.iso-garden-container`, `.iso-grid`, `.iso-pillar`
- `.face-top`, `.face-left`, `.face-right`
- `.iso-plant`, `.iso-stem`, `.iso-leaf`, `.iso-leaf-1/2/3`
- `.navbar` (replaced by `.sys-header`)
- `.hero-title`, `.hero-subtitle` (replaced with new hero CSS)
- `.container` padding/max-width stays but background context changes

### From index.html
- `<section class="iso-garden-section">` and all children
- `<header class="navbar">` (replaced by sys-header)
- `"Welcome to Apolo."` h1 text
- `"choose your path..."` subtitle

---

## File Changes Summary

| File | Change |
|---|---|
| `style.css` | Full rewrite of CSS variables + all component styles. Remove all isometric CSS. |
| `index.html` | New sys-header, new hero, replace iso-garden with signal feed. |
| `blog/entry-1.html` | Convert from raw text to full HTML document. Apply new template. |
| `blog/entry-2.html` | Replace masthead/frame/whisper with sys-header/container/sys-footer. Add entry-meta. |
| `blog/entry-3.html` | Same as entry-2.html. |
| `script.js` | Add UTC clock. Keep typing effect. Remove iso-related JS if any. |

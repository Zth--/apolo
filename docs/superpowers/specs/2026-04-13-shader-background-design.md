# Shader Background — Design Spec

**Date:** 2026-04-13  
**Status:** Approved

## Summary

Add a domain-warp WebGL shader as a full-page background to apolo. The effect is deliberately subtle — dark has texture, not "there's a purple blob". Inspired by the fluid/organic aesthetic of Micasso-style noise warping.

## Visual Goal

- Style: domain warp fbm noise, slow organic drift
- Colors: `#020810` navy → barely-there purple → faint rose. Nothing reaches full brightness.
- Intensity: subliminal — perceptible on a calibrated screen, invisible on a washed-out one
- Animation speed: very slow (`time * 0.07`)

## Implementation

### Technique: Low-res canvas + CSS blur

Render the shader at **128×128** pixels. CSS scales and blurs it to fill the viewport. The blur makes the low resolution invisible and creates the soft organic look.

### HTML change (all pages: `index.html`, `about.html`, `blog/*.html`)

Add as first child of `<body>`:

```html
<canvas id="bg"></canvas>
```

### CSS additions (`style.css`)

```css
#bg {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  filter: blur(48px);
  transform: scale(1.15);  /* hides blur edge artifacts */
  opacity: 0.28;
  z-index: 0;
  pointer-events: none;
}

.page-wrapper {
  position: relative;
  z-index: 1;
}
```

### JS: `bg.js` (new file, ~60 lines)

Loaded via `<script src="bg.js"></script>` in all HTML files (before `script.js`).

**Responsibilities:**
1. Get `#bg` canvas, request WebGL context
2. If WebGL unavailable: return silently (flat `#020810` fallback)
3. Compile vertex + fragment shaders
4. Set canvas size to 128×128
5. Start `requestAnimationFrame` render loop

**Vertex shader:** Full-screen quad (two triangles covering clip space).

**Fragment shader:** 5-octave fbm domain warp.

- `fbm(p)` — 5 octaves of value noise, amplitude halved each octave
- `q = vec2(fbm(uv), fbm(uv + 5.2))` — first warp layer
- `r = vec2(fbm(uv + 4q + t_offset_1), fbm(uv + 4q + t_offset_2))` — second warp layer
- `f = fbm(uv + 4r)` — final field value
- Color palette: three-stop mix from navy → dim purple → dim rose, all significantly darkened before output
- Time uniform increments at `elapsed_seconds * 0.07`

**Uniforms:** `vec2 res`, `float time`

## Files Changed

| File | Change |
|------|--------|
| `bg.js` | New file — WebGL shader init + render loop |
| `style.css` | Add `#bg` rule, add `position:relative; z-index:1` to `.page-wrapper` |
| `index.html` | Add `<canvas id="bg">`, add `<script src="bg.js">` |
| `about.html` | Same |
| `blog/entry-ao.html` | Same |
| `blog/entry-1.html` | Same |
| `blog/entry-2.html` | Same |
| `blog/entry-3.html` | Same |

## Out of Scope

- No shader on `optimism-ai/index.html` (separate project)
- No reduced-motion media query handling (shader is slow enough it won't be disorienting)
- No mobile-specific tuning (128×128 canvas is already cheap)

# Shader Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a domain-warp WebGL shader as a subtle full-page background across all pages of the apolo static site.

**Architecture:** A new `bg.js` renders a GLSL domain-warp fragment shader onto a 128×128 `<canvas id="bg">` element; CSS scales + blurs it to fill the viewport at low GPU cost. Content sits above via `z-index`. Silently falls back to the existing flat `#020810` background if WebGL is unavailable.

**Tech Stack:** Vanilla WebGL (no libraries), GLSL fragment shader, CSS `filter: blur`, static HTML files.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `bg.js` | Create | WebGL init, shader compile, 128×128 render loop |
| `style.css` | Modify | `#bg` fixed + blur rules; `.page-wrapper` z-index |
| `index.html` | Modify | Add `<canvas id="bg">` + `<script src="bg.js">` |
| `about.html` | Modify | Same |
| `blog/entry-ao.html` | Modify | Same |
| `blog/entry-1.html` | Modify | Same |
| `blog/entry-2.html` | Modify | Same |
| `blog/entry-3.html` | Modify | Same |

---

## Task 1: CSS — position and blur the background canvas

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add `#bg` rule and update `.page-wrapper`**

Open `style.css`. Add the following block immediately after the `:root { ... }` block (before `* { ... }`):

```css
#bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  filter: blur(48px);
  transform: scale(1.15);
  opacity: 0.28;
  z-index: 0;
  pointer-events: none;
}
```

Then find the existing `.page-wrapper` rule:

```css
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

And add `position: relative; z-index: 1;` to it:

```css
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "style: add bg canvas positioning and blur rules"
```

---

## Task 2: Create `bg.js` — WebGL domain warp shader

**Files:**
- Create: `bg.js`

- [ ] **Step 1: Create `bg.js` with the full shader**

Create `/home/adrian/code/apolo/bg.js` with this exact content:

```javascript
(function () {
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  canvas.width = 128;
  canvas.height = 128;

  var VERT = [
    'attribute vec2 pos;',
    'void main() { gl_Position = vec4(pos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 res;',
    'uniform float time;',
    '',
    'vec2 hash2(vec2 p) {',
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
    '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);',
    '}',
    '',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(',
    '    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),',
    '        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),',
    '    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),',
    '        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    '',
    'float fbm(vec2 p) {',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 5; i++) {',
    '    v += a * noise(p);',
    '    p = p * 2.0 + vec2(1.7, 9.2);',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);',
    '  float t = time * 0.07;',
    '',
    '  vec2 q = vec2(fbm(uv + vec2(0.0, 0.0)),',
    '                fbm(uv + vec2(5.2, 1.3)));',
    '  vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7 + t * 0.15, 9.2)),',
    '                fbm(uv + 4.0 * q + vec2(8.3, 2.8 + t * 0.12)));',
    '  float f = fbm(uv + 4.0 * r + vec2(t, 0.0));',
    '',
    '  // Dark palette: navy base -> dim purple -> faint rose',
    '  vec3 col = mix(vec3(0.008, 0.016, 0.047),',
    '                 vec3(0.18, 0.04, 0.22),',
    '                 clamp(f * 2.0 + 0.5, 0.0, 1.0));',
    '  col = mix(col,',
    '            vec3(0.35, 0.08, 0.18),',
    '            clamp(f * f * 3.0 + 0.3, 0.0, 1.0));',
    '  col *= 0.6;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compileShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
    gl.STATIC_DRAW);

  var posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var resLoc  = gl.getUniformLocation(prog, 'res');
  var timeLoc = gl.getUniformLocation(prog, 'time');

  var start = null;
  function frame(ts) {
    if (!start) start = ts;
    var t = (ts - start) / 1000;
    gl.viewport(0, 0, 128, 128);
    gl.uniform2f(resLoc, 128, 128);
    gl.uniform1f(timeLoc, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
```

- [ ] **Step 2: Commit**

```bash
git add bg.js
git commit -m "feat: add domain-warp WebGL background shader"
```

---

## Task 3: Wire up `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add canvas element**

In `index.html`, find the opening `<body>` tag:

```html
<body>
  <div class="page-wrapper">
```

Add `<canvas id="bg"></canvas>` as the very first child of `<body>`:

```html
<body>
  <canvas id="bg"></canvas>
  <div class="page-wrapper">
```

- [ ] **Step 2: Add script tag**

Find the existing script tag near the bottom:

```html
  <script src="script.js"></script>
</body>
```

Add `bg.js` before it:

```html
  <script src="bg.js"></script>
  <script src="script.js"></script>
</body>
```

- [ ] **Step 3: Open in browser and verify**

Open `index.html` in a browser (via a local server or `file://`). You should see:
- The page loads normally with the existing dark navy theme
- A very subtle dark purple/rose texture visible in the background — barely there, like the dark has depth
- Text remains fully readable
- The effect animates extremely slowly

Open browser devtools → Console. There should be **zero errors**.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: wire bg shader to index.html"
```

---

## Task 4: Wire up remaining pages

**Files:**
- Modify: `about.html`, `blog/entry-ao.html`, `blog/entry-1.html`, `blog/entry-2.html`, `blog/entry-3.html`

Apply the same two changes to each file (canvas + script tag). The blog entry pages reference `bg.js` with a path relative to their location:

- [ ] **Step 1: Update `about.html`**

`about.html` is in the root — same paths as `index.html`:

```html
<body>
  <canvas id="bg"></canvas>
  <div class="page-wrapper">
```

```html
  <script src="bg.js"></script>
  <script src="script.js"></script>
</body>
```

- [ ] **Step 2: Update `blog/entry-ao.html`**

Blog files are one level deeper — `bg.js` and `script.js` are in the root, so use `../`:

```html
<body>
  <canvas id="bg"></canvas>
  <div class="page-wrapper">
```

```html
  <script src="../bg.js"></script>
  <script src="../script.js"></script>
</body>
```

Blog files already use `../script.js` (confirmed). Use `../bg.js` to match.

- [ ] **Step 3: Update `blog/entry-1.html`, `blog/entry-2.html`, `blog/entry-3.html`**

Same as `entry-ao.html` — add canvas at top of body, add `../bg.js` script before the existing script tag.

- [ ] **Step 4: Open each blog entry in a browser and verify**

Open `blog/entry-ao.html`. Check:
- Background shader visible (same subtle texture as index)
- No console errors
- `sys-header` bar, content, entry body all readable

- [ ] **Step 5: Commit**

```bash
git add about.html blog/entry-ao.html blog/entry-1.html blog/entry-2.html blog/entry-3.html
git commit -m "feat: wire bg shader to all remaining pages"
```

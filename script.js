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

function initGridGlow() {
  const canvas = document.createElement('canvas');
  canvas.id = 'grid-glow';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const vs = `
    attribute vec2 pos;
    void main() { gl_Position = vec4(pos, 0.0, 1.0); }
  `;

  const fs = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_grid;

    void main() {
      vec2 st = gl_FragCoord.xy;
      vec2 delta = st - u_mouse;
      float dist = length(delta);
      float radius = 160.0;
      float strength = 1.0 - smoothstep(0.0, radius, dist);

      vec2 dir = dist > 0.0 ? delta / dist : vec2(0.0);
      vec2 displaced = st + dir * strength * 12.0;

      vec2 grid = mod(displaced, u_grid);
      float line = step(grid.x, 1.0) + step(grid.y, 1.0);
      line = min(line, 1.0);

      float alpha = line * 0.06 * (1.0 + strength * 1.2);
      gl_FragColor = vec4(0.18, 0.47, 0.85, alpha);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uGrid = gl.getUniformLocation(prog, 'u_grid');

  let mx = -1000, my = -1000;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = -1000; my = -1000; });

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  function frame() {
    const dpr = window.devicePixelRatio || 1;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx * dpr, canvas.height - my * dpr);
    gl.uniform1f(uGrid, 28.0 * dpr);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();
}

function init() {
  updateClock();
  setInterval(updateClock, 1000);
  initTyping();
  initGridGlow();
}

init();

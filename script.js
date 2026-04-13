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
    uniform float u_time;

    // compute one grid layer: lines + nodes with magnetic pull toward cursor
    // returns vec2(lineAlpha, nodeAlpha)
    vec2 gridLayer(vec2 st, vec2 mouse, float gridSize, float strength, float dist, float time, float speed) {
      // idle wave
      float wave = sin(st.x * 0.008 + time * 0.7 * speed) * cos(st.y * 0.006 + time * 0.5 * speed);
      vec2 idleOffset = vec2(wave * 4.0, sin(st.y * 0.01 + time * 0.6 * speed) * 4.0) * speed;

      // magnetic pull: nodes drift toward cursor
      vec2 dir = dist > 0.0 ? (mouse - st) / dist : vec2(0.0);
      vec2 pull = dir * strength * strength * 24.0;

      vec2 displaced = st + pull + idleOffset;

      // grid lines
      vec2 g = mod(displaced, gridSize);
      float line = step(g.x, 1.0) + step(g.y, 1.0);
      line = min(line, 1.0);

      // node dots at intersections
      vec2 nodePos = mod(displaced + gridSize * 0.5, gridSize) - gridSize * 0.5;
      float nodeDist = length(nodePos);
      float node = 1.0 - smoothstep(1.5, 3.5, nodeDist);

      return vec2(line, node);
    }

    void main() {
      vec2 st = gl_FragCoord.xy;
      vec2 delta = st - u_mouse;
      float dist = length(delta);
      float radius = 250.0;
      float strength = 1.0 - smoothstep(0.0, radius, dist);

      // --- fine layer (foreground): reacts strongly to cursor ---
      vec2 fine = gridLayer(st, u_mouse, u_grid, strength, dist, u_time, 1.0);
      float fineLineAlpha = fine.x * (0.05 + strength * 0.1);
      float fineNodeGlow = fine.y * (0.15 + strength * 0.55);

      // --- coarse layer (background): slower, subtler, bigger grid ---
      float coarseGrid = u_grid * 3.0;
      float coarseRadius = 350.0;
      float coarseStrength = 1.0 - smoothstep(0.0, coarseRadius, dist);
      vec2 coarse = gridLayer(st, u_mouse, coarseGrid, coarseStrength * 0.4, dist, u_time, 0.4);
      float coarseLineAlpha = coarse.x * 0.025;
      float coarseNodeGlow = coarse.y * (0.06 + coarseStrength * 0.15);

      // combine layers
      float fineAlpha = max(fineLineAlpha, fineNodeGlow);
      float coarseAlpha = max(coarseLineAlpha, coarseNodeGlow);

      // fine layer: bright blue, coarse layer: dimmer, slightly different hue
      vec3 fineColor = mix(vec3(0.18, 0.47, 0.85), vec3(0.35, 0.65, 1.0), strength * 0.5 * fine.y);
      vec3 coarseColor = vec3(0.12, 0.35, 0.7);

      // blend: coarse behind, fine on top
      vec3 color = coarseColor * coarseAlpha + fineColor * fineAlpha;
      float alpha = min(coarseAlpha + fineAlpha, 1.0);

      gl_FragColor = vec4(color, alpha);
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
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const startTime = performance.now();

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
    gl.uniform1f(uTime, (performance.now() - startTime) * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();
}

function init() {
  initTyping();
  initGridGlow();
}

init();

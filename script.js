const field = document.getElementById('bg-gems');

// Roguelike dungeon palette
const palette = {
  gold: ['#ffd700', '#daa520', '#b8860b'],
  amber: ['#c9ad6a', '#a89050', '#8b7355'],
  gray: ['#808080', '#696969', '#505050'],
  red: ['#ff6b6b', '#cc5555', '#994444']
};

// Iconic ASCII artifacts - sparse and meaningful
const asciiPatterns = [
`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠋⠀⠉⠢⢀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⡁⠀⠀⠀⠀⠀⠑⠠⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⠑⢄⡀⠀⠀⠀⠀⠈⠑⢄⡀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⣀⣰⢉⣦⣄⠀⠀⠀⠀⠀⠈⢢
⠀⠀⠀⠀⠀⠀⠀⠀⡠⠐⠊⠁⠀⢩⣿⣯⡶⠃⠢⡀⠀⠀⡠⠊
⠀⠀⠀⠀⠀⠀⡠⠊⠀⠀⠀⠀⢠⡟⠁⢹⠀⡀⠄⠚⠑⠒⠁⠀
⠀⠀⠀⢀⠎⠉⠂⢄⠀⠀⠀⠀⠀⠀⠀⢸⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡰⠁⠀⠀⠀⠀⠁⠢⢀⠀⠀⠀⠀⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠀⡀⡘⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠰⠁⠁⠢⡀⠀⠀⠀⠀⠀⠀⠀⠀⢈⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⡇⠀⠀⠀⠀⠑⠄⡀⠀⠀⠀⠀⡠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢣⠀⠀⠀⠀⠀⠀⠈⠐⠄⢀⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠈⠆⡀⠀⠀⠀⠀⢀⡠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠉⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
  // Sword
  `  /\\
  ||
  ||
 =##=
  ||`,
  // Chalice
  `  \\/
   U
  |||
  ===`,
  // Skull
  `  ___
 |o o|
 '---'`,
  // Key
  ` .==.
 |  |
 '==`,
  // Eye
  ` .---.
 ( o )
  '='`,
  // Diamond
  `  /\\
 /  \\
 \\  /
  \\/`,
];

// Sparse artifacts - just a few slow drifting symbols
const layout = [
  { x: 20, size: 26, palette: 'gold', d: 45, delay: 0 },
  { x: 75, size: 24, palette: 'amber', d: 55, delay: -20 },
];

function addAsciiObject(cfg) {
  if (!field) return;
  const colors = palette[cfg.palette] || palette.green;
  const pattern = asciiPatterns[Math.floor(Math.random() * asciiPatterns.length)];

  const obj = document.createElement('div');
  obj.className = 'ascii-object';
  obj.textContent = pattern;
  obj.style.setProperty('--x', `${cfg.x}%`);
  obj.style.setProperty('--s', `${cfg.size}px`);
  obj.style.setProperty('--c1', colors[0]);
  obj.style.setProperty('--d', `${cfg.d}s`);
  obj.style.setProperty('--delay', `${cfg.delay}s`);

  field.appendChild(obj);

  obj.addEventListener('animationiteration', () => {
    const newPattern = asciiPatterns[Math.floor(Math.random() * asciiPatterns.length)];
    obj.textContent = newPattern;
    obj.style.setProperty('--x', `${5 + Math.random() * 90}%`);
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    obj.style.setProperty('--c1', newColor);
  });
}

function sprinkleSmalls(count = 2) {
  const palettes = ['gold', 'amber'];
  for (let i = 0; i < count; i++) {
    addAsciiObject({
      x: 15 + Math.random() * 70,
      size: 20 + Math.random() * 6,
      palette: palettes[Math.floor(Math.random() * palettes.length)],
      d: 40 + Math.random() * 25,
      delay: -Math.random() * 30
    });
  }
}

function typeWriter(element, text, speed = 10) {
  let i = 0;
  element.textContent = '';
  element.classList.remove('hidden-text');
  element.classList.add('typing-cursor');

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed + Math.random() * 20); // Randomize speed slightly for realism
    } else {
      element.classList.remove('typing-cursor');
    }
  }
  type();
}

function initTyping() {
  const elements = document.querySelectorAll('.type-me');
  elements.forEach(el => {
    const text = el.textContent.trim();
    const delay = parseInt(el.getAttribute('data-delay') || '0');

    el.textContent = '';
    el.classList.add('hidden-text');

    setTimeout(() => {
      typeWriter(el, text);
    }, delay);
  });
}

function init() {
  layout.forEach(addAsciiObject);
  sprinkleSmalls();
  initTyping();
  initDitherShader();
}

// WebGL Dithering Shader
function initDitherShader() {
  const canvas = document.getElementById('dither-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_resolution;

    // 4x4 Bayer matrix threshold
    float bayer4(vec2 uv) {
      vec2 c = floor(mod(uv, 4.0));
      float i = c.x + c.y * 4.0;
      // Unrolled 4x4 Bayer matrix
      if (i < 1.0) return 0.0/16.0;
      if (i < 2.0) return 8.0/16.0;
      if (i < 3.0) return 2.0/16.0;
      if (i < 4.0) return 10.0/16.0;
      if (i < 5.0) return 12.0/16.0;
      if (i < 6.0) return 4.0/16.0;
      if (i < 7.0) return 14.0/16.0;
      if (i < 8.0) return 6.0/16.0;
      if (i < 9.0) return 3.0/16.0;
      if (i < 10.0) return 11.0/16.0;
      if (i < 11.0) return 1.0/16.0;
      if (i < 12.0) return 9.0/16.0;
      if (i < 13.0) return 15.0/16.0;
      if (i < 14.0) return 7.0/16.0;
      if (i < 15.0) return 13.0/16.0;
      return 5.0/16.0;
    }

    void main() {
      // Pixel coordinates
      vec2 px = floor(v_uv * u_resolution / 3.0);

      // Bayer threshold
      float threshold = bayer4(px);

      // Animated gradient - diagonal waves
      float wave = sin(v_uv.x * 4.0 - v_uv.y * 3.0 + u_time * 0.4) * 0.5 + 0.5;
      float wave2 = cos(v_uv.y * 5.0 + u_time * 0.3) * 0.3 + 0.5;

      // Edge vignette
      vec2 edge = abs(v_uv - 0.5) * 2.0;
      float vignette = max(edge.x, edge.y);
      vignette = smoothstep(0.5, 1.0, vignette);

      // Combined intensity
      float intensity = wave * 0.5 + vignette * 0.5;

      // Dither
      float dither = step(threshold, intensity);

      // Amber/gold color
      vec3 color = vec3(1.0, 0.75, 0.2);

      gl_FragColor = vec4(color, dither * 0.18);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1
  ]), gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const timeLoc = gl.getUniformLocation(program, 'u_time');
  const resLoc = gl.getUniformLocation(program, 'u_resolution');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function render(time) {
    time *= 0.001;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(timeLoc, time);
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

init();

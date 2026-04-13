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

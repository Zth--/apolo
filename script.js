const canvas = document.getElementById('glcanvas');
const gl     = canvas.getContext('webgl');
const video  = document.getElementById('video');

async function loadShader(type, url) {
  const src = await fetch(url).then(r=>r.text());
  const s   = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(s));
  return s;
}

function resize(resLoc) {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(resLoc, canvas.width, canvas.height);
}

async function init() {
  const [vs, fs] = await Promise.all([
    loadShader(gl.VERTEX_SHADER,   'shaders/vertex.glsl'),
    loadShader(gl.FRAGMENT_SHADER, 'shaders/fragment.glsl')
  ]);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // quad
  const posLoc = gl.getAttribLocation(prog, 'position');
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1,1,
     1,-1,  1,1,   -1,1
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // uniforms
  const u_texLoc = gl.getUniformLocation(prog, 'u_texture');
  const u_resLoc = gl.getUniformLocation(prog, 'u_resolution');
  const u_timeLoc= gl.getUniformLocation(prog, 'u_time');
  gl.uniform1i(u_texLoc, 0);

  // webcam
  navigator.mediaDevices.getUserMedia({ video:true })
    .then(s=>{ video.srcObject = s; return video.play(); })
    .catch(e=>console.error(e));
  const vidTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, vidTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  window.addEventListener('resize', ()=>resize(u_resLoc));
  resize(u_resLoc);

  let start = performance.now();
  function render() {
    const t = (performance.now() - start) * 0.001;
    gl.uniform1f(u_timeLoc, t);

    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, vidTex);
      gl.texImage2D(
        gl.TEXTURE_2D,0,
        gl.RGB,gl.RGB,
        gl.UNSIGNED_BYTE,
        video
      );
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
  }
  render();
}

init();

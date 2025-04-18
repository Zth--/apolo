precision mediump float;
uniform sampler2D u_texture;
varying vec2 uv;

void main() {
  vec3 color = texture2D(u_texture, uv).rgb;
  gl_FragColor = vec4(color.bgr, 1.0); // simple channel swap
}


// shaders/fragment.glsl
precision mediump float;
uniform sampler2D u_texture;
uniform vec2      u_resolution;
uniform float     u_time;
#define PI 3.14159265359

// simple 2D random
float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

// smooth noise
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = rand(i), b = rand(i + vec2(1.0,0.0));
  float c = rand(i + vec2(0.0,1.0)), d = rand(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

// fractional Brownian motion
float fbm(vec2 p){
  float v = 0.0, amp = 0.5;
  for(int i = 0; i < 5; i++){
    v   += amp * noise(p);
    p   = p * 2.0 + 100.0;
    amp *= 0.5;
  }
  return v;
}

// n‑segment kaleidoscope
vec2 kaleido(vec2 uv, float n){
  float a = atan(uv.y, uv.x);
  float r = length(uv);
  float tau = 2.0*PI/n;
  a = mod(a, tau);
  a = abs(a - tau*0.5);
  return vec2(cos(a), sin(a)) * r;
}

void main(){
  // norm coords & center
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 c  = uv - 0.5;

  // kaleidoscope
  vec2 k = kaleido(c, 6.0) + 0.5;

  // flow offset from fbm
  vec2 off = vec2(
    fbm(k * 3.0 + u_time * 0.2),
    fbm(k * 3.0 - u_time * 0.2)
  ) - 0.5;

  // sample warped webcam
  float dispAmt = 0.1;
  vec2 sampUV = k + off * dispAmt;

  // chromatic split
  float ca = 0.005;
  float r = texture2D(u_texture, sampUV + vec2( ca, 0.0)).r;
  float g = texture2D(u_texture, sampUV             ).g;
  float b = texture2D(u_texture, sampUV + vec2(-ca, 0.0)).b;
  vec3 col = vec3(r, g, b);

  // slow rainbow tint
  vec3 rainbow = vec3(
    sin(u_time*0.3)*0.5+0.5,
    sin(u_time*0.6)*0.5+0.5,
    sin(u_time*0.9)*0.5+0.5
  );
  col = mix(col, rainbow, 0.2);

  gl_FragColor = vec4(col, 1.0);
}

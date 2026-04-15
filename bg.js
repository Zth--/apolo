(function () {
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var W = 480, H = 320;
  canvas.width = W;
  canvas.height = H;

  var BAYER = [
     0,32, 8,40, 2,34,10,42,
    48,16,56,24,50,18,58,26,
    12,44, 4,36,14,46, 6,38,
    60,28,52,20,62,30,54,22,
     3,35,11,43, 1,33, 9,41,
    51,19,59,27,49,17,57,25,
    15,47, 7,39,13,45, 5,37,
    63,31,55,23,61,29,53,21
  ];

  var ON_R = 130, ON_G = 190, ON_B = 255;
  var OFF_R = 8, OFF_G = 18, OFF_B = 35;

  var seed = 12345;
  function rand() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }

  var NUM_STARS = 120;
  var stars = [];
  for (var s = 0; s < NUM_STARS; s++) {
    stars.push({
      x: Math.floor(rand() * W),
      y: Math.floor(rand() * H),
      phase: rand() * Math.PI * 2,
      speed: 0.3 + rand() * 1.5,
      cross: rand() < 0.18,
      r: 210 + Math.floor(rand() * 45),
      g: 220 + Math.floor(rand() * 35),
      b: 240 + Math.floor(rand() * 15)
    });
  }

  var img = ctx.createImageData(W, H);
  var d = img.data;
  var t = 0;

  function frame() {
    var dx = t * 0.004, dy = t * 0.0025;
    var cdx = t * 0.008, cdy = t * 0.005;

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var nx = x / W + dx, ny = y / H + dy;

        var n = Math.sin(nx * 6.3 + t * 0.3) * Math.cos(ny * 4.7 + t * 0.25)
              + Math.sin((nx * 3.1 + ny * 5.9) - t * 0.2) * 0.6
              + Math.sin(Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5)) * 9 + t * 0.35) * 0.5;
        n = n / 2.0 * 0.5 + 0.5;
        if (n < 0) n = 0; if (n > 1) n = 1;

        var vx = x / W - 0.5, vy = y / H - 0.5;
        var vig = Math.max(0.5, 1.0 - (vx * vx + vy * vy) * 1.6);

        var cnx = x / W + cdx, cny = y / H + cdy;

        // domain warp for organic distortion
        var wx = Math.sin(cnx * 3.0 + cny * 2.0 + t * 0.045) * 0.12;
        var wy = Math.cos(cnx * 2.5 - cny * 2.8 + t * 0.035) * 0.12;
        var wcx = cnx + wx, wcy = cny + wy;

        var c1 = Math.sin(wcx * 3.2 + t * 0.03) * Math.cos(wcy * 2.6 - t * 0.025) * 0.5 + 0.5;
        var c2 = Math.sin(wcx * 6.0 + wcy * 5.0 + t * 0.06) * 0.3;
        var c3 = Math.sin(wcx * 11.0 + t * 0.09) * Math.cos(wcy * 9.5 - t * 0.055) * 0.15;

        var cloud = c1 + c2 + c3;
        if (cloud < 0) cloud = 0; if (cloud > 1) cloud = 1;

        var thresh = BAYER[(y & 7) * 8 + (x & 7)] / 64.0;
        var i = (y * W + x) * 4;

        var cloudEdge = 0.48;
        var inCloud = cloud > cloudEdge;
        var ci = inCloud ? (cloud - cloudEdge) / (1.0 - cloudEdge) : 0;

        var boosted = inCloud ? n + ci * 0.2 : n;
        var on = boosted > thresh;

        if (inCloud && on) {
          var intensity = Math.sqrt(ci);
          d[i]     = Math.floor((ON_R + (240 - ON_R) * intensity) * vig);
          d[i + 1] = Math.floor((ON_G + (245 - ON_G) * intensity) * vig);
          d[i + 2] = Math.floor((ON_B + (255 - ON_B) * intensity * 0.3) * vig);
        } else if (on) {
          d[i]     = Math.floor(ON_R * vig);
          d[i + 1] = Math.floor(ON_G * vig);
          d[i + 2] = Math.floor(ON_B * vig);
        } else if (inCloud) {
          var glow = ci * 0.25;
          d[i]     = Math.floor((OFF_R + 30 * glow) * vig);
          d[i + 1] = Math.floor((OFF_G + 32 * glow) * vig);
          d[i + 2] = Math.floor((OFF_B + 35 * glow) * vig);
        } else {
          d[i]     = Math.floor(OFF_R * vig);
          d[i + 1] = Math.floor(OFF_G * vig);
          d[i + 2] = Math.floor(OFF_B * vig);
        }
        d[i + 3] = 255;
      }
    }

    for (var s = 0; s < NUM_STARS; s++) {
      var star = stars[s];
      var twinkle = Math.sin(t * star.speed + star.phase);
      twinkle = (twinkle + 1) * 0.5;
      twinkle = twinkle * twinkle;
      if (twinkle < 0.15) continue;

      var sx = star.x, sy = star.y;
      var svx = sx / W - 0.5, svy = sy / H - 0.5;
      var svig = Math.max(0.5, 1.0 - (svx * svx + svy * svy) * 1.6);
      var bright = twinkle * svig;

      var si = (sy * W + sx) * 4;
      d[si]     = Math.min(255, Math.floor(star.r * bright * 1.8));
      d[si + 1] = Math.min(255, Math.floor(star.g * bright * 1.8));
      d[si + 2] = Math.min(255, Math.floor(star.b * bright * 1.8));

      if (star.cross && bright > 0.3) {
        var armBright = bright * 0.5;
        var arms = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var a = 0; a < 4; a++) {
          var ax = sx + arms[a][0], ay = sy + arms[a][1];
          if (ax >= 0 && ax < W && ay >= 0 && ay < H) {
            var ai = (ay * W + ax) * 4;
            d[ai]     = Math.min(255, Math.floor(star.r * armBright));
            d[ai + 1] = Math.min(255, Math.floor(star.g * armBright));
            d[ai + 2] = Math.min(255, Math.floor(star.b * armBright));
          }
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    t += 0.012;
    requestAnimationFrame(frame);
  }
  frame();
})();

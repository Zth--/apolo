(function () {
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var W = 480, H = 320;
  canvas.width = W;
  canvas.height = H;

  function ign(px, py) {
    var v = 0.06711056 * px + 0.00583715 * py;
    return (52.9829189 * (v - Math.floor(v))) % 1;
  }

  function hash2(ix, iy) {
    var h = (ix * 374761393 + iy * 668265263) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  function vnoise(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y);
    var fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = hash2(ix, iy), b = hash2(ix + 1, iy);
    var c = hash2(ix, iy + 1), dd = hash2(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + dd) * fx * fy;
  }

  function fbm(x, y) {
    var val = 0, amp = 0.5, freq = 1;
    for (var i = 0; i < 4; i++) {
      val += vnoise(x * freq, y * freq) * amp;
      amp *= 0.5;
      freq *= 2.0;
    }
    return val;
  }

  function smoothstep(e0, e1, x) {
    var v = (x - e0) / (e1 - e0);
    if (v < 0) v = 0; if (v > 1) v = 1;
    return v * v * (3 - 2 * v);
  }

  // Sky gradient stops: [y, offR, offG, offB, onR, onG, onB]
  var SKY = [
    [0.00,  4,   6,  18,   25,  35,  90],
    [0.30,  7,  10,  30,   40,  55, 130],
    [0.55, 10,  16,  42,   55,  80, 170],
    [0.80, 14,  22,  52,   65, 105, 195],
    [1.00, 18,  28,  58,   75, 125, 215]
  ];

  function skyColor(yNorm) {
    var i = 0;
    while (i < SKY.length - 2 && SKY[i + 1][0] < yNorm) i++;
    var a = SKY[i], b = SKY[i + 1];
    var t = (yNorm - a[0]) / (b[0] - a[0]);
    if (t < 0) t = 0; if (t > 1) t = 1;
    t = t * t * (3 - 2 * t); // smoothstep
    return [
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
      a[3] + (b[3] - a[3]) * t,
      a[4] + (b[4] - a[4]) * t,
      a[5] + (b[5] - a[5]) * t,
      a[6] + (b[6] - a[6]) * t
    ];
  }

  // Precompute sky gradient per row
  var skyRows = new Array(H);
  for (var row = 0; row < H; row++) {
    skyRows[row] = skyColor(row / (H - 1));
  }

  var seed = 12345;
  function rand() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }

  var NUM_STARS = 160;
  var stars = [];
  for (var s = 0; s < NUM_STARS; s++) {
    var sy = Math.floor(rand() * H * 0.55);
    stars.push({
      x: Math.floor(rand() * W),
      y: sy,
      cross: rand() < 0.15,
      bright: 0.6 + rand() * 0.4,
      r: 220 + Math.floor(rand() * 35),
      g: 230 + Math.floor(rand() * 25),
      b: 245 + Math.floor(rand() * 10)
    });
  }

  var img = ctx.createImageData(W, H);
  var d = img.data;
  var t = 0, frameCount = 0;

  function frame() {
    var dx = t * 0.004, dy = t * 0.0025;
    var cdx = t * 0.008, cdy = t * 0.005;

    // stars first — sky and clouds paint over them
    for (var y = 0; y < H; y++) {
      var sky = skyRows[y];
      for (var x = 0; x < W; x++) {
        var i = (y * W + x) * 4;
        d[i]     = Math.floor(sky[0]);
        d[i + 1] = Math.floor(sky[1]);
        d[i + 2] = Math.floor(sky[2]);
        d[i + 3] = 255;
      }
    }

    for (var s = 0; s < NUM_STARS; s++) {
      var star = stars[s];
      var sx = star.x, sy = star.y;
      var altFade = 1.0 - sy / (H * 0.55);
      if (altFade <= 0) continue;
      var bright = star.bright * altFade;

      var si = (sy * W + sx) * 4;
      d[si]     = Math.min(255, Math.floor(star.r * bright));
      d[si + 1] = Math.min(255, Math.floor(star.g * bright));
      d[si + 2] = Math.min(255, Math.floor(star.b * bright));

      if (star.cross) {
        var armBright = bright * 0.45;
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

    // sky + clouds dither over the star field
    for (var y = 0; y < H; y++) {
      var yNorm = y / (H - 1);
      var sky = skyRows[y];
      var offR = sky[0], offG = sky[1], offB = sky[2];
      var onR = sky[3], onG = sky[4], onB = sky[5];

      var horizonBoost = 0;

      for (var x = 0; x < W; x++) {
        var nx = x / W + dx, ny = y / H + dy;

        var n = Math.sin(nx * 6.3 + t * 0.3) * Math.cos(ny * 4.7 + t * 0.25)
              + Math.sin((nx * 3.1 + ny * 5.9) - t * 0.2) * 0.6
              + Math.sin(Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5)) * 9 + t * 0.35) * 0.5;
        n = n / 2.0 * 0.5 + 0.5;
        if (n < 0) n = 0; if (n > 1) n = 1;
        n = n * n;

        var cnx = x / W + cdx, cny = y / H + cdy;

        var wx = Math.sin(cnx * 3.0 + cny * 2.0 + t * 0.045) * 0.12;
        var wy = Math.cos(cnx * 2.5 - cny * 2.8 + t * 0.035) * 0.12;

        var cloud = fbm((cnx + wx) * 3.0, (cny + wy) * 3.0);
        if (cloud < 0) cloud = 0; if (cloud > 1) cloud = 1;

        var tOff = 5.588238 * (frameCount >> 7);

        var skyTh = ign(x + tOff, y + tOff);
        skyTh = skyTh < 0.5
          ? Math.sqrt(0.5 * skyTh)
          : 1.0 - Math.sqrt(0.5 * (1.0 - skyTh));

        var cloudTh = ign(x + 131 + tOff, y + 97 + tOff);
        cloudTh = cloudTh < 0.5
          ? Math.sqrt(0.5 * cloudTh)
          : 1.0 - Math.sqrt(0.5 * (1.0 - cloudTh));

        var i = (y * W + x) * 4;
        var cb = smoothstep(0.35, 0.55, cloud);
        var thresh = skyTh + (cloudTh - skyTh) * cb;

        var boosted = n + horizonBoost + cb * 0.2;
        var on = boosted > thresh;

        if (on) {
          var pR = onR, pG = onG, pB = onB;
          if (cb > 0) {
            var intensity = Math.sqrt(cb);
            var cR = onR + (230 - onR) * intensity;
            var cG = onG + (240 - onG) * intensity;
            var cB = onB + (255 - onB) * intensity;
            pR += (cR - pR) * cb;
            pG += (cG - pG) * cb;
            pB += (cB - pB) * cb;
          }
          d[i]     = Math.min(255, Math.floor(pR));
          d[i + 1] = Math.min(255, Math.floor(pG));
          d[i + 2] = Math.min(255, Math.floor(pB));
        } else if (cb > 0) {
          var glow = cb * 0.2;
          d[i]     = Math.floor(offR + (onR - offR) * glow);
          d[i + 1] = Math.floor(offG + (onG - offG) * glow);
          d[i + 2] = Math.floor(offB + (onB - offB) * glow);
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    t += 0.012;
    frameCount++;
    requestAnimationFrame(frame);
  }
  frame();
})();

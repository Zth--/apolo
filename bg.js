(function () {
  var canvas = document.getElementById('bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Low-res canvas — CSS stretches it with image-rendering: pixelated
  var W = 480, H = 320;
  canvas.width = W;
  canvas.height = H;

  // 8x8 Bayer ordered dither matrix
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

  // ON pixel: dim blue
  var ON_R = 15, ON_G = 40, ON_B = 110;
  // OFF pixel: site background
  var OFF_R = 2, OFF_G = 8, OFF_B = 16;

  // Beige cross stars — + shape, warm color, slow twinkle
  var seed = 12345;
  function rand() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }


  var img = ctx.createImageData(W, H);
  var d = img.data;
  var t = 0;

  function frame() {
    // slow drift — camera moving through the field
    var dx = t * 0.005, dy = t * 0.003;

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var nx = x / W + dx, ny = y / H + dy;
        // layered sin noise
        var n = Math.sin(nx * 6.3 + t * 0.3) * Math.cos(ny * 4.7 + t * 0.25)
              + Math.sin((nx * 3.1 + ny * 5.9) - t * 0.2) * 0.6
              + Math.sin(Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5)) * 9 + t * 0.35) * 0.5;
        n = n / 2.0 * 0.5 + 0.5;
        n = n < 0 ? 0 : n > 1 ? 1 : n;

        // vignette
        var vx = x / W - 0.5, vy = y / H - 0.5;
        var vig = Math.max(0.45, 1.0 - (vx * vx + vy * vy) * 1.6);

        var thresh = BAYER[(y & 7) * 8 + (x & 7)] / 64.0;
        var on = n > thresh;
        var i = (y * W + x) * 4;
        if (on) {
          // second noise field — decides warm vs blue
          var w = Math.sin(nx * 11.7 + t * 0.18) * Math.cos(ny * 9.3 - t * 0.14)
                + Math.sin((nx * 5.5 - ny * 7.1) + t * 0.09) * 0.5;
          w = w * 0.5 + 0.5;
          var warm = w > 0.78;
          d[i]     = Math.floor((warm ? 155 : ON_R) * vig);
          d[i + 1] = Math.floor((warm ? 125 : ON_G) * vig);
          d[i + 2] = Math.floor((warm ?  70 : ON_B) * vig);
        } else {
          d[i]     = Math.floor(OFF_R * vig);
          d[i + 1] = Math.floor(OFF_G * vig);
          d[i + 2] = Math.floor(OFF_B * vig);
        }
        d[i + 3] = 255;
      }
    }


    ctx.putImageData(img, 0, 0);
    t += 0.012;
    requestAnimationFrame(frame);
  }
  frame();
})();

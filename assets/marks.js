// Paints a few brush marks with p5.brush on page load and exposes them as CSS masks
// (--mark-stroke, --mark-blob-a, --mark-blob-b). Colour comes from CSS, so the marks are
// painted in black and only their texture is used. Each visit gets slightly different marks.
(() => {
  const root = document.documentElement;
  if (!window.brush) return;

  // two overlapping washes so the overlap reads darker, like layered paint
  function blot(circles) {
    brush.noStroke();
    brush.fillBleed(0.35, 'out');
    brush.fillTexture(0.9, 0.8);
    circles.forEach(([x, y, r], i) => {
      brush.fill('#000', i ? 70 : 95);
      brush.circle(x, y, r);
    });
  }

  const MARKS = {
    // short underline, used under project titles
    stroke: [800, 90, () => {
      brush.set('marker', '#000', 3);
      brush.spline([[30, 52], [260, 44], [540, 50], [770, 38]], 0.6);
    }],
    // watercolour blots for the page corners; two so they aren't identical
    'blob-a': [520, 520, () => blot([[245, 280, 150], [300, 235, 105]])],
    'blob-b': [520, 520, () => blot([[270, 250, 140], [215, 310, 95]])],
  };

  try {
    brush.scaleBrushes(3);
    for (const [name, [w, h, paint]] of Object.entries(MARKS)) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      brush.load(canvas);
      brush.clear();
      brush.push();
      brush.translate(-w / 2, -h / 2);
      paint();
      brush.pop();
      brush.render();
      root.style.setProperty(`--mark-${name}`, `url(${canvas.toDataURL('image/png')})`);
    }
    root.classList.add('has-marks');
  } catch (err) {
    // No WebGL2 or the library failed: the CSS fallbacks (plain underlines) stay in place.
    console.warn('brush marks unavailable:', err);
  }
})();

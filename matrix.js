// Tamil letterforms are wider than monospace Latin. Give each one its own
// cell, and draw complete trails so the letters stay crisp as they descend.
const GLYPHS = 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறன';
const FONT = 20;
const COLUMN = 34;
const ROW = 28;
const FRAME = 1000 / 30;

// stop() releases both the animation frame and the resize observer.
export function runMatrix(canvas, { bg = '--panel', prefill = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stop() {}, drain() {} };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, scale = 0;
  let streams = [];
  let stopped = false, draining = false, raf = 0;
  let last = performance.now();

  function paint() {
    const css = getComputedStyle(document.documentElement);
    ctx.globalAlpha = 1;
    ctx.fillStyle = css.getPropertyValue(bg).trim();
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${FONT}px "Tamil MN", "Noto Sans Tamil", Latha, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const head = css.getPropertyValue('--ink').trim();
    const tail = css.getPropertyValue('--spot').trim();

    for (const stream of streams) {
      const row = Math.floor(stream.row);
      for (let age = stream.length - 1; age >= 0; age--) {
        const y = (row - age) * ROW;
        if (y < -ROW || y > height) continue;
        ctx.globalAlpha = age === 0 ? 1 : 0.8 * (1 - age / stream.length) ** 1.6;
        ctx.fillStyle = age === 0 ? head : tail;
        // A letter stays in its cell until the tail has passed it. Randomizing
        // every frame made the old trails flicker rather than read as rain.
        const glyph = ((row - age) % stream.glyphs.length + stream.glyphs.length) % stream.glyphs.length;
        ctx.fillText(stream.glyphs[glyph], stream.x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    if (stopped) return;
    const bounds = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (bounds.width === width && bounds.height === height && dpr === scale) return;
    width = bounds.width;
    height = bounds.height;
    scale = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const columns = Math.max(1, Math.floor(width / COLUMN));
    const inset = (width - columns * COLUMN) / 2;
    streams = Array.from({ length: columns }, (_, i) => {
      const length = 6 + Math.floor(Math.random() * 7);
      return {
        x: inset + (i + 0.5) * COLUMN,
        row: still || prefill ? Math.random() * (height / ROW + length) : -Math.random() * height / ROW,
        speed: 9 + Math.random() * 8,
        length,
        glyphs: Array.from({ length: 48 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
      };
    });
    paint(); // The short intro starts with complete trails, not a blank field.
  }

  function frame(now) {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME) return;
    const elapsed = Math.min((now - last) / 1000, 0.08);
    last = now;
    for (const stream of streams) {
      stream.row += stream.speed * elapsed * (draining ? 2.4 : 1);
      if (!draining && (stream.row - stream.length) * ROW > height) {
        stream.row = -Math.random() * 8;
      }
    }
    paint();
  }

  const ro = new ResizeObserver(resize);
  resize();
  ro.observe(canvas);
  if (!still) raf = requestAnimationFrame(frame);

  return {
    stop: () => { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); },
    drain: () => { draining = true; },
  };
}

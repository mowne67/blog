// Tamil matrix rain. Sized to its container (not the window) and painted from
// the ground's own CSS variables, so it follows the ink/paper toggle.
const GLYPHS = 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறனABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const FONT = 16;
const TICK = 55; // ms between rows

// Returns a stop(); the intro overlay needs it, or its rAF loop keeps painting
// into a detached canvas after the element is removed.
export function runMatrix(canvas, { bg = '--panel', prefill = false } = {}) {
  const ctx = canvas.getContext('2d');
  // asked for no motion: seed a full field, paint it once, never animate
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let drops = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Stagger the starts so the field doesn't fall as one solid line. Seeding
    // down the height instead of above it means the field is already full on
    // frame one — the intro is too short to wait for rain to fall from the top.
    const span = still || prefill ? height / FONT : -40;
    drops = Array.from({ length: Math.ceil(width / FONT) }, () => Math.random() * span);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ponytail: assumes --panel is a 6-digit hex so the trail can append alpha.
  // If the palette ever moves to oklch(), sample the computed colour instead.
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  let last = 0;
  let stopped = false;
  function frame(now) {
    if (stopped) return;
    if (!still) requestAnimationFrame(frame); // rAF, not setInterval: pauses with the tab
    if (now - last < TICK) return;
    last = now;

    const { width, height } = canvas.getBoundingClientRect();
    // the wash is the trail: lighter than this and old glyphs never clear, so
    // the panel fills with static instead of reading as falling columns
    ctx.fillStyle = css(bg) + '40';
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${FONT}px "JetBrains Mono", monospace`;

    const head = css('--ink');
    const tail = css('--spot');
    for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = drops[i] < 1 ? head : tail;
      ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(frame);

  return () => { stopped = true; ro.disconnect(); };
}

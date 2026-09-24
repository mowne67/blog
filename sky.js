// Pixel-art sky behind each hero: banded sky, clouds, two hills, a dithered
// edge that dissolves into the page, and trees, grass and flowers that sway in
// the wind. Painted at 1/PX resolution and scaled up with image-rendering:
// pixelated, so every "pixel" is a PX block. Colours come from the --sky-*
// tokens, so the ground toggle turns day to night.
const PX = 6;
const FPS = 8; // the wind moves in whole pixels, so a low, stepped rate reads as pixel art

// seeded, so the scene is the same composition on every paint and resize
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// 4x4 ordered dither threshold, 0..1
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// Builds the scene for the canvas's current size and palette. The still layer
// is painted once into an ImageData; returns draw(t), which puts that layer
// back and paints the plants on top with their wind offset at time t (seconds).
export function buildSky(canvas) {
  const ctx = canvas.getContext('2d');
  // any CSS colour to [r, g, b], by letting the canvas parse it
  const rgb = (name) => {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
    const h = ctx.fillStyle; // always #rrggbb for opaque colours
    return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  };

  const W = Math.ceil(canvas.clientWidth / PX);
  const H = Math.ceil(canvas.clientHeight / PX);
  if (!W || !H) return () => {};
  canvas.width = W;
  canvas.height = H;

  const [top, bot, cloud, shade, far, hill, hill2, star, bg, trunk, leaf, flower] =
    ['--sky-top', '--sky-bot', '--cloud', '--cloud-shade', '--hill-far', '--hill', '--hill-dark', '--star', '--bg',
     '--trunk', '--leaf', '--flower'].map(rgb);
  const img = ctx.createImageData(W, H);
  const put = (x, y, c) => { const i = (y * W + x) * 4; img.data.set(c, i); img.data[i + 3] = 255; };
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  // the hero's text block in sky cells: clouds and stars stay out of it, so
  // the white type always sits on clear sky (on phones it spans the width)
  const box = canvas.parentElement.querySelector('.hd')?.getBoundingClientRect();
  const at = canvas.getBoundingClientRect();
  const [bx0, by0, bx1, by1] = box
    ? [(box.left - at.left) / PX - 3, (box.top - at.top) / PX - 3, (box.right - at.left) / PX + 3, (box.bottom - at.top) / PX + 3]
    : [0, 0, 0, 0];
  const clear = (x, y, pad = 0) => x + pad < bx0 || x - pad > bx1 || y + pad < by0 || y - pad > by1;

  const r = rng(7);
  // clouds: clusters of overlapping discs, biased right
  const discs = [];
  for (let c = 0; c < 6; c++) {
    const cx = W * (0.45 + r() * 0.6), cy = H * (0.06 + r() * 0.5), n = 5 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const d = [cx + (r() - 0.5) * 34, cy + (r() - 0.5) * 8, 4 + r() * 8];
      if (clear(d[0], d[1], d[2])) discs.push(d);
    }
  }
  const stars = new Set();
  for (let k = 0; k < 40; k++) {
    const x = Math.floor(r() * W), y = Math.floor(r() * H * 0.6);
    if (clear(x, y)) stars.add(y * W + x);
  }
  // hills: sums of sines, far one higher and paler. Measured up from the
  // bottom in rows, so they fill the hero's bottom padding at any height.
  const ph = [r() * 6, r() * 6, r() * 6, r() * 6];
  const farY = (x) => H - 34 + Math.sin(x / 23 + ph[0]) * 4 + Math.sin(x / 9 + ph[1]) * 2;
  const nearY = (x) => H - 22 + Math.sin(x / 31 + ph[2]) * 4 + Math.sin(x / 11 + ph[3]) * 2;
  const edge = 10; // rows of dissolve at the bottom

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = BAYER[(y % 4) * 4 + (x % 4)];
      // five sky bands, dithered at the seams
      let c = mix(top, bot, Math.min(1, Math.floor((y / H) * 5 + d) / 5));
      if (star.some(Boolean) && stars.has(y * W + x)) c = star; // day sets --star to black: no stars
      let inCloud = false, low = 0;
      for (const [cx, cy, cr] of discs) {
        const dx = x - cx, dy = (y - cy) * 1.6;
        if (dx * dx + dy * dy < cr * cr) { inCloud = true; low = Math.max(low, (y - cy) / cr); }
      }
      if (inCloud) c = low > 0.35 + d * 0.4 ? shade : cloud;
      if (y > farY(x)) c = far;
      const ny = nearY(x);
      if (y > ny) c = (y - ny) / (H - ny) > 0.25 + d * 0.5 ? hill2 : hill;
      // the dissolve: page ground eats the scene from the bottom, pixel by pixel
      const t = (y - (H - edge)) / edge;
      if (t > 0 && r() < t * t * 1.4) c = bg;
      put(x, y, c);
    }
  }

  // ── plants: cells [x, y, colour, sway weight, wave phase] ──
  const plants = [];
  const dark = (c) => c.map((v) => Math.round(v * 0.7));
  const bark = dark(trunk);
  // a tree: a trunk, and a canopy of overlapping discs lit from the upper left.
  // Leaves sway more the higher they sit, and each row gets its own phase, so
  // the canopy ripples instead of sliding as one block.
  function tree(bx, size) {
    const by = Math.round(nearY(bx)) + 2, th = Math.round(size * 0.8), cy = by - th - size * 0.25;
    const lobes = Array.from({ length: 7 }, () => [bx + (r() - 0.5) * size * 0.9, cy + (r() - 0.5) * size * 0.5, size * (0.3 + r() * 0.2)]);
    const reach = size * 0.9;
    // shrink or drop a tree that would reach into the text block
    if (!clear(bx, cy, reach)) return size > 8 ? tree(bx, size * 0.75) : null;
    for (let y = Math.floor(cy - reach); y < by; y++) {
      for (let x = Math.floor(bx - reach); x < bx + reach; x++) {
        const d = BAYER[((y + 64) % 4) * 4 + ((x + 64) % 4)];
        const w = Math.max(0, (by - y) / (by - cy + reach));
        if (lobes.some(([lx, ly, lr]) => (x - lx) ** 2 + ((y - ly) * 1.2) ** 2 < lr * lr)) {
          const lit = (x - bx + (y - cy) * 1.3) / reach; // -1 upper left .. 1 lower right
          plants.push([x, y, lit < -0.35 + d * 0.3 ? leaf : lit > 0.25 + d * 0.3 ? hill2 : hill, w, y * 0.45]);
        } else if (y > cy && Math.abs(x + 0.5 - bx) < Math.max(1.5, size * 0.09)) {
          plants.push([x, y, x < bx ? trunk : bark, w * 0.3, 0]);
        }
      }
    }
    return true;
  }
  tree(Math.round(W - 12), Math.min(26, H * 0.3)); // the big one on the right edge
  tree(Math.round(W * 0.72), Math.min(15, H * 0.18));
  tree(Math.round(W * 0.07), Math.min(12, H * 0.15));
  // grass tufts along the near hill, and a few flowers among them
  for (let x = 0; x < W; x += 2 + Math.floor(r() * 3)) {
    const base = Math.round(nearY(x)), h = 1 + Math.floor(r() * 3);
    for (let k = 1; k <= h; k++) plants.push([x, base - k, k === h ? leaf : hill2, k / 3, x * 0.18]);
    if (r() < 0.12) {
      const fx = x + 1, fb = Math.round(nearY(fx)), fh = 3 + Math.floor(r() * 2);
      for (let k = 1; k < fh; k++) plants.push([fx, fb - k, hill2, k / fh, fx * 0.18]);
      plants.push([fx, fb - fh, flower, 1, fx * 0.18]);
    }
  }
  const cols = new Map(); // one fillStyle string per colour, not per cell
  const css = (c) => cols.get(c) ?? (cols.set(c, `rgb(${c})`), cols.get(c));

  return (t) => {
    ctx.putImageData(img, 0, 0);
    for (const [x, y, c, w, ph] of plants) {
      // two sines: a slow gust and a quicker flutter
      const dx = Math.round((Math.sin(t * 1.4 + ph) * 1.1 + Math.sin(t * 3.1 + ph * 1.7) * 0.4) * w);
      ctx.fillStyle = css(c);
      ctx.fillRect(x + dx, y, 1, 1);
    }
  };
}

// Build, rebuild on resize and on the ground toggle, and animate the wind while
// the sky is on screen. Reduced motion gets one still frame.
export function wireSky(canvas) {
  if (!canvas) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let draw = () => {}, onScreen = true, last = 0;
  const build = () => { draw = buildSky(canvas); draw(last / 1000); };
  new ResizeObserver(build).observe(canvas);
  new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // rAF, so it also stops with the tab
  const tick = (now) => {
    requestAnimationFrame(tick);
    if (!onScreen || now - last < 1000 / FPS) return;
    last = now;
    draw(now / 1000);
  };
  if (!still) requestAnimationFrame(tick);

  // the nav reads as part of the sky until the hero scrolls out from under it
  const nav = document.querySelector('.nav');
  new IntersectionObserver(([e]) => nav.classList.toggle('over', e.isIntersecting), {
    rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`,
  }).observe(canvas);
  new IntersectionObserver(([e]) => (onScreen = e.isIntersecting)).observe(canvas);
}

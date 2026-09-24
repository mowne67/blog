// Pixel-art sky behind the profile hero: banded sky, clouds, two hills, and a
// dithered edge that dissolves into the page. Painted at 1/PX resolution and
// scaled up with image-rendering: pixelated, so every "pixel" is a PX block.
// Colours come from the --sky-* tokens, so the ground toggle turns day to night.
const PX = 6;

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

export function paintSky(canvas) {
  const ctx = canvas.getContext('2d');
  // any CSS colour to [r, g, b], by letting the canvas parse it
  const rgb = (name) => {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
    const h = ctx.fillStyle; // always #rrggbb for opaque colours
    return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  };

  const W = Math.ceil(canvas.clientWidth / PX);
  const H = Math.ceil(canvas.clientHeight / PX);
  if (!W || !H) return;
  canvas.width = W;
  canvas.height = H;

  const [top, bot, cloud, shade, far, hill, hill2, star, bg] =
    ['--sky-top', '--sky-bot', '--cloud', '--cloud-shade', '--hill-far', '--hill', '--hill-dark', '--star', '--bg'].map(rgb);
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
  ctx.putImageData(img, 0, 0);
}

// Paint, and repaint on resize and on the ground toggle.
export function wireSky(canvas) {
  if (!canvas) return;
  const paint = () => paintSky(canvas);
  new ResizeObserver(paint).observe(canvas);
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // the nav reads as part of the sky until the hero scrolls out from under it
  const nav = document.querySelector('.nav');
  new IntersectionObserver(([e]) => nav.classList.toggle('over', e.isIntersecting), {
    rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`,
  }).observe(canvas);
}

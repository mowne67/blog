import { wireChrome } from './chrome.js';
import { runMatrix } from './matrix.js';

// Paths only; filenames carry the date, so the strip never loads a post body.
const postPaths = Object.keys(import.meta.glob('./posts/*.md', { query: '?raw', import: 'default' }));

async function fillStats() {
  const dates = postPaths
    .map((p) => (p.match(/(\d{4}-\d{2}-\d{2})/) || [])[1])
    .filter(Boolean)
    .sort();
  const latest = dates.at(-1);

  document.getElementById('n-posts').textContent = postPaths.length;
  document.querySelectorAll('[data-posts]').forEach((n) => (n.textContent = postPaths.length));
  document.querySelectorAll('[data-latest]').forEach((n) => (n.textContent = latest || 'none yet'));

  // unauthenticated and rate-limited; the cell just stays "…" when it fails
  try {
    const res = await fetch('https://api.github.com/users/mowne67');
    if (!res.ok) throw new Error(res.status);
    document.getElementById('n-repos').textContent = (await res.json()).public_repos;
  } catch (err) { /* leave the placeholder */ }
}

function introRain() {
  const c = document.getElementById('rain-intro');
  if (!c) return;
  // an unskippable full-page animation is exactly what reduced-motion means
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return c.remove();

  const rain = runMatrix(c, { bg: '--bg', prefill: true });
  setTimeout(() => {
    // the rain drains downward on its own; the canvas itself never moves, so
    // there is no edge sliding across the page
    rain.drain();
    c.classList.add('gone');
    c.addEventListener('transitionend', () => { rain.stop(); c.remove(); }, { once: true });
  }, 1900);
}

function wireCopy() {
  const btn = document.getElementById('copy-btn');
  btn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('mownetharan@gmail.com');
      btn.textContent = 'copied';
    } catch (err) {
      // no clipboard permission (or a non-secure origin): select it so ⌘C works
      getSelection().selectAllChildren(document.getElementById('contact-cmd'));
      btn.textContent = 'press ⌘c';
    }
    setTimeout(() => (btn.textContent = 'copy'), 1800);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireChrome();
  wireCopy();
  introRain();
  fillStats();
});

import { marked } from 'marked';
import { wireChrome } from './chrome.js';
import { runMatrix } from './matrix.js';

// Paths only — filenames carry the date, so the strip never loads a post body.
const postPaths = Object.keys(import.meta.glob('./posts/*.md', { query: '?raw', import: 'default' }));

async function fetchGitHubReadme() {
  const el = document.getElementById('github-readme');
  if (!el) return;
  try {
    // raw.githubusercontent can take seconds or hang; without the timeout the
    // plate sits on "loading…" forever instead of admitting it failed
    const res = await fetch('https://raw.githubusercontent.com/mowne67/mowne67/main/README.md', {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(res.status);
    el.innerHTML = marked(await res.text());
  } catch (err) {
    el.innerHTML = 'Could not reach GitHub. The profile README lives at <a href="https://github.com/mowne67">github.com/mowne67</a>.';
  }
}

async function fillStats() {
  const dates = postPaths
    .map((p) => (p.match(/(\d{4}-\d{2}-\d{2})/) || [])[1])
    .filter(Boolean)
    .sort();
  const latest = dates.at(-1);

  document.getElementById('n-posts').textContent = postPaths.length;
  document.querySelectorAll('[data-posts]').forEach((n) => (n.textContent = postPaths.length));
  document.querySelectorAll('[data-latest]').forEach((n) => (n.textContent = latest || 'none yet'));

  // unauthenticated and rate-limited; the cell just stays "—" when it fails
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

  const stop = runMatrix(c, { bg: '--bg', prefill: true });
  setTimeout(() => {
    c.classList.add('gone');
    c.addEventListener('transitionend', () => { stop(); c.remove(); }, { once: true });
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
  fetchGitHubReadme();
});

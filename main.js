import { wireChrome } from './chrome.js';
import { runMatrix } from './matrix.js';
import { wireSky } from './sky.js';

function introRain() {
  const c = document.getElementById('rain-intro');
  if (!c) return;
  // an unskippable full-page animation is exactly what reduced-motion means
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return c.remove();
  // once per session; reloads and return visits go straight to the page
  try {
    if (sessionStorage.getItem('rain')) return c.remove();
    sessionStorage.setItem('rain', '1');
  } catch (e) { /* storage blocked: just play it */ }

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
  wireSky(document.querySelector('.hero > .sky'));
  wireCopy();
  introRain();
});

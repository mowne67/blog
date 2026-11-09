import { wireCal } from './cal.js';
import { wireChrome } from './chrome.js';
import { runMatrix } from './matrix.js';
import { wireSky } from './sky.js';
import { wireUpi } from './upi.js';

function introRain() {
  const c = document.getElementById('rain-intro');
  if (!c) return;
  delete document.documentElement.dataset.rain;
  // Deep links go straight to their destination; reduced motion skips the intro.
  if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return c.remove();
  // once per session; reloads and return visits go straight to the page
  try {
    if (sessionStorage.getItem('rain')) return c.remove();
    sessionStorage.setItem('rain', '1');
  } catch (e) { /* storage blocked: just play it */ }

  c.classList.add('playing');
  const rain = runMatrix(c, { bg: '--bg', prefill: true });
  const events = new AbortController();
  let revealTimer, cleanupTimer;
  const finish = () => {
    clearTimeout(revealTimer);
    clearTimeout(cleanupTimer);
    events.abort();
    rain.stop();
    c.remove();
  };
  // Any intent to use the page clears the decoration immediately. Passive
  // listeners let the original scroll, tap or key press continue normally.
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
    window.addEventListener(type, finish, { capture: true, passive: true, signal: events.signal });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finish();
  }, { signal: events.signal });
  window.addEventListener('pagehide', finish, { signal: events.signal });
  c.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'opacity') finish();
  }, { signal: events.signal });
  revealTimer = setTimeout(() => {
    // Accelerate the streams while dissolving into the sky; never translate
    // the canvas itself, which would sweep a hard edge over the page.
    rain.drain();
    c.classList.add('gone');
    cleanupTimer = setTimeout(finish, 750); // Also clean up if transitionend is lost.
  }, 750);
}

function wireCopy() {
  // the address is written once, in the nav's mailto link
  const email = document.querySelector('a.btn[href^="mailto:"]')?.getAttribute('href').slice(7);
  const btn = document.getElementById('copy-btn');
  if (!email) return;
  btn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
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
  wireUpi();
  wireCal();
  introRain();
});

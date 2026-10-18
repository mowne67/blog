import { wireChrome } from './chrome.js';
import { wireSky } from './sky.js';

// Posts are real pages now; the list used to render them in place, so old
// /blog#<slug> links (with the date still in the slug) are mapped to their
// page here. seo.js renders the map into the page.
function wireLegacyLinks() {
  const el = document.getElementById('legacy-posts');
  if (!el) return;
  let map = {};
  try {
    map = JSON.parse(el.textContent);
  } catch (e) {
    return;
  }
  const go = () => {
    const to = map[location.hash.slice(1)];
    if (to) location.replace(to);
  };
  go();
  addEventListener('hashchange', go);
}

document.addEventListener('DOMContentLoaded', () => {
  wireChrome();
  wireSky(document.querySelector('.hero > .sky'));
  wireLegacyLinks();
});

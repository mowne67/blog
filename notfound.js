import { wireChrome } from './chrome.js';
import { wireSky } from './sky.js';

document.addEventListener('DOMContentLoaded', () => {
  wireChrome();
  wireSky(document.querySelector('.hero > .sky'));
});

// Lazy Cal.com inline embed. embed.js is only fetched once #chat is near the
// viewport (or someone asks for it), not on every profile page load.
const CAL_SRC = 'https://app.cal.com/embed/embed.js';
const HOST = '#my-cal-inline-chat';

// Official Cal loader snippet, unchanged apart from formatting.
function installLoader(C, A, L) {
  const p = function (a, ar) { a.q.push(ar); };
  const d = C.document;
  C.Cal = C.Cal || function () {
    const cal = C.Cal;
    const ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement('script')).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments); };
      const namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === 'string') {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ['initNamespace', namespace]);
      } else p(cal, ar);
      return;
    }
    p(cal, ar);
  };
}

const calTheme = (mode) => (mode === 'ink' ? 'dark' : 'light');
const currentTheme = () => calTheme(document.documentElement.dataset.mode);

function setCalTheme() {
  const theme = currentTheme();
  window.Cal.ns.chat('ui', { hideEventTypeDetails: false, layout: 'month_view', theme });
  // ui() alone doesn't repaint an already-loaded iframe, so also retheme its src
  const iframe = document.querySelector(`${HOST} iframe.cal-embed`);
  if (iframe) {
    const url = new URL(iframe.src);
    if (url.searchParams.get('theme') !== theme) {
      url.searchParams.set('theme', theme);
      iframe.src = url;
    }
  }
}

// embed.js appends its iframe (plus a loader) into the host, leaving our
// fallback paragraph in place, so hide it ourselves once the iframe is live.
function hideFallbackWhenLoaded(host) {
  const fallback = host.querySelector('.cal-fallback-wrap');
  if (!fallback) return;
  const watch = (iframe) => {
    if (iframe.dataset.calWatched) return;
    iframe.dataset.calWatched = '1';
    iframe.addEventListener('load', () => { fallback.hidden = true; }, { once: true });
  };
  const scan = () => host.querySelectorAll('iframe').forEach(watch);
  new MutationObserver(scan).observe(host, { childList: true, subtree: true });
  scan();
}

export function wireCal() {
  const host = document.querySelector(HOST);
  const section = document.getElementById('chat');
  if (!host || !section) return;

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    io?.disconnect();
    hideFallbackWhenLoaded(host);
    installLoader(window, CAL_SRC, 'init');
    const Cal = window.Cal;
    Cal('init', 'chat', { origin: 'https://app.cal.com' });
    Cal.config = Cal.config || {};
    Cal.config.forwardQueryParams = true;
    Cal.ns.chat('inline', {
      elementOrSelector: HOST,
      config: { layout: 'month_view', useSlotsViewOnSmallScreen: true, theme: currentTheme() },
      calLink: 'mowne/chat',
    });
    setCalTheme();
    new MutationObserver(setCalTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });
  };

  let io = null;
  if (location.hash === '#chat' || !('IntersectionObserver' in window)) return start();

  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) start();
  }, { rootMargin: '800px 0px' });
  io.observe(section);
  document.querySelectorAll('a[href="#chat"]').forEach((a) =>
    a.addEventListener('click', start, { once: true })
  );
}

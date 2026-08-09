// Nav chrome shared by both pages: ground toggle and the mobile sheet.
// The initial state is applied by an inline script in <head> to avoid a flash.

// The one place the ground→design mapping is written. Both attributes are set
// together from this table, so data-mode and data-theme can never disagree.
// The same table is inlined in each page's <head>; change both if you remap.
export const GROUND = { ink: 'sheet', paper: 'spark' };

export function wireChrome() {
  const sync = (mode) => {
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.dataset.theme = GROUND[mode];
    document.querySelectorAll('.mode button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.ground === mode))
    );
  };
  sync(GROUND[document.documentElement.dataset.mode] ? document.documentElement.dataset.mode : 'ink');

  document.querySelectorAll('.mode button').forEach((b) =>
    b.addEventListener('click', () => {
      sync(b.dataset.ground);
      try { localStorage.setItem('ground', b.dataset.ground); } catch (e) { /* private mode */ }
    })
  );

  const menu = document.getElementById('nav-menu');
  const sheet = document.getElementById('nav-sheet');
  menu?.addEventListener('click', () => {
    const open = sheet.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

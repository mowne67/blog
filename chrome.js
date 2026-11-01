// Nav chrome shared by every page: ground toggle and the mobile sheet.
// The initial state is applied by an inline script in <head> to avoid a flash.
// Ground is the palette only: paper (day) or ink (night).

export function wireChrome() {
  const sync = (mode) => {
    document.documentElement.dataset.mode = mode;
    document.querySelector('meta[name="theme-color"]').content =
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    document.querySelectorAll('.mode button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.ground === mode))
    );
  };
  sync(document.documentElement.dataset.mode === 'ink' ? 'ink' : 'paper');

  document.querySelectorAll('.mode button').forEach((b) =>
    b.addEventListener('click', () => {
      sync(b.dataset.ground);
      try { localStorage.setItem('ground', b.dataset.ground); } catch (e) { /* private mode */ }
    })
  );

  const menu = document.getElementById('nav-menu');
  const sheet = document.getElementById('nav-sheet');
  if (!menu || !sheet) return;
  const setOpen = (open) => {
    sheet.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  };
  menu.addEventListener('click', () => setOpen(!sheet.classList.contains('open')));
  // closes like a menu: Esc (focus back on the button), a tap outside, or a link
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !sheet.classList.contains('open')) return;
    setOpen(false);
    menu.focus();
  });
  document.addEventListener('click', (e) => {
    if (sheet.classList.contains('open') && !sheet.contains(e.target) && !menu.contains(e.target)) setOpen(false);
  });
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
}

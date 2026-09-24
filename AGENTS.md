# AGENTS.md

Personal site: profile page + markdown blog. Vite, no framework, a handful of small JS modules.

For facts about Mowne (roles, dates, what he built), see
[SOURCES.md](SOURCES.md). Do not write a claim into the site that does not
trace back to one of the sources listed there.

## Design

One design, modelled on [cofounder.co](https://cofounder.co): warm off-white
ground, Hanken Grotesk with two-tone headings (`h1 em` and `.head .r` step back
to `--faint`), IBM Plex Mono eyebrows, soft cards (`--card` shadow: white inner
highlight plus a hairline edge), and a pixel-art sky over every page's hero.
Everything lives in `theme.css`.

The ground toggle in the nav only swaps the palette: `paper` (day, default)
or `ink` (night). `data-mode` on `<html>` is the only attribute. The default is
set in three places and they must agree: `data-mode` on `<html>`, the fallback
in the `<head>` script, and the fallback in `wireChrome()`, plus the
`aria-pressed` on the two toggle buttons. `<meta name="theme-color">` should
match paper's `--bg`.

### Token contract

`:root` holds paper, `html[data-mode="ink"]` overrides it. Both must define:
`--bg --panel --mass --ink --head --dim --faint --faint2 --line --line2 --spot
--spot-ink --grid --hi --edge` and the sky set `--sky-top --sky-bot --cloud
--cloud-shade --hill-far --hill --hill-dark --star --trunk --leaf --flower` (`--star: #000` means no
stars). Anything painting colour outside CSS (the intro rain in `matrix.js`,
the sky in `sky.js`) reads these, which is why it recolours with the toggle.
`--bg` must stay a 6-digit hex: the rain appends an alpha to it.

### The sky

`sky.js` paints the hero `<canvas class="sky">` on every page at 1/6 resolution,
scaled up with `image-rendering: pixelated`. It is procedural and seeded, not
an image, so it is the same scene on every paint. The hills are measured up
from the bottom in rows, which is why `.hero:has(> .sky)` keeps ~270px of
bottom padding. Clouds and stars skip the `.hd` text block so white type
always sits on clear sky; trees that would reach into it shrink or drop out.
The trees, grass and flowers sway at 8fps in whole-pixel steps; the still
layer is painted once and only the plant cells are redrawn each frame. The
animation pauses off screen, and reduced motion gets a single still frame. The hero is pulled up under the sticky nav, and
`wireSky()` toggles `.nav.over` (transparent, glass pills) while the sky is
under it. `index.html` ships the nav with `over` already set so it doesn't
flash solid before JS runs.

## JS

- `chrome.js` - ground toggle + mobile sheet. Shared by every page.
- `main.js` - profile page: intro rain, sky, live stats, copy button.
- `sky.js` - the pixel sky behind each page's hero, and the nav's `.over` state.
- `blog.js` - blog: loads `posts/*.md` via `import.meta.glob`, hash routing.
- `matrix.js` - Tamil matrix rain. Intro overlay only, ~1.9s, then removed.
  Returns a `stop()`; call it or the rAF loop keeps painting into a detached canvas.

Gotchas that have already bitten:

- `import.meta.glob` on `.md` **needs `query: '?raw'`**, or rollup parses the
  markdown as JavaScript and the build fails.
- Sort posts on the `Date`, not the formatted string.

## Assets

`assets/logos/` holds the employer marks, rendered as CSS masks in
`currentColor` so they follow the palette. Sizes are per logo in
`theme.css`. Anything under 4KB gets inlined as a data URI by vite; that's
expected.

## Checks

`npm run build` must pass. There are no tests; verify visually in **both**
grounds, and at phone width (the sky has to keep clouds off the text).

# AGENTS.md

Personal site: profile page + markdown blog. Vite, no framework, a handful of small JS modules.

`tools/` is a separately deployed static showcase imported from `mowne67/tools`.
It has its own styles and chrome and needs no build step. The design and Vite
instructions below describe the profile and blog at the repository root. See
[README.md](README.md) for the two Cloudflare Workers project settings.

For facts about Mowne (roles, dates, what he built), see
[SOURCES.md](SOURCES.md). Do not write a claim into the site that does not
trace back to one of the sources listed there.

## Design

One design, modelled on [cofounder.co](https://cofounder.co): warm off-white
ground, Hanken Grotesk with two-tone headings (`h1 em` and `.head .r` step back
to `--faint`), IBM Plex Mono eyebrows, soft cards (`--card` shadow: white inner
highlight plus a hairline edge), and a pixel-art sky over every page's hero.
Everything lives in `theme.css`.

The ground toggle in the nav only swaps the palette: `paper` (day) or `ink`
(night). A saved choice wins; otherwise the `<head>` script uses the system
colour scheme. `data-mode` on `<html>` and the toggle buttons start in paper
as the no-JS fallback; `wireChrome()` syncs the buttons to the chosen mode.
`<meta name="theme-color">` follows the active `--bg`.

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
- `main.js` - profile page: intro rain, sky, copy button.
- `sky.js` - the pixel sky behind each page's hero, and the nav's `.over` state.
- `blog.js` - blog list page: chrome, sky, and the `#slug` links the old
  hash-routed list left behind, mapped to real pages.
- `post.js` - a post page: the nav and the sheet, nothing else. No sky.
- `matrix.js` - Tamil matrix rain. Intro overlay only, ~1.9s, then removed.
  Returns a `stop()`; call it or the rAF loop keeps painting into a detached canvas.

## Blog URLs and SEO

Every post is a real page. `seo.js` - a Vite plugin, wired up in
`vite.config.js` - reads `posts/*.md` at build time and emits
`dist/blog/<slug>.html`, the list rows and their count inside `blog.html`, and
`sitemap.xml`. Public slugs drop the date prefix, so
`posts/2026-10-04-tools-behind-health-eligible.md` is served at
`/blog/tools-behind-health-eligible`.

Cloudflare's `html_handling: "auto-trailing-slash"` is what makes those URLs
extensionless and slashless, so canonicals, the sitemap and internal links all
use `/`, `/blog` and `/blog/<slug>` - never the `.html` forms, which redirect.
Each post page carries the usual head plus `BlogPosting` JSON-LD, and the
profile carries the `Person`/`WebSite` graph that ties name, handle, employer
and profiles together. What goes into that JSON-LD is copy: it traces to
[SOURCES.md](SOURCES.md) like anything else on the page.

Read posts at build time, not in the browser: the markdown is no longer shipped
as a JS chunk, and `marked` and `front-matter` never reach the client.

Gotchas that have already bitten:

- Post pages reuse **blog.html's own nav, sheet and footer**, read out of the
  file by `seo.js`. Keep those three blocks shaped as they are (`nav
  class="nav over"`, `div class="sheet"`, `footer class="foot"`) and keep page
  links rooted (`/`, `/blog`), or the build stops with a message.
- `generateBundle` never runs for the dev server, so `seo.js` also serves post
  pages from `configureServer`. `/blog` has to be rewritten there as well: Vite
  resolves it to `blog.js`, and the page's stylesheet needs `?direct` or the
  dev server hands it back as a JS module.
- Sort posts on the `Date`, not the formatted string.

## Assets

`assets/logos/` holds the employer marks, rendered as CSS masks in
`currentColor` so they follow the palette. Sizes are per logo in
`theme.css`. Anything under 4KB gets inlined as a data URI by vite; that's
expected.

## Checks

`npm run build` must pass. There are no tests; verify visually in **both**
grounds, and at phone width (the sky has to keep clouds off the text).

`npm run dev` serves the generated post pages too, so check `/blog`, a post URL
and an old `#slug` link there. Cloudflare, not Vite, is what decides those URLs
in production: run the same three checks on a workers.dev deployment before
trusting the custom domain.

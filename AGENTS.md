# AGENTS.md

Personal site: profile page + markdown blog. Vite, no framework, three JS modules.

For facts about Mowne (roles, dates, what he built), see
[SOURCES.md](SOURCES.md). Do not write a claim into the site that does not
trace back to one of the sources listed there.

## Ground and design are one switch

The site ships **two complete designs**, and the ground toggle in the nav picks
between them. They are not independent settings:

| Ground            | Design  | Look                                              |
| ----------------- | ------- | ------------------------------------------------- |
| `paper` (default) | `spark` | light, chunky pills, hard shadows, emoji stickers |
| `ink`             | `sheet` | dark, hairline grid, editorial, one accent        |

The default is set in four places and they must agree: the `data-mode` /
`data-theme` pair on `<html>`, the `m='paper'` fallback in the `<head>` script,
the fallback in `wireChrome()`, and the `aria-pressed` on the two toggle
buttons. `<meta name="theme-color">` should match the default ground's `--bg`.

**`data-mode` and `data-theme` must always be written together.** One without
the other is a broken state: the page would take one design's layout and the
other's palette. There is no code path that sets only one; keep it that way.

### Where the mapping lives

```js
// chrome.js, the one source of truth
export const GROUND = { ink: 'sheet', paper: 'spark' };
```

`wireChrome()` sets `documentElement.dataset.mode` **and** `.dataset.theme`
from that table on load and on every toggle click.

It is duplicated in one other place on purpose: the inline `<script>` in the
`<head>` of `index.html` and `blog.html`. That runs before first paint so the
saved choice doesn't flash the wrong design. **Changing the mapping means
editing three places**: `chrome.js` and both `<head>` scripts.

To remap (e.g. spark on dark), change the table values. Both themes carry a
full `ink` and `paper` palette, so any pairing works without touching CSS.

## CSS structure

```
theme.css          @imports both themes + rules shared by both
themes/sheet.css   every rule scoped to html[data-theme="sheet"]
themes/spark.css   every rule scoped to html[data-theme="spark"]
```

Both stylesheets ship in one bundle. They coexist only because **every rule in
a theme file is prefixed with its own `html[data-theme="…"]`**. If you add a
rule to a theme file, it must carry that prefix or it will leak into the other
design. Rules that genuinely belong to both (focus ring, logo masks) go in
`theme.css` unprefixed.

Watch for two traps when scoping:

- `:root` cannot be scoped. `html[data-theme="x"] :root` is a descendant
  selector and matches nothing. Token blocks use `html[data-theme="x"]`.
- Selectors already rooted at `html` take the scope **fused on**
  (`html[data-theme="x"][data-mode="ink"]`), never nested.

### Token contract

Both themes must define all of these, or the shared rules and the matrix rain
break: `--bg --panel --mass --ink --dim --faint --faint2 --line --line2
--spot --spot-ink --grid --disp --body --mono --gut`.

Anything reading colour outside a theme file (the intro rain in `matrix.js`,
the focus ring in `theme.css`) reads these variables, which is why it
recolours per design for free.

## Markup is shared

`index.html` and `blog.html` are written once and styled by both designs. The
same class names (`.nav .hero .strip .stat .marks .rows > .row .prose .foot`)
carry both looks.

**Don't add design-specific markup.** If one design needs an element the other
doesn't, express it in CSS. Spark's stickers are `::after` content with emoji
for exactly this reason: sheet simply never declares them, and the HTML stays
neutral.

## JS

- `chrome.js` - ground/design toggle + mobile sheet. Shared by both pages.
- `main.js` - profile page: intro rain, live stats, copy button.
- `blog.js` - blog: loads `posts/*.md` via `import.meta.glob`, hash routing.
- `matrix.js` - Tamil matrix rain. Intro overlay only, ~1.9s, then removed.
  Returns a `stop()`; call it or the rAF loop keeps painting into a detached canvas.

Gotchas that have already bitten:

- `import.meta.glob` on `.md` **needs `query: '?raw'`**, or rollup parses the
  markdown as JavaScript and the build fails.
- Sort posts on the `Date`, not the formatted string.
- Row stickers and number colours cycle on `nth-child(4n + …)` so a blog list
  of any length stays consistent.

## Assets

`assets/logos/` holds the employer marks, rendered as CSS masks in
`currentColor` so they follow the active design. Sizes are per logo in
`theme.css`. Anything under 4KB gets inlined as a data URI by vite; that's
expected.

## Checks

`npm run build` must pass. There are no tests; verify visually in **both**
grounds, since switching ground now switches the whole design.

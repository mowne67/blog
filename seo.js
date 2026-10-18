// Build-time SEO work for the profile and blog: a real page per post at
// /blog/<slug>, the post list rendered into blog.html, and the sitemap.
// Wired up in vite.config.js; the dev server serves the same pages through
// configureServer, because generateBundle only runs for a build.
//
// The pages are written from the blog's markdown, so the shell (nav, sheet,
// footer, head) is read out of blog.html rather than duplicated here: if the
// chrome changes, these pages change with it.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import fm from 'front-matter';
import { marked } from 'marked';

const SITE = 'https://mowne.co.in';
const NAME = 'Mownetharan';
const HANDLE = 'Mowne';
const EMAIL = 'mownetharan@gmail.com';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FONTS = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&display=swap';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATED = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// JSON inside a <script> must not be able to close it, whatever a post says
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const truncate = (s, max, tail) => (s.length > max ? s.slice(0, max).replace(/\s\S*$/, '') + tail : s);

// the first real paragraph, minus fences, headings and inline markup
function openingParagraph(body) {
  const para =
    body
      .replace(/```[\s\S]*?```/g, '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith('#')) || '';
  return para.replace(/[*_`>#\[\]]/g, '').replace(/\s+/g, ' ');
}

// "2026-10-04" -> "04 Oct 2026", without a Date, so the build machine's
// timezone cannot shift the day
function displayDate(day) {
  const [y, m, d] = day.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    throw new Error(`seo.js: "${day}" is not a real date`);
  }
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

function readPosts(dir) {
  const seen = new Map();
  const posts = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8');
      const { attributes: a, body } = fm(raw);
      const base = file.replace(/\.md$/, '');
      const slug = (DATED.exec(base)?.[2] ?? base).toLowerCase();
      if (!SLUG.test(slug)) throw new Error(`seo.js: "${base}.md" needs a slug of a-z, 0-9 and dashes`);
      if (!a.title) throw new Error(`seo.js: "${base}.md" has no title`);
      if (seen.has(slug)) throw new Error(`seo.js: "${base}.md" collides with "${seen.get(slug)}.md" on /blog/${slug}`);
      seen.set(slug, base);

      const date = a.date ? String(a.date) : null;
      const day = date?.slice(0, 10) ?? null;
      if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(date))) {
        throw new Error(`seo.js: "${base}.md" needs a date like 2026-10-04 or an ISO timestamp`);
      }
      const updated = a.updated ? String(a.updated) : null;
      if (updated && Number.isNaN(Date.parse(updated))) throw new Error(`seo.js: "${base}.md" has an unreadable updated date`);

      const opening = openingParagraph(body);
      const tags = Array.isArray(a.tags) ? a.tags.map(String) : [];
      return {
        base,
        slug,
        title: String(a.title),
        date,
        day,
        updated,
        updatedDay: updated?.slice(0, 10) ?? null,
        display: displayDate(day),
        tags,
        description: String(a.description || truncate(opening, 155, '…')),
        excerpt: truncate(opening, 190, '…'),
        html: marked.parse(body),
      };
    });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ── the list page's rows, same markup blog.js used to build at runtime ──
function listRows(posts) {
  return posts
    .map(
      (post, i) => `
      <a class="row" href="/blog/${post.slug}">
        <div class="n">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h3>${esc(post.title)}<span class="arw">&#8594;</span></h3>
          <p>${esc(post.excerpt)}</p>
        </div>
        <div class="ev">
          <div class="ev-row"><span>published</span><b>${esc(post.display)}</b></div>
          ${post.tags.length ? `<div class="ev-row"><span>tags</span><b>${esc(post.tags.join(' · '))}</b></div>` : ''}
        </div>
      </a>`
    )
    .join('');
}

const listCount = (posts) => `${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}`;

// ── the shell, read out of blog.html so the two cannot drift apart ──
function chromeOf(source) {
  const nav = source.match(/<nav class="nav over">[\s\S]*?<\/nav>/);
  const sheet = source.match(/<div class="sheet"[^>]*>[\s\S]*?<\/div>/);
  const foot = source.match(/<footer class="foot">[\s\S]*?<\/footer>/);
  if (!nav || !sheet || !foot) throw new Error('seo.js: nav, sheet or footer missing from blog.html');
  // .over is for sitting on the hero sky; a post has no sky and no sky.js to
  // drop the class, so the nav stays solid
  const solid = nav[0].replace('class="nav over"', 'class="nav"');
  if (solid === nav[0]) throw new Error('seo.js: blog.html\'s nav is not the .over variant');
  // these pages live one directory down, so the shell's page links must be rooted
  const shell = `${nav[0]}${sheet[0]}${foot[0]}`;
  if (/href="\.\//.test(shell)) throw new Error('seo.js: blog.html uses relative page links; a post page needs them rooted (/ and /blog)');
  return { nav: solid, sheet: sheet[0], foot: foot[0] };
}

function postPage(post, { css, js, chrome }) {
  const url = `${SITE}/blog/${post.slug}`;
  const byline = [
    `<a href="/">${NAME}</a>`,
    `<time datetime="${esc(post.day)}">${esc(post.display)}</time>`,
    ...post.tags.map((t) => esc(t)),
  ].join(' · ');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.updated ? { dateModified: post.updated } : {}),
    author: { '@type': 'Person', '@id': `${SITE}/#person`, name: NAME, url: `${SITE}/` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(post.tags.length ? { keywords: post.tags.join(', ') } : {}),
    inLanguage: 'en',
  };
  return `<!DOCTYPE html>
<html lang="en" data-mode="paper">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(post.description)}" />
  <meta name="theme-color" content="#f5f5f2" />
  <meta name="author" content="${NAME}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <title>${esc(post.title)} · ${NAME}</title>
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="${HANDLE}" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:title" content="${esc(post.title)}" />
  <meta property="og:description" content="${esc(post.description)}" />
  <meta property="og:image" content="${SITE}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(post.title)}" />
  <meta property="article:published_time" content="${esc(post.date)}" />
  ${post.tags.map((t) => `<meta property="article:tag" content="${esc(t)}" />`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(post.title)}" />
  <meta name="twitter:description" content="${esc(post.description)}" />
  <meta name="twitter:image" content="${SITE}/og.png" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS}" />
${css.map((href) => `  <link rel="stylesheet" href="${href}" />`).join('\n')}
  <!-- inline so the chosen ground is applied before first paint -->
  <script>var m;try{m=localStorage.getItem('ground')}catch(e){}document.documentElement.dataset.mode=m==='ink'||(m!=='paper'&&matchMedia('(prefers-color-scheme: dark)').matches)?'ink':'paper';document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()</script>
  <script type="application/ld+json">${json(ld)}</script>
  <script type="module" src="${js}" defer></script>
</head>
<body>
  <div class="frame">
${chrome.nav}
${chrome.sheet}

    <article class="article">
      <a class="back" href="/blog">&#8592; all posts</a>
      <h1 class="title">${esc(post.title)}</h1>
      <div class="byline">${byline}</div>
      <div class="prose">${post.html}</div>
      <p class="end">Written by <a href="/">${NAME}</a>. <a href="mailto:${EMAIL}">Email</a> · <a href="/#chat">Book a chat</a></p>
    </article>

${chrome.foot}
  </div>
</body>
</html>
`;
}

function sitemap(posts) {
  const urls = [
    `  <url><loc>${SITE}/</loc></url>`,
    `  <url><loc>${SITE}/blog</loc></url>`,
    ...posts.map(
      (p) => `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.updatedDay ?? p.day}</lastmod></url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export default function seo({ root = process.cwd() } = {}) {
  const postsDir = join(root, 'posts');
  const blogPath = join(root, 'blog.html');
  let cache = null;
  const posts = () => (cache ??= readPosts(postsDir));
  const chrome = () => chromeOf(readFileSync(blogPath, 'utf8'));

  return {
    name: 'mowne-seo',
    // after Vite's own plugins, so the emitted stylesheet and chunk names are
    // in the bundle by the time a post page is written
    enforce: 'post',

    // the list is rendered into blog.html for both the dev server and a build
    transformIndexHtml(html) {
      if (!html.includes('id="post-list"')) return html;
      const all = posts();
      const rows = html
        .replace('<div class="rows" id="post-list"></div>', `<div class="rows" id="post-list">${listRows(all)}</div>`)
        .replace('<span class="r" id="post-count"></span>', `<span class="r" id="post-count">${listCount(all)}</span>`);
      if (rows === html) throw new Error('seo.js: could not find the post list in blog.html');
      // the URLs these posts had while they were #fragments
      const legacy = Object.fromEntries(all.filter((p) => p.base !== p.slug).map((p) => [p.base, `/blog/${p.slug}`]));
      return rows.replace(
        '</body>',
        `  <script type="application/json" id="legacy-posts">${json(legacy)}</script>\n</body>`
      );
    },

    // generateBundle does not run for the dev server, so the same pages are
    // served here from source
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const [path, query] = (req.url || '').split('?');
        const clean = decodeURIComponent(path).replace(/\/+$/, '') || '/';
        // /blog is the page; without this Vite resolves it to blog.js
        if (clean === '/blog') {
          req.url = `/blog.html${query ? `?${query}` : ''}`;
          return next();
        }
        const slug = /^\/blog\/([^/]+)$/.exec(clean)?.[1];
        if (!slug) return next();
        const post = posts().find((p) => p.slug === slug);
        if (!post) return next();
        try {
          // ?direct is how a stylesheet is asked for in dev; without it Vite
          // hands back the CSS as a JS module
          const html = postPage(post, { css: ['/theme.css?direct'], js: '/post.js', chrome: chrome() });
          const out = await server.transformIndexHtml(req.url, html);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(out);
        } catch (err) {
          next(err);
        }
      });
      // a new or edited post: drop the cache, then let the browser reload
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(postsDir)) return;
        cache = null;
        server.ws.send({ type: 'full-reload' });
      });
    },

    generateBundle(_options, bundle) {
      const css = Object.values(bundle)
        .filter((f) => f.type === 'asset' && f.fileName.endsWith('.css'))
        .map((f) => `/${f.fileName}`);
      const chunk = Object.values(bundle).find((f) => f.type === 'chunk' && f.isEntry && f.name === 'post');
      if (!css.length) throw new Error('seo.js: no stylesheet in the bundle to link from a post page');
      if (!chunk) throw new Error('seo.js: post.js is not a build entry (see vite.config.js)');

      for (const post of posts()) {
        this.emitFile({
          type: 'asset',
          fileName: `blog/${post.slug}.html`,
          source: postPage(post, { css, js: `/${chunk.fileName}`, chrome: chrome() }),
        });
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(posts()) });
    },
  };
}

import { marked } from 'marked';
import fm from 'front-matter';
import { wireChrome } from './chrome.js';

const postModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default' });

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// First real paragraph, minus fences, headings and inline markup — enough for a row.
function excerpt(body) {
  const para = body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#')) || '';
  const flat = para.replace(/[*_`>#\[\]]/g, '').replace(/\s+/g, ' ');
  return flat.length > 190 ? flat.slice(0, 190).replace(/\s\S*$/, '') + '…' : flat;
}

async function loadPosts() {
  const posts = await Promise.all(
    Object.entries(postModules).map(async ([path, load]) => {
      const { attributes, body } = fm(await load());
      const slug = path.split('/').pop().replace('.md', '');
      // keep the Date object for sorting; formatting it first made the sort
      // compare locale strings, which only happened to work for some formats
      const when = attributes.date ? new Date(attributes.date) : null;
      return {
        slug,
        when,
        title: attributes.title || slug,
        date: when ? DATE_FMT.format(when) : 'undated',
        tags: attributes.tags || [],
        body,
        excerpt: excerpt(body),
      };
    })
  );
  return posts.sort((a, b) => (b.when ?? 0) - (a.when ?? 0));
}

document.addEventListener('DOMContentLoaded', async () => {
  wireChrome();

  const blogView = document.getElementById('blog-view');
  const postView = document.getElementById('post-view');
  const postList = document.getElementById('post-list');
  const posts = await loadPosts();

  document.getElementById('post-count').textContent =
    `${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}`;

  postList.innerHTML = posts
    .map(
      (post, i) => `
      <a class="row" href="#${post.slug}">
        <div class="n">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h3>${post.title}<span class="arw">&#8594;</span></h3>
          <p>${post.excerpt}</p>
        </div>
        <div class="ev">
          <div class="ev-row"><span>published</span><b>${post.date}</b></div>
          ${post.tags.length ? `<div class="ev-row"><span>tags</span><b>${post.tags.join(' · ')}</b></div>` : ''}
        </div>
      </a>`
    )
    .join('');

  function render() {
    const slug = location.hash.slice(1);
    const post = slug && posts.find((p) => p.slug === slug);
    blogView.hidden = !!post;
    postView.hidden = !post;
    if (!post) return;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-byline').textContent =
      [post.date, ...post.tags].join(' · ');
    document.getElementById('post-content').innerHTML = marked(post.body);
    window.scrollTo(0, 0);
  }

  // one renderer, driven by the hash — clicks are plain links, back works for free
  addEventListener('hashchange', render);
  document.getElementById('back-btn').addEventListener('click', () => {
    history.pushState(null, '', location.pathname);
    render();
  });
  render();
});

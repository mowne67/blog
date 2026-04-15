import { marked } from 'marked';
import fm from 'front-matter';

// Extract all markdown posts dynamically
const postModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default' });

async function loadPosts() {
  const posts = [];
  for (const path in postModules) {
    const rawMarkdown = await postModules[path]();
    const content = fm(rawMarkdown);
    // Parse slug from filename
    const slug = path.split('/').pop().replace('.md', '');
    posts.push({
      slug,
      title: content.attributes.title || slug,
      date: content.attributes.date ? new Date(content.attributes.date).toLocaleDateString() : 'Unknown Date',
      tags: content.attributes.tags || [],
      body: content.body,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function runMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const letters = 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறனABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 14;

  let columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops.length = columns;
    drops.fill(1);
  });

  function draw() {
    ctx.fillStyle = 'rgba(22, 22, 22, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillStyle = drops[i] === 1 ? '#7dff7d' : '#20C20E';
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 40);
}

document.addEventListener('DOMContentLoaded', async () => {
  runMatrix();

  const blogView = document.getElementById('blog-view');
  const postView = document.getElementById('post-view');
  const postList = document.getElementById('post-list');
  const postContent = document.getElementById('post-content');
  const backBtn = document.getElementById('back-btn');

  const posts = await loadPosts();

  function renderPostList() {
    postList.innerHTML = '';
    posts.forEach((post, index) => {
      const li = document.createElement('li');
      li.className = 'post-item';
      li.style.animation = `fadeInUp 0.4s ease forwards`;
      li.style.animationDelay = `${index * 0.1}s`;
      li.style.opacity = '0';
      li.style.transform = 'translateY(10px)';

      const tagDisplay = post.tags.join(' · ');

      li.innerHTML = `
        <span class="post-num">${String(index + 1).padStart(2, '0')}</span>
        <a class="post-title" href="#${post.slug}">${post.title}</a>
        <span class="post-tag">${tagDisplay}</span>
        <span class="post-date">${post.date}</span>
      `;
      
      li.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', `#${post.slug}`);
        showPost(post.slug);
      });
      
      postList.appendChild(li);
    });
  }

  function triggerCRT() {
    const wrap = document.querySelector('.blog-wrap');
    if (wrap) {
      wrap.style.animation = 'none';
      void wrap.offsetHeight;
      wrap.style.animation = null;
    }
  }

  function showPost(slug) {
    const post = posts.find(p => p.slug === slug);
    if (!post) return;
    
    triggerCRT();
    blogView.style.display = 'none';
    postView.style.display = 'block';
    
    // Parse markdown to HTML
    postContent.innerHTML = marked(post.body);
    
    // Add title nicely
    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="color: var(--primary-light); font-size: 2rem; margin-bottom: 0.5rem;">${post.title}</h1>
      <p style="color: var(--text-muted); border-bottom: 1px dashed var(--terminal-border); padding-bottom: 1rem; margin-bottom: 2rem;">
        Posted on ${post.date}
      </p>
    `;
    postContent.insertBefore(header, postContent.firstChild);
  }

  function showList() {
    triggerCRT();
    blogView.style.display = 'block';
    postView.style.display = 'none';
    history.pushState(null, '', window.location.pathname);
  }

  backBtn.addEventListener('click', showList);

  renderPostList();

  // Handle direct loads to a hash URL
  if (window.location.hash) {
    const slug = window.location.hash.substring(1);
    showPost(slug);
  }

  // Handle browser back button
  window.addEventListener('popstate', () => {
    if (window.location.hash) {
      showPost(window.location.hash.substring(1));
    } else {
      showList();
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .markdown-body {
      line-height: 1.6;
      font-size: 1.1rem;
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3 {
      color: var(--primary-light);
      margin-top: 2rem;
    }
    .markdown-body a {
      color: var(--accent);
      text-decoration: underline;
    }
    .markdown-body code {
      background: rgba(0,255,0,0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }
    .markdown-body pre {
      background: rgba(0,255,0,0.05);
      border: 1px dashed var(--primary);
      padding: 1rem;
      overflow-x: auto;
    }
    .markdown-body blockquote {
      border-left: 3px solid var(--primary);
      margin-left: 0;
      padding-left: 1rem;
      color: var(--primary-dark);
    }
    .markdown-body img {
      max-width: 100%;
    }
  `;
  document.head.appendChild(style);
});

import { defineConfig } from 'vite';
import { resolve } from 'path';
import seo from './seo.js';

// base is './' for the other pages, but the 404 page is served at arbitrary
// nested URLs, so its asset URLs must be rooted.
const rootedNotFound = () => ({
  name: 'rooted-404',
  enforce: 'post',
  generateBundle(_, bundle) {
    const f = bundle['404.html'];
    if (f && f.type === 'asset') {
      f.source = String(f.source).replace(/(src|href)="\.\//g, '$1="/');
    }
  }
});

export default defineConfig({
  // Relative asset paths, so a build still loads from a subdirectory. Page
  // links are rooted (/ and /blog): the blog is served from one canonical URL
  // shape on Cloudflare, see seo.js.
  base: './',
  plugins: [seo({ root: __dirname }), rootedNotFound()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        notfound: resolve(__dirname, '404.html'),
        // the only JS a post page needs; seo.js links this build's own chunk
        post: resolve(__dirname, 'post.js')
      }
    }
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';
import seo from './seo.js';

export default defineConfig({
  // Relative asset paths, so a build still loads from a subdirectory. Page
  // links are rooted (/ and /blog): the blog is served from one canonical URL
  // shape on Cloudflare, see seo.js.
  base: './',
  plugins: [seo({ root: __dirname })],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        // the only JS a post page needs; seo.js links this build's own chunk
        post: resolve(__dirname, 'post.js')
      }
    }
  }
});

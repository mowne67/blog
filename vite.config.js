import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Setting base to relative path ensures assets load correctly regardless of GitHub repo name
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        about: resolve(__dirname, 'about.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});

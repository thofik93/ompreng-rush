import { defineConfig } from 'vite';

export default defineConfig({
  // relative asset paths, so the build works under GitHub Pages' /ompreng-rush/ and any other folder
  base: './',
  build: {
    // Phaser alone is ~1.2 MB; keep it in its own cached chunk
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: { manualChunks: { phaser: ['phaser'] } }
    }
  }
});

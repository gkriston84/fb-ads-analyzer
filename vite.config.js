import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
    plugins: [crx({ manifest })],
    build: {
        minify: true,
        cssMinify: true,
        rollupOptions: {
            input: {
                popup: 'src/popup.html',
                injected: 'src/injected.js',
                visualizer: 'src/visualizer.js'
            },
            output: {
                entryFileNames: 'src/[name].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    }
});

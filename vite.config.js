import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig(({ mode }) => ({
    plugins: [crx({ manifest })],
    build: {
        minify: mode === 'development' ? false : true,
        cssMinify: mode === 'development' ? false : true,
        sourcemap: mode === 'development' ? 'inline' : false,
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
}));

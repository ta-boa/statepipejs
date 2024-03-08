import { defineConfig } from 'vite'
import commonjs from '@rollup/plugin-commonjs'
import { resolve } from 'path'

export default defineConfig({
    server: {
        open: 'site/index.html',
    },
    buildLibrary: {
        target: 'esnext',
        minify: 'esbuild',
        outDir: 'library/dist',
        emptyOutDir: true,
        polyfillModulePreload: true,
        lib: {
            entry: resolve(__dirname, './library/statepipe.ts'),
            name: 'statepipe',
        },
        rollupOptions: [commonjs()],
    },
})

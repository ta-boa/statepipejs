import { defineConfig } from 'vite'
import commonjs from '@rollup/plugin-commonjs'
import { resolve } from 'path'

export default defineConfig({
    build: {
        target: 'esnext',
        minify: 'esbuild',
        outDir: 'dist',
        emptyOutDir: true,
        polyfillModulePreload: true,
        lib: {
            entry: resolve(__dirname, 'src/statepipe.ts'),
            name: 'statepipe',
        },
        rollupOptions: [commonjs()],
    },
})

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        target: 'esnext',
        minify: 'terser',
        outDir: 'library/dist',
        emptyOutDir: true,
        polyfillModulePreload: true,
        lib: {
            entry: resolve('./library/statepipe.ts'),
            name: 'statepipe',
        },
    },
})

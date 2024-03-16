import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'index.ts'),
            name: 'statepipe',
            fileName: 'statepipe',
        },
        target: 'esnext',
        minify: 'esbuild',
        outDir: 'dist',
        emptyOutDir: true,
    },
})

import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { resolve } from 'path'

export default defineConfig({
    server: {
        open: 'index.html',
    },
    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'partials'),
            context: {
                title: 'statepipe',
            },
        }),
    ],
})

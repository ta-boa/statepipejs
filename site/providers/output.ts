import { OutputFunction } from '../statepipe.types'

export default {
    text: ({ node, state }) => {
        if (state.value !== undefined) {
            node.textContent = JSON.stringify(state.value);
        }
    },
    remove: ({ node }) => {
        node.parentElement?.removeChild(node)
    },
    template: ({ node, args }) => {
        const tpl = node.querySelector("template")
        const [renderTarget] = args
        let target = node;
        if (tpl) {
            if (renderTarget) {
                target = node.querySelector(renderTarget) || node
            }
            target.appendChild(tpl.content.cloneNode(true))
        }
    }
} as Record<string, OutputFunction>

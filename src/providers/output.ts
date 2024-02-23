import { OutputFunction, StateSchema } from '../statepipe.types'

export default {
    text: (_: any) => (node: HTMLElement, state: StateSchema) => {
        if (node.textContent !== state) {
            node.textContent = state
        }
        return state
    },
} as Record<string, OutputFunction>

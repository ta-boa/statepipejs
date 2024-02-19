import { OutputFunction, State } from '../statepipe.types'

export default {
    text: (_: any) => (node: HTMLElement, state: State) => {
        if (node.textContent !== state) {
            node.textContent = state
        }
        return state
    },
} as Record<string, OutputFunction>

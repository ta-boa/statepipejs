import { OutputFunction, StateSchema } from '../statepipe.types'

export default {
    text: (_: any) => (node: HTMLElement, state: StateSchema) => {
        if (state.value !== undefined){
            node.textContent = JSON.stringify(state.value);
        }
        return state
    },
} as Record<string, OutputFunction>

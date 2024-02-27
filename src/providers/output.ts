import { OutputFunction } from '../statepipe.types'

export default {
    text: ({node, state}) => {
        if (state.value !== undefined){
            node.textContent = JSON.stringify(state.value);
        }
        return state
    },
} as Record<string, OutputFunction>

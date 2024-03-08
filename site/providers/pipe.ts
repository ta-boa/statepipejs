import { PipeFunction } from '../statepipe.types'

export default {
    inc: ({ state, args }) => {
        const num = Number(args[0] || 1)
        if (state && typeof state.value === "number" && isNaN(num) === false) {
            state.value = state.value + num;
        }
        return state
    },
    pick: ({ payload }) => {
        return payload
    }
} as Record<string, PipeFunction>

import { PipeFunction, StateSchema } from '../statepipe.types'

export default {
    inc: (arg: string) => {
        const num = Number(arg || 1)
        return (_, state: StateSchema) => {
            if (state && typeof state.value === "number" && isNaN(num) === false) {
                state.value = state.value + num;
            }
            return state
        }
    },
    pick: () => (payload: StateSchema) => {
        return payload
    }
} as Record<string, PipeFunction>

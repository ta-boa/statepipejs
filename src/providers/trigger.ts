import { StateSchema, TriggerFunction } from '../statepipe.types'

export default {
    preventDefault: () => (event: Event, state: StateSchema) => {
        event.preventDefault()
        return state
    },
    stopPropagation: () => (event: Event, state: StateSchema) => {
        event.stopPropagation()
        return state
    },
    min: (arg: string) => {
        const num = Number(arg || 0)
        return (event: Event, state: StateSchema) => {
            if (state && typeof state.value === "number" && isNaN(num) === false) {
                state.value =  Math.min(state.value , num)
            }
            return state
        }
    },
    max: (arg: string) => {
        const num = Number(arg || 0)
        return (event: Event, state: StateSchema) => {
            if (state && typeof state.value === "number" && isNaN(num) === false) {
                state.value =  Math.max(state.value , num)
            }
            return state
        }
    },
    inc: (arg: string) => {
        const num = Number(arg || 1)
        return (event: Event, state: StateSchema) => {
            if (state && typeof state.value === "number" && isNaN(num) === false) {
                state.value =  state.value + num;
            }
            return state
        }
    },
    dec: (arg: string) => {
        const toInc = Number(arg || 1)
        return (event: Event, state: StateSchema) => {
            if (state && typeof state.value === "number" && isNaN(toInc) === false) {
                state.value = state.value - toInc;
            }
            return state
        }
    }
} as Record<string, TriggerFunction>

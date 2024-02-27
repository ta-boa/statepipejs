import { StateSchema, TriggerFunction } from '../statepipe.types'

export default {
    preventDefault: ({ event, payload }) => {
        event.preventDefault()
        return payload
    },
    stopPropagation: ({ event, payload }) => {
        event.stopPropagation()
        return payload
    },
    min: ({ payload, args }) => {
        const num = Number(args[0] || 0)
        if (payload && typeof payload.value === "number" && isNaN(num) === false) {
            payload.value = Math.min(payload.value, num)
        }
        return payload
    },
    max: ({ payload, args }) => {
        const num = Number(args || 0)
        if (payload && typeof payload.value === "number" && isNaN(num) === false) {
            payload.value = Math.max(payload.value, num)
        }
        return payload
    },
    inc: ({ args, payload }) => {
        const num = Number(args[0] || 1)
        if (payload && typeof payload.value === "number" && isNaN(num) === false) {
            payload.value = payload.value + num;
        }
        return payload
    },
    dec: ({ payload, args }) => {
        const toInc = Number(args[0] || 1)
        if (payload && typeof payload.value === "number" && isNaN(toInc) === false) {
            payload.value = payload.value - toInc;
        }
        return payload

    }
} as Record<string, TriggerFunction>

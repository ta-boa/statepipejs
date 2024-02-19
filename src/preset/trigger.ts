import { State, TriggerFunction } from '../statepipe.types'

export default {
    preventDefault: (_: any) => (event: Event, state: State) => {
        event.preventDefault()
        return [event, state]
    },
    stopPropagation: (_: any) => (event: Event, state: State) => {
        event.stopPropagation()
        return [event, state]
    },
    min: (args: any) => (event: Event, state: State) => {
        const asNumber = Number(args)
        if (isNaN(asNumber)) {
            return [event, state]
        }
        return [event, Math.min(asNumber, state)]
    },
    max: (args: any) => (event: Event, state: State) => {
        const asNumber = Number(args)
        if (isNaN(asNumber)) {
            return [event, state]
        }
        return [event, Math.max(asNumber, state)]
    },
    inc: (args: any = 1) => {
        args = Array.isArray(args) && args.length === 0 ? 1 : args
        return (event: Event, state: State) => {
            return [event, state + Number(args)]
        }
    },
    dec: (args: any = 1) => {
        args = Array.isArray(args) && args.length === 0 ? 1 : args
        return (event: Event, state: State) => {
            return [event, state - Number(args)]
        }
    },
} as Record<string, TriggerFunction>

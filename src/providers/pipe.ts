import { PipeFunction, StateSchema } from '../statepipe.types'

export default {
    inc:
        (args: any = 1) =>
        (payload: StateSchema, state: StateSchema): number => {
            if (typeof state === 'number') {
                return state + Number(args)
            }
            return state
        },
    dec:
        (args: any = 1) =>
        (payload: StateSchema, state: StateSchema): any => {
            if (typeof state === 'number') state -= Number(args)
            return state
        },
    pick: (args: any) => (payload: StateSchema, state: StateSchema) => {
        if (args === 'payload') {
            return payload
        }
        return state
    },
} as Record<string, PipeFunction>

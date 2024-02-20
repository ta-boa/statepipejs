import { PipeFunction, State } from '../statepipe.types'

export default {
    inc:
        (args: any = 1) =>
        (payload: State, state: State): number => {
            if (typeof state === 'number') {
                return state + Number(args)
            }
            return state
        },
    dec:
        (args: any = 1) =>
        (payload: State, state: State): any => {
            if (typeof state === 'number') state -= Number(args)
            return state
        },
    pick: (args: any) => (payload: State, state: State) => {
        if (args === 'payload') {
            return payload
        }
        return state
    },
} as Record<string, PipeFunction>

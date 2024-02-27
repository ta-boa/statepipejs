import { OutputFunction, StateReducer, StateSchema } from "../statepipe.types"

/**
 * Run through all reducers using state to update the view
 */
export default (
    node: HTMLElement,
    state: StateSchema,
    reducers: StateReducer[],
    providers: Record<string, OutputFunction>,
) => {
    if (!reducers) {
        return
    }
    reducers
        .filter((fn) => fn.name in providers)
        .forEach((fn: StateReducer) => {
            providers[fn.name]({ node, state, args: fn.args })
        })

}
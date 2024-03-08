import { StateReducer, StateSchema, TriggerFunction } from "../statepipe.types"

interface Props {
    event: Event,
    state: StateSchema,
    reducers: StateReducer[],
    providers: Record<string, TriggerFunction>
}

/**
 * Reduce state into a new payload
 */
export default async (props: Props) => {
    const { event, state, reducers, providers } = props
    const withFunction = reducers.filter((fn) => fn.name in providers)
    let payload: StateSchema | undefined = { ...state }
    for (const reducer of withFunction) {
        if (payload) {
            const providerFn = providers[reducer.name]
            const partial = providerFn({ event, payload, args: reducer.args })
            if (partial instanceof Promise) {
                payload = await partial
            } else {
                payload = partial
            }
        }
    }
    return payload
}
import { PipeFunction, StateReducer, StateSchema } from "../statepipe.types"

interface Props {
    node: HTMLElement,
    payload: StateSchema,
    state: StateSchema,
    reducers: StateReducer[],
    providers: Record<string, PipeFunction>
}

export default async (props: Props) => {
    const { node, payload, state, reducers, providers } = props
    const withProvider = reducers.filter((fn) => fn.name in providers)
    let newState: StateSchema | undefined = { ...state }
    for (const reducer of withProvider) {
        // Returning undefined means EOL
        if (newState) {
            const providerFn = providers[reducer.name]
            const partial = providerFn({ payload, state: newState, node, args: reducer.args })
            if (partial instanceof Promise) {
                newState = await partial
            } else {
                newState = partial
            }

        }
    }
    return newState;
}
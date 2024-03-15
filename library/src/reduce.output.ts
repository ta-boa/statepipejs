import { OutputFunction, StateReducer, StateSchema } from "./statepipe.types"

interface Props {
    node: HTMLElement,
    state: StateSchema,
    reducers: StateReducer[],
    providers: Record<string, OutputFunction>,
}

/**
 * Run through all reducers using state to update the view
 */
export default async (props: Props) => {
    const { node, state, reducers, providers } = props
    const withProvider = reducers.filter((reducer) => reducer.name in providers)
    for (const reducer of withProvider) {
        const providerFn = providers[reducer.name]
        const partial = providerFn({ node, state, args: reducer.args })
        if (partial instanceof Promise) {
            await partial
        }
    }
}
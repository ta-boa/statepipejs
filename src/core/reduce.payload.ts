import { StateSchema, Trigger, TriggerFunction } from "../statepipe.types"

/**
 * Reduce state into a new payload
 */
export default async (
    event: Event,
    state: StateSchema,
    trigger: Trigger,
    provider: Record<string, TriggerFunction>
) => {
    let payload: StateSchema | undefined = { ...state }
    const withFunction = trigger.reducers.filter((reducer) => reducer.name in provider)
    for (const reducer of withFunction) {
        if (payload) {
            const providerFn = provider[reducer.name]
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
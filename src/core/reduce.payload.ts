import { StateReducer, StateSchema, Trigger, TriggerFunction } from "../statepipe.types"

/**
 * Reduce state into a new payload
 */
export default (
    event: Event,
    state: StateSchema,
    trigger: Trigger,
    provider: Record<string, TriggerFunction>
) => {
    let payload: StateSchema | undefined = { ...state }
    trigger.reducers
        .filter((reducer) => reducer.name in provider)
        .forEach((reducer: StateReducer) => {
            if (payload) {
                payload = provider[reducer.name]({ event, payload, args: reducer.args })
            }
        })
    return payload
}
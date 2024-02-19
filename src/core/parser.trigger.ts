import { Trigger } from '../statepipe.types'
import { uid } from '../utils'
import parseReducer from './parse.reducer'
/**
 * Expected values
 * open@click
 * open@mouseover,close@mouseout
 * open@click|fn1
 */
export default (triggers: string): Trigger[] => {
    triggers = triggers.trim()
    if (!triggers.length) return []

    // from "a@click,b@click" to ["a@click","b@click"]
    const actions = triggers.split(',')

    return actions
        .map((action) : Trigger | undefined => {
            // from a@click|fn to [a@click,fn]
            const [eventBlock, ...triggerReducers] = action.split('|')

            // from a@click to [a,click]
            const [actionName, eventName] = eventBlock.split('@')

            if (actionName && eventName) {
                return {
                    id: uid(),
                    event: eventName.trim(),
                    action: actionName.trim(),
                    reducers: triggerReducers.map(parseReducer),
                } as Trigger
            }
        })
        .filter((trigger) => !!trigger) as Trigger[]
}

import { Trigger } from '../statepipe.types'
import { uid } from './utils'
import parseReducer from './parse.reducer'
/**
 * Expected values
 * open@click
 * open@mouseover,close@mouseout
 * open@click|fn1
 */
export default (triggers: string, node: HTMLElement): Trigger[] => {
    triggers = triggers.trim()
    if (!triggers.length) return []

    // from "a@click,b@click" to ["a@click","b@click"]
    const actions = triggers.split(',')

    return actions
        .map((action): Trigger | undefined => {
            // the target element to listen events from.
            // by default is the component but can be window, body etc
            let target: Window | HTMLElement | Document = node

            // from a@click|fn to [a@click,fn]
            const [eventBlock, ...triggerReducers] = action.split('|')

            // from a@click to [a,click]
            const [actionName, eventSchema] = eventBlock.split('@')
            let [eventName, ...eventArgs] = eventSchema.split(".")

            // wildcards to change the origin of the listener
            if (eventName.match(/^win|doc|body$/)) {
                target = eventName === "win" ? window : eventName === "doc" ? document : document.body
                eventName = eventArgs.shift() as string
            }

            if (actionName && eventName) {
                return {
                    id: `${eventName}-${uid()}`,
                    event: eventName.trim(),
                    eventArgs,
                    action: actionName.trim(),
                    reducers: triggerReducers.map(parseReducer),
                    target
                } as Trigger
            }
        })
        .filter((trigger) => !!trigger) as Trigger[]
}

import { getDebugLevelFromElement, getLogger, uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import useState from './use.state'
import reducePayload from "./reduce.payload"
import reduceOutput from "./reduce.output"
import reduceState from "./reduce.state"

import {
    type Trigger,
    type ComponentProps,
    type StateSchema,
    type Component,
    LogLevel,
} from '../statepipe.types'

export const createComponent = (props: ComponentProps): Component => {
    const { node, providers, onAction, origin } = props
    const id = uid()
    const listeners = new Map()
    const name = node.dataset.component || id

    // from element
    const logger = getLogger(getDebugLevelFromElement(node, LogLevel.off), `[${origin}:${name}]`)
    const outputReducers = parseOutput(node.dataset.output || '')
    const pipeReducers = parsePipe(node.dataset.pipe || '')
    const triggerReducers = parseTrigger(node.dataset.trigger || '')
    const [state, updateState] = useState(parseState(node.dataset.state || ''), (newState) => {
        logger.log("output state", newState)
        reduceOutput(node, newState, outputReducers, providers.output)
    })

    const pipeState = (action: string, payload: any) => {
        let newState: StateSchema | undefined = undefined
        try {
            newState = reduceState(action, node, payload, state, pipeReducers, providers.pipe)
        } catch (err) {
            logger.error("error reducing state", payload, newState)
        }
        if (newState) {
            logger.log(`| '${action}' state:`, payload)
            updateState(newState)
        }
    }

    const handleEventListener = (trigger: Trigger) => (event: Event) => {
        let payload: StateSchema | undefined
        try {
            payload = reducePayload(event, state, trigger, providers.trigger)
        } catch (err) {
            logger.error(`error creating payload`, err)
        }
        if (payload && typeof onAction === 'function') {
            logger.log(`trigger > ${trigger.action}`, payload)
            onAction(trigger.action, payload)
        }
    }

    const subscribe = () => {
        triggerReducers.forEach((trigger: Trigger) => {
            const handlerId = `${trigger.id}-${trigger.event}-${uid()}`
            if (listeners.has(trigger.id)) {
                return
            }
            const handler = handleEventListener(trigger)
            node.addEventListener(trigger.event, handler)
            logger.log(`listen ${trigger.event}->${trigger.action}`)
            listeners.set(handlerId, handler)
        })
    }

    subscribe()
    logger.log(`created. state:`, state)

    return {
        id,
        pipeState,
    } as Component
}

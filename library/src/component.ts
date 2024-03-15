import { getDebugLevelFromElement, getLogger, uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import useState from './state'
import reducePayload from './reduce.payload'
import reduceOutput from './reduce.output'
import reduceState from './reduce.state'

import {
    type Trigger,
    type ComponentProps,
    type StateSchema,
    type Component,
    LogLevel,
} from './statepipe.types'

export const createComponent = (props: ComponentProps): Component => {
    const { node, providers, onAction, statepipe } = props
    const id = uid()
    const listeners = new Map()
    const name = node.dataset.component ? `${node.dataset.component}.${id}` : id

    // from element
    const logger = getLogger(getDebugLevelFromElement(node, LogLevel.off), `[${statepipe}:${name}]`)
    const outputReducers = parseOutput(node.dataset.output || '')
    const pipeReducers = parsePipe(node.dataset.pipe || '')
    const triggerReducers = parseTrigger(node.dataset.trigger || '', node)

    const [state, updateState] = useState(parseState(node.dataset.state || ''), async (newState) => {
        logger.log("state changed", newState)
        try {
            await reduceOutput({
                node,
                state: newState,
                reducers: outputReducers,
                providers: providers.output
            })
        } catch (err) {
            logger.error("output error", err)
        }
    })

    const pipeState = async (action: string, payload: any) => {
        let newState: StateSchema | undefined = undefined
        const actionToReduce = pipeReducers.find((pipe) => pipe.action === action)
        try {
            if (actionToReduce) {
                newState = await reduceState({
                    node,
                    payload,
                    state,
                    reducers: actionToReduce.reducers,
                    providers: providers.pipe
                })
            }
        } catch (err) {
            logger.error('error reducing state', payload, newState)
        }
        if (newState) {
            logger.log(`pipe '${action}' state:`, newState)
            updateState(newState)
        }
    }

    const handleEventListener = (trigger: Trigger) => async (event: Event) => {
        let payload: StateSchema | undefined
        // handling keyboard events to filter specifics keys
        if (event instanceof KeyboardEvent) {
            const eventKey = event.key.toLocaleLowerCase()
            const [keyToMatch] = trigger.eventArgs
            // check if the trigger is waiting for specific keys
            if (keyToMatch?.length && !eventKey.match(keyToMatch.toLocaleLowerCase())) {
                return
            }
        }
        try {
            payload = await reducePayload({
                event,
                state,
                reducers: trigger.reducers,
                providers: providers.trigger
            })
        } catch (err) {
            logger.error(`error creating payload`, err)
        }
        if (payload && typeof onAction === 'function') {
            logger.log(`trigger > ${trigger.action}`, payload)
            onAction(trigger.action, payload)
        }
    }

    triggerReducers.forEach((trigger) => {
        if (!listeners.has(trigger.id)) {
            const handler = handleEventListener(trigger)
            trigger.target.addEventListener(trigger.event, handler)
            logger.log(`listen ${trigger.event}->${trigger.action} from`)
            listeners.set(trigger.id, handler)
        }
    })

    const dispose = () => {
        triggerReducers.forEach((trigger) => {
            trigger.target.removeEventListener(trigger.event, listeners.get(trigger.id))
        })
        listeners.clear()
        triggerReducers.length =
            pipeReducers.length =
            outputReducers.length = 0
        logger.log("disposed")
    }

    return {
        id,
        pipeState,
        dispose,
        node,
    } as Component
}

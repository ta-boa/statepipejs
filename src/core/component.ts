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
    const triggerReducers = parseTrigger(node.dataset.trigger || '', node)

    const [state, updateState] = useState(parseState(node.dataset.state || ''), async (newState) => {
        await reduceOutput({
            node,
            state: newState,
            reducers: outputReducers,
            providers: providers.output
        })
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
            logger.log(`| '${action}' state:`, payload)
            updateState(newState)
        }
    }

    const handleEventListener = (trigger: Trigger) => async (event: Event) => {
        let payload: StateSchema | undefined
        // handling keyboard events to filter specifics keys
        if (trigger.event.match(/keyup|keydown/) && event instanceof KeyboardEvent) {
            const eventKey = event.key.toLocaleLowerCase()
            const [keyToMatch] = trigger.eventArgs
            if (
                keyToMatch &&
                keyToMatch.length &&
                !eventKey.match(keyToMatch.toLocaleLowerCase())
            ) {
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
            logger.log(`listen ${trigger.event}->${trigger.action} from`, trigger.target)
            listeners.set(trigger.id, handler)
        }
    })

    const dispose = () => {
        triggerReducers.forEach((trigger) => {
            trigger.target.removeEventListener(trigger.event, listeners.get(trigger.id))
        })
        listeners.clear()
        triggerReducers.length = 0
        pipeReducers.length = 0
        outputReducers.length = 0
    }

    return {
        id,
        pipeState,
        dispose,
    } as Component
}

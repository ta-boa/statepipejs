import { getLogger, uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import useState from './use.state'
import {
    type StateReducer,
    type Trigger,
    type Pipe,
    type ComponentProps,
    type StateSchema,
    type Component,
    type TriggerFunction,
    LogLevel,
} from '../statepipe.types'

export const createPayloadFromState = (
    event: Event,
    state: StateSchema,
    trigger: Trigger,
    provider: Record<string, TriggerFunction>
): StateSchema => {
    if (!trigger.reducers.length || !state) return state
    let payload: StateSchema | undefined = { ...state }
    trigger.reducers
        .filter((reducer) => reducer.name in provider)
        .forEach((reducer: StateReducer) => {
            if (!payload) return
            const providerFn = provider[reducer.name]
            const reducePayload = providerFn(...reducer.args)
            payload = reducePayload(event, payload)
        })
    return payload
}

export const createComponent = (props: ComponentProps): Component => {
    const id = uid()
    let logLevel = LogLevel.off

    const { node, providers, onAction, origin } = props
    const name = node.dataset.component || id
    const listeners = new Map()
    const outputs = parseOutput(node.dataset.output || '')
    const pipes = parsePipe(node.dataset.pipe || '')
    const triggers = parseTrigger(node.dataset.trigger || '')
    const stateFromParser = parseState(node.dataset.state || '')
    const defaultState = { value: undefined }

    const [state, updateState] = useState(stateFromParser || defaultState, (newState) => {
        pipeOutput(newState)
    })

    if (node.dataset.debug && node.dataset.debug in LogLevel) {
        logLevel = node.dataset.debug as LogLevel
    }
    const logger = getLogger(logLevel, `[${origin}:${name}]`)

    const pipeOutput = (state: StateSchema) => {
        if (outputs) {
            outputs.forEach((fn: StateReducer) => {
                if (providers.output && fn.name in providers.output) {
                    const toRender = providers.output[fn.name](...(fn.args as [any]))
                    toRender(node, state)
                } else {
                    logger.warn(`[pipe] missing function ${fn.name}`)
                }
            })
        }
    }

    const pipeState = (action: string, payload: any) => {
        const toReduce = pipes.filter((pipe: Pipe) => pipe.action === action)

        const newState = toReduce.reduce(
            (newState: any, pipe: Pipe) => {
                newState = pipe.reducers.reduce((accState, fn: StateReducer) => {
                    if (fn.name in providers.pipe) {
                        const reduceState = providers.pipe[fn.name](...(fn.args as [any]))
                        accState = reduceState(payload, accState)
                    } else {
                        logger.warn(`missing provider.pipe.${fn.name}`)
                    }
                    return accState
                }, newState)
                return newState
            },
            { ...state }
        )

        if (toReduce.length) {
            logger.log(`pipe > '${action}' outcome state >`, payload)
            updateState(newState)
        }
    }

    const handleEventListener = (trigger: Trigger) => (event: Event) => {
        let payload: StateSchema | undefined
        try {
            logger.log(`create payload from state >`, state)
            payload = createPayloadFromState(event, state, trigger, providers.trigger)
        } catch (err) {
            logger.error(`error creating payload`, err)
        }
        if (payload !== undefined && typeof onAction === 'function') {
            logger.log(`fireAction > ${trigger.action}`, payload)
            onAction(id, trigger.action, payload)
        }
    }

    const subscribe = () => {
        triggers.forEach((trigger: Trigger) => {
            const handlerId = `${trigger.id}-${trigger.event}-${uid()}`
            if (listeners.has(trigger.id)) {
                logger.warn(`duplicated trigger`)
                return
            }
            const handler = handleEventListener(trigger)
            node.addEventListener(trigger.event, handler)
            logger.log(`listen ${trigger.event}->${trigger.action}`)
            listeners.set(handlerId, handler)
        })
    }

    subscribe()
    logger.log(`created with state`, state)

    return {
        id,
        pipeState,
    } as Component
}

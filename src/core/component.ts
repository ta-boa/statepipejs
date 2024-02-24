import { uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import useState from './use.state'
import type {
    StateReducer,
    Trigger,
    Pipe,
    ComponentProps,
    StateSchema,
    Component,
    TriggerFunction
} from '../statepipe.types'

export const createPayloadFromState = (
    event: Event,
    state: StateSchema,
    trigger: Trigger,
    provider: Record<string,
        TriggerFunction>
): StateSchema => {
    if (!trigger.reducers.length || !state) return state;
    let payload: StateSchema | undefined = { ...state }
    trigger.reducers
        .filter((reducer) => reducer.name in provider)
        .forEach((reducer: StateReducer) => {
            if (!payload) return
            const providerFn = provider[reducer.name]
            const reducePayload = providerFn(...(reducer.args));
            payload = reducePayload(event, payload);
        })
    return payload
}

export const createComponent = (props: ComponentProps): Component => {
    const { node, providers, onAction, logger } = props

    const id = uid()
    const listeners = new Map()
    const outputs = parseOutput(node.dataset.output || '')
    const pipes = parsePipe(node.dataset.pipe || '')
    const triggers = parseTrigger(node.dataset.trigger || '')
    const stateFromParser = parseState(node.dataset.state || '');
    const defaultState = { value: undefined }
    const [state, updateState] = useState(stateFromParser || defaultState, (newState) => {
        pipeOutput(newState)
    })

    const pipeOutput = (state: StateSchema) => {
        if (outputs) {
            outputs.forEach((fn: StateReducer) => {
                if (providers.output && fn.name in providers.output) {
                    const toRender = providers.output[fn.name](...(fn.args as [any]))
                    toRender(node, state)
                } else {
                    logger.warn(`${id} [pipe] missing function ${fn.name}`)
                }
            })
        }
    }

    const pipeState = (action: string, payload: any) => {
        logger.log(`${id}.component pipe action > ${action}`, payload)
        const toReduce = pipes
            .filter((pipe: Pipe) => pipe.action === action);

        const newState = toReduce.reduce((newState: any, pipe: Pipe) => {
            newState = pipe.reducers.reduce((accState, fn: StateReducer) => {
                if (fn.name in providers.pipe) {
                    const reduceState = providers.pipe[fn.name](...(fn.args as [any]))
                    accState = reduceState(payload, accState)
                    logger.log(`${id}.component pipe action reduce >> ${fn.name}`, accState)
                } else {
                    logger.warn(`${id}.component missing provider.pipe.${fn.name}`)
                }
                return accState
            }, newState)
            return newState
        }, { ...state })

        if (toReduce.length) updateState(newState)

    }

    const aaaaaa =
        (event: Event) => {
            return (newState: StateSchema, fn: StateReducer): StateSchema | undefined => {
                if (!(fn.name in providers.trigger)) {
                    logger.warn(`${id} [action] provider function ${fn.name}`)
                    return undefined
                }
                const reducePayload = providers.trigger[fn.name](...(fn.args as [any]))
                const [_, _state] = reducePayload(event, newState)
                logger.log(`${id}.component payload >> ${fn.name}`, newState)
                newState = _state
                return newState
            }
        }

    const handleEventListener = (trigger: Trigger) => (event: Event) => {
        let payload: StateSchema | undefined;
        try {
            logger.log(`${id}.component payload >`, state)
            payload = trigger.reducers.reduce(aaaaaa(event), { ...state })
        } catch (err) {
            logger.error(`${id}.component error creating payload`, err)
        }
        if (payload !== undefined && typeof onAction === 'function') {
            logger.log(`${id}.component fireAction > ${trigger.action}`, payload)
            onAction(id, trigger.action, payload)
        }
    }

    const subscribe = () => {
        triggers.forEach((trigger: Trigger) => {
            const handlerId = `${trigger.id}-${trigger.event}-${uid()}`
            if (listeners.has(trigger.id)) {
                logger.warn(`component.${id} duplicated trigger`)
                return
            }
            const handler = handleEventListener(trigger)
            node.addEventListener(trigger.event, handler)
            logger.log(`component.${id} listen ${trigger.event}->${trigger.action}`)
            listeners.set(handlerId, handler)
        })
    }

    subscribe()
    logger.log(`component.${id} created with state`, state, typeof state)

    return {
        id,
        pipeState,
    } as Component
}

import { uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import deepEqual from './deep-equal'

import type { Reducer, Trigger, Pipe, ComponentProps, State, Component } from '../statepipe.types'

export const createComponent = (props: ComponentProps): Component => {
    const { node, providers, onAction, logger } = props

    const id = uid()
    const listeners = new Map()
    const outputs = parseOutput(node.dataset.output || '')
    const pipes = parsePipe(node.dataset.pipe || '')
    const triggers = parseTrigger(node.dataset.trigger || '')
    let state = parseState(node.dataset.state || '')

    const pipeOutput = (state: State) => {
        if (outputs) {
            outputs.forEach((fn: Reducer) => {
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
        let potentialChanges = false
        const newState = pipes
            // filter only actions to pipe
            .filter((pipe: Pipe) => pipe.action === action)
            .reduce((newState: any, pipe: Pipe) => {
                potentialChanges = true
                newState = pipe.reducers.reduce((newState, fn: Reducer) => {
                    if (fn.name in providers.pipe) {
                        const updateState = providers.pipe[fn.name](...(fn.args as [any]))
                        newState = updateState(newState, state)
                        logger.log(`${id} [pipe] ${fn.name}(${fn.args.join(',')})`, newState, state)
                    } else {
                        logger.warn(`${id} [pipe] missing function ${fn.name}`)
                    }
                    return newState
                }, newState)
                return newState
            }, payload)

        if (potentialChanges && !deepEqual(state, newState)) {
            state = newState
            pipeOutput(newState)
        }
    }

    const reduceStateForTrigger =
        (event: Event, sendAction = true) =>
        (newState: State, fn: Reducer) => {
            if (!(fn.name in providers.trigger) && sendAction) {
                sendAction = false
                logger.warn(`${id} [action] missing function ${fn.name}`)
                return undefined
            }
            const fireTrigger = providers.trigger[fn.name](...(fn.args as [any]))
            const [_, _state] = fireTrigger(event, newState)
            newState = _state
            return newState
        }

    const handleEventListener = (trigger: Trigger) => (event: Event) => {
        try {
            state = trigger.reducers.reduce(reduceStateForTrigger(event), state)
        } catch (err) {
            logger.error(`${id} [action::error] missing function`, err)
            state = undefined;
        }
        if (state!==undefined && typeof onAction === 'function') {
            logger.log(`component.${id} [trigger] ${trigger.action}`, state)
            // @todo: rename to triggerAction
            onAction(id, trigger.action, state)
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

import { getLogger, uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'
import deepEqual from './deep-equal'

import type { Reducer, Trigger, Pipe, ComponentProps, State, Component } from '../statepipe.types'

export const getComponent = (props: ComponentProps) : Component => {
    const { node, providers, onAction } = props
    const id = uid()
    const logger = getLogger();
    const listeners = new Map()

    let state = parseState(node.dataset.state || '')
    const outputs = parseOutput(node.dataset.output || '')
    const pipes = parsePipe(node.dataset.pipe || '')
    const triggers = parseTrigger(node.dataset.trigger || '')

    const pipeOutput = (state: State) => {
        if (outputs) {
            outputs.forEach((fn: Reducer) => {
                if (providers.output && fn.name in providers.output) {
                    const toRender = providers.output[fn.name].apply(null, fn.args)
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
                        const updateState = providers.pipe[fn.name].apply(null, fn.args)
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

    const pipeAction = (trigger: Trigger) => (event: Event) => {
        if (typeof onAction === 'function') {
            let sendAction = true
            state = trigger.reducers.reduce((newState, fn: Reducer) => {
                if (fn.name in providers.trigger) {
                    const toFire = providers.trigger[fn.name].call(null, fn.args)
                    const [_, _state] = toFire(event, newState)
                    newState = _state
                } else {
                    sendAction = false
                    logger.warn(`${id} [action] missing function ${fn.name}`)
                }
                return newState
            }, state)
            if (sendAction) {
                logger.log(`component.${id} [trigger] ${trigger.action}`, state)
                onAction(id, trigger.action, state)
            }
        }
    }

    const subscribe = () => {
        triggers.forEach((trigger: Trigger) => {
            const handlerId = `${trigger.id}-${trigger.event}-${uid()}`
            if (listeners.has(trigger.id)) {
                logger.warn(`component.${id} duplicated trigger`)
                return
            }
            const handler = pipeAction(trigger)
            node.addEventListener(trigger.event, handler)
            logger.log(`component.${id} listen ${trigger.event}->${trigger.action}`)
            listeners.set(handlerId, handler)
        })
    }

    subscribe();
    logger.log(`component.${id} created with state`, state, typeof state)

    return {
        id,
        pipeState,
    } as Component
}

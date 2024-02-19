import { uid } from './utils'
import parseState from './parse.state'
import parseTrigger from './parser.trigger'
import parseOutput from './parse.output'
import parsePipe from './parse.pipe'

import type { Reducer, Trigger, Pipe, ComponentProps, State } from '../statepipe.types'

export const Component = (props: ComponentProps) => {
    const { node, context, onAction, logger } = props
    const name = node.dataset.component
    const id = uid()
    const listeners = new Map()

    let state = parseState(node.dataset.state || '')
    const outputs = parseOutput(node.dataset.output || '')
    const pipes = parsePipe(node.dataset.pipe || '')
    const triggers = parseTrigger(node.dataset.trigger || '')

    const pipeOutput = (state: State) => {
        if (outputs) {
            outputs.forEach((fn) => {
                if (fn.name in context.outputs) {
                    const toRender = context.outputs[fn.name].apply(null, fn.args)
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
                    if (fn.name in context.pipes) {
                        const updateState = context.pipes[fn.name].apply(null, fn.args)
                        newState = updateState(newState, state)
                        logger.log(`${id} [pipe] ${fn.name}(${fn.args.join(',')})`, newState, state)
                    } else {
                        logger.warn(`${id} [pipe] missing function ${fn.name}`)
                    }
                    return newState
                }, newState)
                return newState
            }, payload)

        if (potentialChanges && !context.deepEqual(state, newState)) {
            state = newState
            pipeOutput(newState)
        }
    }

    const pipeAction = (trigger: Trigger) => (event: Event) => {
        if (typeof onAction === 'function') {
            let sendAction = true
            state = trigger.reducers.reduce((newState, fn: Reducer) => {
                if (fn.name in context.triggers) {
                    const toFire = context.triggers[fn.name].call(null, fn.args)
                    const [_, _state] = toFire(event, newState)
                    newState = _state
                } else {
                    sendAction = false
                    logger.warn(`${id} [action] missing function ${fn.name}`)
                }
                return newState
            }, state)
            if (sendAction) {
                logger.log(`${id} [trigger] ${trigger.action}`, state)
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

    const unsubscribe = () => {}

    subscribe()

    return {
        id,
        name,
        pipeState,
        subscribe,
        //unsubscribe,
    }
}

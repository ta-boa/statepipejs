import { Mock, beforeAll, describe, expect, test, vitest } from 'vitest'
import { Pipe, PipeFunction, StateSchema, Trigger, TriggerFunction } from '../../statepipe.types'
import reducePayload from '../reduce.payload'
import parseTrigger from '../parser.trigger'
import useState from '../state'
import parsePipe from '../parse.pipe'
import reduceState from '../reduce.state'

const node = document.createElement('div')

const reduceToNumber = vitest.fn().mockImplementation(({ state }) => {
    state.value = 10
    return state
})

const reduceToString = vitest.fn().mockImplementation(({ state }) => {
    state.value = 'from reducer'
    return state
})

const reduceToUndefined = vitest.fn().mockImplementation(() => {
    return undefined
})

const text = reduceToString
const ten = reduceToNumber
const stop = reduceToUndefined

const sleep = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    return { value: "zzz" };
}

const providers: Record<string, PipeFunction> = {
    text,
    ten,
    stop,
    sleep,
}

describe('reduceState()', () => {
    let pipe: Pipe,
        handler: Mock,
        state: StateSchema
    
    const payload = { value: "payload" }

    describe('given providers with function', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            pipe = parsePipe('boo->sleep|ten')[0]
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
        })
        test('should wait for the promise before calling the next reducer', async () => {
            console.log("pipe",pipe)
            const result = await reduceState({ node, state, payload, reducers: pipe.reducers, providers })
            expect(result).toStrictEqual({ value: 10 })
        })
    })

    // test('Given action without reducers should return the same state', async () => {
    //     const [trigger] = parseTrigger('add@click', node)
    //     const event = new Event(trigger.event)
    //     const state = { value: 'statepipe' }
    //     const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
    //     expect(newState).toStrictEqual(state)
    // })
    // test('When provider doesnt have the reducer it returns the same state', async () => {
    //     const [trigger] = parseTrigger('add@click|pick', node)
    //     const event = new Event(trigger.event)
    //     const state = { value: 'statepipe' }
    //     const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
    //     expect(newState).toStrictEqual(state)
    // })

    // describe('Given one trigger', () => {
    //     beforeAll(async () => {
    //         vitest.clearAllMocks()
    //         trigger = parseTrigger('add@click|text:foo:bar', node)[0]
    //         event = new Event('click')
    //         handler = vitest.fn()
    //         state = useState({ value: 'statepipe' }, handler)[0]
    //         newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: providers })
    //     })
    //     test('should prepare the text provider with args', () => {
    //         expect(providers.text).toHaveBeenCalledTimes(1)
    //         expect(providers.text).toHaveBeenCalledWith({
    //             payload: { value: 'STATEPIPE' },
    //             event,
    //             args: ['foo', 'bar'],
    //         })
    //     })
    //     test('should return new state', () => {
    //         expect(newState).toStrictEqual({ value: 'STATEPIPE' })
    //     })
    //     test('should not change original state', () => {
    //         expect(handler).not.toHaveBeenCalled()
    //         expect(state).not.toBe(newState)
    //         expect(state.value).not.toBe(newState?.value)
    //     })
    // })

    // describe('Given multiple triggers', () => {
    //     beforeAll(async () => {
    //         vitest.clearAllMocks()
    //         trigger = parseTrigger('add@click|text:foo:bar|ten:10', node)[0]
    //         event = new Event('click')
    //         handler = vitest.fn()
    //         state = useState({ value: 'statepipe' }, handler)[0]
    //         newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
    //     })
    //     test('should prepare the text provider with args', () => {
    //         expect(providers.text).toHaveBeenCalledTimes(1)
    //     })
    //     test('should prepare the ten provider with args', () => {
    //         expect(providers.ten).toHaveBeenCalledTimes(1)
    //         expect(providers.ten).toHaveBeenCalledWith({
    //             payload: { value: 10 },
    //             event,
    //             args: ['10'],
    //         })
    //     })
    //     test('should return new state', () => {
    //         expect(newState).toStrictEqual({ value: 10 })
    //     })
    //     test('should not change original state', () => {
    //         expect(handler).not.toHaveBeenCalled()
    //         expect(state).not.toBe(newState)
    //         expect(state.value).not.toBe(newState?.value)
    //     })
    // })

    // describe('Given trigger that returns undefined', () => {
    //     beforeAll(async () => {
    //         trigger = parseTrigger('add@click|stop', node)[0]
    //         event = new Event('click')
    //         handler = vitest.fn()
    //         state = useState({ value: 'statepipe' }, handler)[0]
    //         newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
    //     })
    //     test('should return new state', () => {
    //         expect(newState).toBe(undefined)
    //     })
    //     test('should not change original state', () => {
    //         expect(handler).not.toHaveBeenCalled()
    //         expect(state.value).toBe('statepipe')
    //     })
    // })
    // describe('Having multiple trigger when first reducer returns undefined the others should not be called', () => {
    //     beforeAll(async () => {
    //         vitest.clearAllMocks()
    //         trigger = parseTrigger('add@click|stop|text', node)[0]
    //         event = new Event('click')
    //         handler = vitest.fn()
    //         state = useState({ value: 'statepipe' }, handler)[0]
    //         newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
    //     })
    //     test('should call first reducer and get undefined state', () => {
    //         expect(newState).toBe(undefined)
    //     })
    //     test('should not call the second reducer', () => {
    //         expect(reduceToString).not.toHaveBeenCalled()
    //     })
    //     test('should not change original state', () => {
    //         expect(handler).not.toHaveBeenCalled()
    //         expect(state.value).toBe('statepipe')
    //     })
    // })

})

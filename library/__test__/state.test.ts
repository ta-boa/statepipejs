import { Mock, beforeAll, describe, expect, test, vitest } from 'vitest'
import { StateSchema, Trigger, TriggerFunction } from '../src/statepipe.types'
import reducePayload from '../src/reduce.payload'
import parseTrigger from '../src/parser.trigger'
import useState from '../src/state'

const node = document.createElement('div')

const reduceToNumber = vitest.fn().mockImplementation(({ payload }) => {
    payload.value = 10
    return payload
})

const reduceToString = vitest.fn().mockImplementation(({ payload }) => {
    payload.value = 'STATEPIPE'
    return payload
})

const reduceToUndefined = vitest.fn().mockImplementation(() => {
    return undefined
})

const banjo = reduceToString
const ten = reduceToNumber
const stop = reduceToUndefined
const sleep = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    return { value: "zzz" };
}

const providers: Record<string, TriggerFunction> = {
    banjo,
    ten,
    stop,
    sleep,
}

describe('reducePayload', () => {
    let trigger: Trigger, event: Event, handler: Mock, state: StateSchema, newState: StateSchema | undefined

    describe('Given funciton as promise', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('boo@click|sleep', node)[0]
            event = new Event('click')
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
        })
        test('should call first reducer and get undefined state', async () => {
            const result = await reducePayload({ event, state, reducers: trigger.reducers, providers })
            expect(result).toStrictEqual({ value: "zzz" })
        })
    })

    test('Given action without reducers should return the same state', async () => {
        const [trigger] = parseTrigger('add@click', node)
        const event = new Event(trigger.event)
        const state = { value: 'statepipe' }
        const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
        expect(newState).toStrictEqual(state)
    })
    test('When provider doesnt have the reducer it returns the same state', async () => {
        const [trigger] = parseTrigger('add@click|pick', node)
        const event = new Event(trigger.event)
        const state = { value: 'statepipe' }
        const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
        expect(newState).toStrictEqual(state)
    })

    describe('Given one trigger', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('add@click|banjo:foo:bar', node)[0]
            event = new Event('click')
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: providers })
        })
        test('should prepare the banjo provider with args', () => {
            expect(providers.banjo).toHaveBeenCalledTimes(1)
            expect(providers.banjo).toHaveBeenCalledWith({
                payload: { value: 'STATEPIPE' },
                event,
                args: ['foo', 'bar'],
            })
        })
        test('should return new state', () => {
            expect(newState).toStrictEqual({ value: 'STATEPIPE' })
        })
        test('should not change original state', () => {
            expect(handler).not.toHaveBeenCalled()
            expect(state).not.toBe(newState)
            expect(state.value).not.toBe(newState?.value)
        })
    })

    describe('Given multiple triggers', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('add@click|banjo:foo:bar|ten:10', node)[0]
            event = new Event('click')
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
        })
        test('should prepare the banjo provider with args', () => {
            expect(providers.banjo).toHaveBeenCalledTimes(1)
        })
        test('should prepare the ten provider with args', () => {
            expect(providers.ten).toHaveBeenCalledTimes(1)
            expect(providers.ten).toHaveBeenCalledWith({
                payload: { value: 10 },
                event,
                args: ['10'],
            })
        })
        test('should return new state', () => {
            expect(newState).toStrictEqual({ value: 10 })
        })
        test('should not change original state', () => {
            expect(handler).not.toHaveBeenCalled()
            expect(state).not.toBe(newState)
            expect(state.value).not.toBe(newState?.value)
        })
    })

    describe('Given trigger that returns undefined', () => {
        beforeAll(async () => {
            trigger = parseTrigger('add@click|stop', node)[0]
            event = new Event('click')
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
        })
        test('should return new state', () => {
            expect(newState).toBe(undefined)
        })
        test('should not change original state', () => {
            expect(handler).not.toHaveBeenCalled()
            expect(state.value).toBe('statepipe')
        })
    })
    describe('Having multiple trigger when first reducer returns undefined the others should not be called', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('add@click|stop|banjo', node)[0]
            event = new Event('click')
            handler = vitest.fn()
            state = useState({ value: 'statepipe' }, handler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
        })
        test('should call first reducer and get undefined state', () => {
            expect(newState).toBe(undefined)
        })
        test('should not call the second reducer', () => {
            expect(reduceToString).not.toHaveBeenCalled()
        })
        test('should not change original state', () => {
            expect(handler).not.toHaveBeenCalled()
            expect(state.value).toBe('statepipe')
        })
    })

})

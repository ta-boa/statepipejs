import { Mock, beforeAll, describe, expect, test, vitest } from 'vitest'
import { StateSchema, Trigger, TriggerFunction } from '../../statepipe.types'
import reducePayload from '../reduce.payload'
import parseTrigger from '../parser.trigger'
import useState from '../state'

const node = document.createElement('div')

const reduceToTen = vitest.fn().mockImplementation(({ payload }) => {
    payload.value = 10
    return payload
})

const reduceDouble = vitest.fn().mockImplementation(({ payload }) => {
    payload.value *= 2
    return payload
})

const reduceToString = vitest.fn().mockImplementation(({ payload }) => {
    payload.value = 'STATEPIPE'
    return payload
})

const reduceToUndefined = vitest.fn().mockImplementation(() => {
    return undefined
})

const reduceMinus5 = vitest.fn().mockImplementation(async ({ payload }) => {
    await new Promise(resolve => setTimeout(resolve, 0));
    return { value: payload.value - 5 };
})

const providers: Record<string, TriggerFunction> = {
    text: reduceToString,
    ten: reduceToTen,
    double: reduceDouble,
    halt: reduceToUndefined,
    minus: reduceMinus5
}

describe('reducePayload()', () => {
    let trigger: Trigger, event: Event, stateChangeHandler: Mock, state: StateSchema, newState: StateSchema | undefined

    test('Given action without reducers should return the same state', async () => {
        const [trigger] = parseTrigger('add@click', node)
        const event = new Event(trigger.event)
        const state = { value: 'statepipe' }
        const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
        expect(newState).toStrictEqual(state)
    })
    test('When reducer without provider should return the same state', async () => {
        const [trigger] = parseTrigger('add@click|pick', node)
        const event = new Event(trigger.event)
        const state = { value: 'statepipe' }
        const newState = await reducePayload({ event, state, reducers: trigger.reducers, providers: {} })
        expect(newState).toStrictEqual(state)
    })

    describe('Given reducers and the expected providers', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('add@click|text:foo:bar|ten:10', node)[0]
            event = new Event('click')
            stateChangeHandler = vitest.fn()
            state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
        })
        test('should call reducers once with expected args', () => {
            expect(providers.text).toHaveBeenCalledTimes(1)
            expect(providers.text).toHaveBeenCalledWith({
                payload: { value: 10 },
                event,
                args: ['foo',"bar"],
            })
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
            expect(stateChangeHandler).not.toHaveBeenCalled()
            expect(state).not.toBe(newState)
            expect(state.value).not.toBe(newState?.value)
        })
    })

    describe('Given reducer that returns undefined', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('add@click|halt|text', node)[0]
            event = new Event('click')
            stateChangeHandler = vitest.fn()
            state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
            newState = await reducePayload({ event, state, reducers: trigger.reducers, providers })
        })
        test('should return undefined', () => {
            expect(newState).toBe(undefined)
        })
        test('should not change original state', () => {
            expect(stateChangeHandler).not.toHaveBeenCalled()
            expect(state.value).toBe('statepipe')
        })
        test('should not call the next reducer after the changing the new state to undefined', () => {
            expect(reduceToString).not.toHaveBeenCalled()
        })
    })

    describe('Given async reducers', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            trigger = parseTrigger('boo@click|double|minus', node)[0]
            event = new Event('click')
            stateChangeHandler = vitest.fn()
            state = useState({ value: 10 }, stateChangeHandler)[0]
        })
        test('should wait for the promise to resolve before calling next reducer', async () => {
            const result = await reducePayload({ event, state, reducers: trigger.reducers, providers })
            expect(result).toStrictEqual({ value: 15 })
        })
    })
})

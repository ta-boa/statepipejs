import { Mock, beforeAll, describe, expect, test, vitest } from 'vitest'
import { Pipe, PipeFunction, StateSchema } from '../../statepipe.types'
import useState from '../state'
import parsePipe from '../parse.pipe'
import reduceState from '../reduce.state'

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

const providers: Record<string, PipeFunction> = {
    text: reduceToString,
    ten: reduceToTen,
    double: reduceDouble,
    halt: reduceToUndefined,
    minus: reduceMinus5
}

describe('reduceState()', () => {
    let pipe: Pipe,
        stateChangeHandler: Mock,
        state: StateSchema,
        newState: StateSchema | undefined

    const payload = { value: "payload" }


    test('Given pipe without reducer should return the same state', async () => {
        vitest.clearAllMocks()
        pipe = parsePipe('boo')[0]
        stateChangeHandler = vitest.fn()
        state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
        const result = await reduceState({ node, state, payload, reducers: [], providers })
        expect(result).toStrictEqual({ value: "statepipe" })
        expect(stateChangeHandler).not.toBeCalled()
    })

    test('Given reducer without provider should return the same state', async () => {
        vitest.clearAllMocks()
        pipe = parsePipe('boo->foo')[0]
        stateChangeHandler = vitest.fn()
        state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
        const result = await reduceState({ node, state, payload, reducers: pipe.reducers, providers: {} })
        expect(result).toStrictEqual({ value: "statepipe" })
        expect(stateChangeHandler).not.toBeCalled()
    })

    describe('Given multiple reducers and the expected providers', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            pipe = parsePipe('boo->text:a:b|ten:c')[0]
            stateChangeHandler = vitest.fn()
            state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
            newState = await reduceState({ node, state, payload, reducers: pipe.reducers, providers })
        })
        test('should call reducers once with expected args', () => {
            expect(providers.text).toHaveBeenCalledTimes(1)
            expect(providers.text).toHaveBeenCalledWith({ node, state, payload, args: ["a", "b"] })
            expect(providers.ten).toHaveBeenCalledTimes(1)
            expect(providers.ten).toHaveBeenCalledWith({ node, state: { value: 10 }, payload, args: ["c"] })
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
            pipe = parsePipe('boo->halt|ten')[0]
            stateChangeHandler = vitest.fn()
            state = useState({ value: 'statepipe' }, stateChangeHandler)[0]
            newState = await reduceState({ node, payload, state, reducers: pipe.reducers, providers })
        })
        test('should return undefined', () => {
            expect(newState).toBe(undefined)
        })
        test('should not change original state', () => {
            expect(stateChangeHandler).not.toHaveBeenCalled()
            expect(reduceToTen).not.toHaveBeenCalled()
            expect(state.value).toBe('statepipe')
        })
        test('should not call the next reducer after the changing the new state to undefined', () => {
            expect(reduceToTen).not.toHaveBeenCalled()
        })
    })
})

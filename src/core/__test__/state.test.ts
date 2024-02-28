import { describe, expect, it, test, vitest } from 'vitest'
import { onChange, useState } from '../state'
describe.only('onChange', () => {
    test('returns an object with initial state and doesnt call the change handler', () => {
        const handler = vitest.fn()
        const state = onChange({ value: 1 }, handler)
        expect(state.value).toBe(1)
        expect(handler).not.toHaveBeenCalled()
    })
    describe.each([
        { name: 'number', value: 1, newValue: 2 },
        { name: 'string', value: '1', newValue: '2' },
        { name: 'boolean', value: true, newValue: false },
        { name: 'object', value: { a: 1 }, newValue: { a: 2 } },
        { name: 'array', value: [{ a: 1 }], newValue: [{ a: 1 }] },
    ])('handle values as $name', ({ value, newValue }) => {
        test('call handler when new value is different', () => {
            const handler = vitest.fn()
            const state = onChange({ value }, handler)
            state.value = newValue
            expect(handler).toHaveBeenCalledWith({ value: newValue })
        })
        test('not call handler when new value is equal', () => {
            const handler = vitest.fn()
            const state = onChange({ value }, handler)
            state.value = value
            expect(handler).not.toHaveBeenCalled()
        })
    })
    test('handle changes in a object with multiple depths', () => {
        const handler = vitest.fn()
        const state = onChange({ a: { b: { c: 'd' } } }, handler)
        state.a.b.c = 'D'
        expect(handler).toHaveBeenCalledWith({ a: { b: { c: 'D' } } })
    })
    test('handle changes when new attributes are added to the object', () => {
        const handler = vitest.fn()
        const state = onChange({ a: 1 }, handler)
        state.b = 2
        expect(handler).toHaveBeenCalledWith({ a: 1, b: 2 })
    })
    test.skip('handle not calling the callback when deep object is updated with same values', () => {
        const handler = vitest.fn()
        const state = onChange({ a: { b: { c: 'd' } } }, handler)
        state.a = { b: { c: 'd' } }
        expect(handler).not.toHaveBeenCalled()
    })
})

describe('useState', () => {
    test('returns an array with current state and update state function', () => {
        const [state, updateState] = useState({ value: 1 }, () => {})
        expect(state).toStrictEqual({ value: 1 })
        expect(updateState).toBeTypeOf('function')
    })
    describe.each([
        { name: 'number', initialValue: 1, newValue: 2 },
        { name: 'string', initialValue: '1', newValue: '2' },
        { name: 'boolean', initialValue: true, newValue: false },
        { name: 'object', initialValue: { a: 1 }, newValue: { a: 2 } },
        { name: 'array', initialValue: [{ a: 1 }], newValue: [{ a: 2 }] },
    ])('handle value as $name', ({ initialValue, newValue }) => {
        test('call handler when new value is different', () => {
            const handler = vitest.fn()
            const [state, update] = useState({ value: initialValue }, handler)
            update({ value: newValue })
            expect(handler).toHaveBeenCalledWith({ value: newValue })
            expect(state.value).toBe(newValue)
        })
        test('not call handler when new value is equal', () => {
            const handler = vitest.fn()
            const [state, update] = useState({ value: initialValue }, handler)
            update({ value: initialValue })
            expect(handler).not.toHaveBeenCalled()
            expect(state.value).toBe(initialValue)
        })
    })
})

import { expect, test } from 'vitest'
import deepEqual from '../deep-equal'

test('should compare numbers', () => {
    expect(deepEqual(1, 1)).toBe(true)
})
test('should compare boolean', () => {
    expect(deepEqual(true, true)).toBe(true)
    expect(deepEqual(false, false)).toBe(true)
    expect(deepEqual(true, false)).toBe(false)
})
test('should compare numbers', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual(1.2, 1.2)).toBe(true)
    expect(deepEqual(-1, -1)).toBe(true)
    expect(deepEqual(-1, 1)).toBe(false)
    expect(deepEqual(1, NaN)).toBe(false)
})
test('should compare string', () => {
    expect(deepEqual('statepipe', 'statepipe')).toBe(true)
})
test('should compare shallow objects', () => {
    expect(deepEqual({ value: 'statepipe' }, { value: 'statepipe' })).toEqual(true)
})
test('should compare deep objects', () => {
    const o = [
        { value: 'statepipe', foo: true, list: { another: { and: { another: true } } } },
        { value: 'statepipe', foo: false, list: { another: { and: { another: false } } } },
    ]
    expect(deepEqual(o, o)).toEqual(true)
    expect(deepEqual(o, [])).toEqual(false)
})

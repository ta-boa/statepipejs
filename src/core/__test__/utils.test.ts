import { describe, expect, test } from 'vitest'
import { uid, deepEqual } from "../utils";

describe("uid()", () => {
    test("uid() returns a hash with randm 8 chars or numbers", () => {
        expect(uid()).toMatch(/^[A-Za-z0-9]{8}$/)
    })
    test("uid() doenst return same values (1000 attempts only)", () => {
        for (let i = 0; i < 1000; i++) {
            expect(uid()).not.toEqual(uid())
        }
    })
    test("uid(12) returns a random hash with 12 chars", () => {
        expect(uid(12).length).toBe(12)
    })
})

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

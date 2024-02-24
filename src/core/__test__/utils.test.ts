import { describe, expect, test } from 'vitest'
import { uid } from "../utils";

describe("uid()", () => {
    test("uid() returns a hash with randm 8 chars or numbers", () => {
        expect(uid()).toMatch(/^[A-Za-z0-9]{8}$/)
    })
    test("uid() doenst return same values (1000 attempts only)", () => {
        for(let i =0; i <1000; i++){
            expect(uid()).not.toEqual(uid())
        }
    })
    test("uid(12) returns a random hash with 12 chars", () => {
        expect(uid(12).length).toBe(12)
    })
})

// import { lensValue, setValue } from '../utils'

// describe('lensValue()', () => {
//     test('lensValue("",{}) returns undefined', () => {
//         expect(lensValue("", {})).toBe(undefined)
//     })
//     test('lensValue("value",{}) returns undefined', () => {
//         expect(lensValue("value", {})).toBe(undefined)
//     })
//     test('lensValue("value",{value:"statepipe"}) returns statepipe', () => {
//         expect(lensValue("value", { value: "statepipe" })).toBe("statepipe")
//     })
//     test('lensValue("value.a.b.c",{value:{a:{b:{c:"statepipe"}}}}) returns statepipe', () => {
//         expect(lensValue("value.a.b.c", { value: { a: { b: { c: "statepipe" } } } })).toBe("statepipe")
//     })
//     test('lensValue("value[2]",{value:[0,1,2,3,4,5]}) returns 3', () => {
//         expect(lensValue("value[2]", { value: [0, 1, 2, 3, 4, 5] })).toBe(2)
//     })
// })

// describe('setValue()', () => {
//     test('setValue("value",1,{value:0}) return {value:1}', () => {
//         expect(setValue("value", 1, { value: 0 })).toStrictEqual({ value: 1 })
//     })
//     test('setValue("value.a.b",1,{value:{a:{b:0}}}) return {value:{a:{b:1}}}', () => {
//         expect(setValue("value.a.b", 1, { value: { a: { b: 0 } } })).toStrictEqual({ value: { a: { b: 1 } } })
//     })
//     test('setValue("foo",1,{value:0}) return {value:0,foo:1}', () => {
//         expect(setValue("foo", 1, { value: 0 })).toStrictEqual({ value: 0, foo: 1 })
//     })
// });
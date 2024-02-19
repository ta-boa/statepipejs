import { expect, test } from 'vitest'
import parser from '../parse.state'

test('given "state" it return "state"', () => {
    expect(parser('state')).toBe('state')
})
test('given "true" return boolean true', () => {
    expect(parser('true')).toBe(true)
})
test('given "false" return boolean false', () => {
    expect(parser('false')).toBe(false)
})
test('given "10" return number 10', () => {
    expect(parser('10')).toBe(10)
})
test('given "10.10" return number 10.10', () => {
    expect(parser('10.10')).toBe(10.1)
})
test('given "{value:10}" return object {value:10}', () => {
    expect(parser('{"value":10}')).toStrictEqual({ value: 10 })
})
test('given "[{value:10}]" return array [{value:10}]', () => {
    expect(parser('[{"value":10}]')).toStrictEqual([{ value: 10 }])
})

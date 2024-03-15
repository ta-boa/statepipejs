import { expect, test } from 'vitest'
import parser from '../src/parse.reducer'

test('given empty string return undefined', () => {
    expect(parser('')).toBe(undefined)
})

test('given fn returns valid reducer with name', () => {
    expect(parser('fn')).toStrictEqual({ name: 'fn', args: [] })
})

test('given fn:a:b:c returns valid reducer with args', () => {
    expect(parser('fn:a:b:c')).toStrictEqual({ name: 'fn', args: ["a","b","c"] })
})

test('given fn:a : b:c should trim the args', () => {
    expect(parser('fn:a : b:c')).toStrictEqual({ name: 'fn', args: ["a","b","c"] })
})

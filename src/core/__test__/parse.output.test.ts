import { expect, test } from 'vitest'
import parser from '../parse.output'

test('given "" return []', () => {
    expect(parser("")).toStrictEqual([])
})

test('given "fn" return list with one reducer', () => {
    const [reducer] = parser("fn");
    expect(reducer.name).toBe("fn")
})

test('given "fn1,fn2" return list with one reducer', () => {
    const [reducer1, reducer2] = parser("fn1|fn2");
    expect(reducer1.name).toBe("fn1")
    expect(reducer2.name).toBe("fn2")
})

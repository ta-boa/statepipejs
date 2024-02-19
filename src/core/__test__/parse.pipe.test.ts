import { expect, test } from 'vitest'
import parser from '../parse.pipe'

test('given "" return []', () => {
    expect(parser('')).toStrictEqual([])
})
test('given "  " return []', () => {
    expect(parser('')).toStrictEqual([])
})

test('given "action" return []', () => {
    expect(parser('action')).toStrictEqual([])
})

test('given "action->fn:a:b" valid trigger', () => {
    const [pipe] = parser('action->fn:a:b')
    expect(pipe.action).toStrictEqual('action')
    expect(pipe.reducers.length).toBe(1)
    expect(pipe.reducers[0].name).toStrictEqual('fn')
    expect(pipe.reducers[0].args).toStrictEqual(['a', 'b'])
})

test('given "action ->fn:a:b" the action name will be trimmed', () => {
    const [pipe] = parser('action ->fn')
    expect(pipe.action).toStrictEqual('action')
})

test('given "action1->fn1:a:b,action2->fn2:c" return a list with 2 triggers', () => {
    const [pipe1, pipe2] = parser('action1->fn1:a:b,action2->fn2:c')
    expect(pipe1.action).toStrictEqual('action1')
    expect(pipe1.reducers.length).toBe(1)
    expect(pipe2.action).toStrictEqual('action2')
    expect(pipe2.reducers.length).toBe(1)
})

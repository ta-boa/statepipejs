import { beforeEach, expect, test, vitest } from 'vitest'
import parser from '../parse.state'
import { StateSchema } from '../../statepipe.types'

// const useState = (initialValue: StateSchema) => {
//     const state = new State(initialValue);
//     const updateState = (newState:StateSchema) => {
//         console.log("update",newState)
//         //state = {...newState}
//     }
//     return [state, updateState]
// }

const onChange = (origin: any, onChangeFunction: Function) => {
    const handler = {
        get(target: any, property: any, receiver: unknown) {
            return Reflect.get(target, property, receiver)
        },
        set(target: any, property: any, value: any) {
            onChangeFunction()
            return Reflect.set(target, property, value)
        },
        deleteProperty(target: any, property: any) {
            onChangeFunction()
            return Reflect.deleteProperty(target, property)
        },
    }

    return new Proxy(origin, handler)
}

test('a', () => {
    const changed = vitest.fn()
    const state = onChange({ value: '123' }, changed)
    state.value = 1234
    expect(state.value).toBe(1234)
    expect(changed).toBeCalled()
})

//test('given "state" it return "state"', () => {
//expect(parser('state')).toBe({ value: 'state' })
//})
// test('given "true" return boolean true', () => {
//     expect(parser('true')).toBe(true)
// })
// test('given "false" return boolean false', () => {
//     expect(parser('false')).toBe(false)
// })
// test('given "10" return number 10', () => {
//     expect(parser('10')).toBe(10)
// })
// test('given "10.10" return number 10.1', () => {
//     expect(parser('10.10')).toBe(10.1)
// })
// test('given "{value:10}" return object {value:10}', () => {
//     expect(parser('{"value":10}')).toStrictEqual({ value: 10 })
// })
// test('given "[{value:10}]" return array [{value:10}]', () => {
//     expect(parser('[{"value":10}]')).toStrictEqual([{ value: 10 }])
// })

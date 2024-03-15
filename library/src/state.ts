import { StateSchema } from './statepipe.types'
import { deepEqual } from './utils'

export const onChange = (origin: any, onChangeFunction: Function) => {
    const handler = {
        get(target: any, key: any): any {
            if (typeof target[key] === 'object' && target[key] !== null) {
                return new Proxy(target[key], handler)
            }
            return target[key]
        },
        set(target: any, property: any, value: any, receiver?: any) {
            const oldValue = target[property]
            // Deep objects won't capture properly when setting attributes with same values
            // ex:
            // a.b.c = 1
            // a = {b:c:1}
            // the end object is the same but the handler you be called
            if (value !== oldValue) {
                onChangeFunction(origin)
            }
            return Reflect.set(target, property, value, receiver)
        },
        deleteProperty(target: any, property: any) {
            onChangeFunction(state)
            return Reflect.deleteProperty(target, property)
        },
    }
    const state = new Proxy(origin, handler)
    return state
}

export const useState = (state: StateSchema, handleChange: (state: StateSchema) => void) => {
    //const state = onChange(initialValue, handleChange)
    const updateState = (newState: StateSchema) => {
        if (!deepEqual(state, newState)) {
            state.value = newState.value
            handleChange(state)
        }
    }
    return [state, updateState] as const
}

export default useState

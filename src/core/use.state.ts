import { StateSchema } from '../statepipe.types'
import deepEqual from './deep.equal'

export const onChange = (origin: any, onChangeFunction: Function) => {
    const handler = {
        get(target: any, property: any, receiver: unknown) {
            return Reflect.get(target, property, receiver)
        },
        set(target: any, property: any, value: any) {
            if (state[property] !== value) {
                onChangeFunction(target)
            }
            return Reflect.set(target, property, value)
        },
        deleteProperty(target: any, property: any) {
            onChangeFunction(state)
            return Reflect.deleteProperty(target, property)
        },
    }
    const state = new Proxy(origin, handler)
    return state
}

export const useState = (
    state: StateSchema,
    handleChange: (state: StateSchema) => void
) => {
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

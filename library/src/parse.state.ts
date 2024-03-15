import { StateSchema } from './statepipe.types'

export default (state: string): StateSchema => {
    if (state.match(/^[\d.]+$/)) {
        return { value: Number(state) }
    }
    if (state.match(/^true|false$/)) {
        return { value: state === 'true' }
    }
    if (state.match(/^[{\[].*[}\]]$/)) {
        try {
            return JSON.parse(state)
        } catch (err) {
            return { value: undefined }
        }
    }
    return { value: state }
}

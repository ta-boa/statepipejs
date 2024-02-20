import { State } from '../statepipe.types'

export default (state: string): State => {
    if (state.match(/^[\d.]+$/)) {
        return Number(state)
    }
    if (state.match(/^true|false$/)) {
        return state === 'true'
    }
    if (state.match(/^[{\[].*[}\]]$/)) {
        try {
            return JSON.parse(state)
        } catch (err) {
            return undefined
        }
    }
    return state;
}

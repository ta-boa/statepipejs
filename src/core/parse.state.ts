import { State } from '../statepipe.types'

export default (state: string): State => {
    if (state.match(/^[{\[].*[}\]]$/)) {
        try {
            return JSON.parse(state)
        } catch (err) {
            return undefined
        }
    } else if (state.match(/^\d.+$/)) {
        return Number(state)
    } else if (state.match(/^true|false$/)) {
        return state === 'true'
    }
    return state;
}

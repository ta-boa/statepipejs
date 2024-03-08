import { Pipe } from '../statepipe.types'
import parseReducer from './parse.reducer'

/**
 * Ex:
 * open@click
 * action->fn
 * action->fn:a
 * action->fn:a|fn2
 * action->fn,anotherAction->fn
 */
export default (pipes: string): Pipe[] => {
    pipes = pipes.trim()
    if (!pipes.length) {
        return []
    }
    // from "action->fn,action->fn" to ["action->fn","action->fn"]
    const blocks = pipes.split(',')

    return blocks
        .map((block) => {
            // from action->fn|fn to [action,[..fn]]
            const [actionName, ...actionReducers] = block.trim().split('->')
            const action = actionName.trim()
            const reducersToParse = actionReducers.map(chunk => chunk.split("|")).flat()
            const reducers = reducersToParse.map(parseReducer)
            if (action.length && reducers.length) {
                return {
                    action: actionName.trim(),
                    reducers,
                }
            }
        })
        .filter((pipe) => !!pipe) as Pipe[]
}

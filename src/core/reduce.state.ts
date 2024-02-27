import { Pipe, PipeFunction, StateReducer, StateSchema } from "../statepipe.types"

export default (
    action: string,
    node: HTMLElement,
    payload: StateSchema,
    state: StateSchema,
    pipeList: Pipe[],
    providers: Record<string, PipeFunction>) => {

    const pipeAction = pipeList.find((pipe: Pipe) => pipe.action === action)

    if (pipeAction) {
        let result: StateSchema | undefined = { ...state }
        pipeAction.reducers
            .filter((fn) => fn.name in providers)
            .forEach((fn: StateReducer) => {
                if (result) {
                    result = providers[fn.name]({ payload, state: result, node, args: fn.args })

                }
            })
        return result;
    }
}
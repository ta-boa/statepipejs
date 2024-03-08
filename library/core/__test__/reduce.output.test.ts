import { beforeAll, describe, expect, test, vitest } from 'vitest'
import { OutputFunction } from '../../statepipe.types'
import parseOutput from '../parse.output'
import reduceOutput from '../reduce.output'

const node = document.createElement('div')

const reducerFunction = vitest.fn()
const reducerAsync = vitest.fn().mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
})

const providers: Record<string, OutputFunction> = {
    fn: reducerFunction,
    promise: reducerAsync,
}

describe('reduceOutput()', () => {
    describe('Given multiple reducers and the expected providers', () => {
        beforeAll(async () => {
            vitest.clearAllMocks()
            await reduceOutput({ node, state: { value: 'statepipe' }, reducers: parseOutput('fn:a:b|promise:c'), providers })
        })
        test('should call reducers once with expected args', () => {
            expect(providers.fn).toHaveBeenCalledTimes(1)
            expect(providers.fn).toHaveBeenCalledWith({ node, state: { value: "statepipe" }, args: ["a", "b"] })
            expect(providers.promise).toHaveBeenCalledTimes(1)
            expect(providers.promise).toHaveBeenCalledWith({ node, state: { value: "statepipe" }, args: ["c"] })
        })
    })
})

import { Mock, afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vitest } from 'vitest'
import { StateSchema, Trigger, TriggerFunction } from '../../statepipe.types'
import { createPayloadFromState } from "../component"
import parseTrigger from "../parser.trigger"
import useState from '../use.state'

const reduceToTen = vitest.fn().mockImplementation((_: Event, s: StateSchema) => {
    s.value = 10
    return s;
})
const reduceToBanjo = vitest.fn().mockImplementation((_: Event, s: StateSchema) => {
    s.value = "banjo"
    return s
})
const reduceToUndefined = vitest.fn().mockImplementation(() => {
    return undefined
})
const banjo = vitest.fn().mockImplementation(() => reduceToBanjo)
const ten = vitest.fn().mockImplementation(() => reduceToTen)
const stop = vitest.fn().mockImplementation(() => reduceToUndefined)

const providers: Record<string, TriggerFunction> = {
    banjo, ten, stop
}

describe("createPayloadFromState", () => {

    let trigger: Trigger,
        event: Event,
        handler: Mock,
        state: StateSchema,
        newState: StateSchema

    test("Given action without reducers should return the same state", () => {
        const [trigger] = parseTrigger("add@click");
        const event = new Event(trigger.event);
        const state = { value: "statepipe" }
        const newState = createPayloadFromState(event, state, trigger, {})
        expect(newState).toBe(state)
    })
    test("When provider doesnt have the reducer it returns the same state", () => {
        const [trigger] = parseTrigger("add@click|pick");
        const event = new Event(trigger.event);
        const state = { value: "statepipe" }
        const newState = createPayloadFromState(event, state, trigger, {})
        expect(newState).toStrictEqual(state)
    })

    describe("Given one trigger", () => {
        beforeAll(() => {
            vitest.clearAllMocks()
            trigger = parseTrigger("add@click|banjo:foo:bar")[0]
            event = new Event("click")
            handler = vitest.fn()
            state = useState({ value: "statepipe" }, handler)[0]
            newState = createPayloadFromState(event, state, trigger, providers)
        })

        test("should prepare the banjo provider with args", () => {
            expect(providers.banjo).toHaveBeenCalledTimes(1);
            expect(providers.banjo).toHaveBeenCalledWith("foo", "bar");
        })
        test("should call banjo reducer with event and state", () => {
            expect(reduceToBanjo).toHaveBeenCalledTimes(1);
        })
        test("should return new state", () => {
            expect(newState).toStrictEqual({ value: "banjo" })
        })
        test("should not change original state", () => {
            expect(handler).not.toHaveBeenCalled();
            expect(state).not.toBe(newState)
            expect(state.value).not.toBe(newState.value)
        })
    })

    describe("Given multiple triggers", () => {
        beforeAll(() => {
            vitest.clearAllMocks()
            trigger = parseTrigger("add@click|banjo:foo:bar|ten:10")[0]
            event = new Event("click")
            handler = vitest.fn()
            state = useState({ value: "statepipe" }, handler)[0]
            newState = createPayloadFromState(event, state, trigger, providers)
        })

        test("should prepare the banjo provider with args", () => {
            expect(providers.banjo).toHaveBeenCalledTimes(1);
            expect(providers.banjo).toHaveBeenCalledWith("foo", "bar");
        })
        test("should call banjo reducer with event and state", () => {
            expect(reduceToBanjo).toHaveBeenCalled();
        })
        test("should prepare the ten provider with args", () => {
            expect(providers.ten).toHaveBeenCalledTimes(1);
            expect(providers.ten).toHaveBeenCalledWith("10");
        })
        test("should call banjo reducer with event and state", () => {
            expect(reduceToTen).toHaveBeenCalled();
        })
        test("should return new state", () => {
            expect(newState).toStrictEqual({ value: 10 })
        })
        test("should not change original state", () => {
            expect(handler).not.toHaveBeenCalled();
            expect(state).not.toBe(newState)
            expect(state.value).not.toBe(newState.value)
        })
    })

    describe("Given trigger that returns undefined", () => {
        beforeAll(() => {
            trigger = parseTrigger("add@click|stop")[0]
            event = new Event("click")
            handler = vitest.fn()
            state = useState({ value: "statepipe" }, handler)[0]
            newState = createPayloadFromState(event, state, trigger, providers)
        })
        test("should return new state", () => {
            expect(newState).toBe(undefined)
        })
        test("should not change original state", () => {
            expect(handler).not.toHaveBeenCalled();
            expect(state.value).toBe("statepipe")
        })
    })
    describe("Having multiple trigger when first reducer returns undefined the others should not be called", () => {
        beforeAll(() => {
            vitest.clearAllMocks()
            trigger = parseTrigger("add@click|stop|banjo")[0]
            event = new Event("click")
            handler = vitest.fn()
            state = useState({ value: "statepipe" }, handler)[0]
            newState = createPayloadFromState(event, state, trigger, providers)
        })
        test("should call first reducer and get undefined state", () => {
            expect(newState).toBe(undefined)
        })
        test("should not call the second reducer", () => {
            expect(reduceToBanjo).not.toHaveBeenCalled()
        })
        test("should not change original state", () => {
            expect(handler).not.toHaveBeenCalled();
            expect(state.value).toBe("statepipe")
        })
    })
})

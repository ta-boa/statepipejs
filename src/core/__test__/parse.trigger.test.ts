import { expect, test } from 'vitest'
import parseTrigger from '../parser.trigger'

test('given empty string returns empty array', () => {
    expect(parseTrigger('')).toStrictEqual([])
    expect(parseTrigger('   ')).toStrictEqual([])
})

test('given "action" without event return empty array', () => {
    expect(parseTrigger('action')).toStrictEqual([])
})

test('given "action@event" return array with a Trigger', () => {
    const trigger = parseTrigger('action@event')[0]
    expect(trigger.event).toBe('event')
    expect(trigger.action).toBe('action')
    expect(trigger.id).toBeDefined()
    expect(trigger.reducers).toStrictEqual([])
})

test('given "  action@event " extra spaces will trim the whole block before parsing', () => {
    const trigger = parseTrigger(' action@event ')[0]
    expect(trigger.event).toBe('event')
    expect(trigger.action).toBe('action')
    expect(trigger.id).toBeDefined()
    expect(trigger.reducers).toStrictEqual([])
})

test('given "action @ event" spaces before/after action or event the parser should trim them out ', () => {
    const trigger = parseTrigger(' action @ event ')[0]
    expect(trigger.event).toBe('event')
    expect(trigger.action).toBe('action')
    expect(trigger.id).toBeDefined()
    expect(trigger.reducers).toStrictEqual([])
})


test('given "action@event|fn1:a:b|fn2:c" the Trigger will get a list of reducers', () => {
    const trigger = parseTrigger('action@event|fn1:a:b|fn2:c')[0]
    expect(trigger.reducers.length).toStrictEqual(2)

    const [red1, red2] = trigger.reducers

    expect(red1.name).toEqual('fn1')
    expect(red1.args).toStrictEqual(['a', 'b'])

    expect(red2.name).toEqual('fn2')
    expect(red2.args).toStrictEqual(['c'])
})

test('given "action1@event1,action2@event2" returns a list of triggers', () => {
    const triggers = parseTrigger('action1@event1,action2@event2')
    expect(triggers.length).toBe(2)

    const [trigger1, trigger2] = triggers

    expect(trigger1.action).toBe('action1')
    expect(trigger1.event).toBe('event1')
    expect(trigger1.id).toBeDefined()
    expect(trigger1.reducers).toStrictEqual([])

    expect(trigger2.action).toBe('action2')
    expect(trigger2.event).toBe('event2')
    expect(trigger2.id).toBeDefined()
    expect(trigger2.reducers).toStrictEqual([])
})

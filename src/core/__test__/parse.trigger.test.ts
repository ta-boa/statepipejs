import { expect, test } from 'vitest'
import parseTrigger from '../parser.trigger'

test('given empty string returns empty array', () => {
    expect(parseTrigger('')).toStrictEqual([])
})

test('given action without event return empty array', () => {
    expect(parseTrigger('action')).toStrictEqual([])
})

test('given action with event return array with a Trigger', () => {
    expect(parseTrigger('action@event')).toStrictEqual([{ event: 'event', action: 'action' }])
})

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateBuses,
  getUpcomingBusesList,
  parseTimeToDate,
} from '../src/utils/timeHelpers.js'
import {
  formatDateRange,
  formatEventTime,
  groupEventsByDate,
} from '../src/utils/eventosUtils.js'

// --- timeHelpers ---

test('calculateBuses devuelve el proximo bus y el ultimo ya pasado', () => {
  const ref = parseTimeToDate('12:00', new Date(2026, 7, 17))
  const schedule = [{ time: '11:00' }, { time: '12:30' }, { time: '13:00' }]
  const { nextBus, lastBus, secondsRemaining } = calculateBuses(schedule, ref)
  assert.equal(nextBus.time, '12:30')
  assert.equal(secondsRemaining, 30 * 60)
  assert.equal(lastBus.time, '11:00')
})

test('calculateBuses sin bus posterior deja nextBus nulo', () => {
  const ref = parseTimeToDate('20:00', new Date(2026, 7, 17))
  const schedule = [{ time: '06:30' }, { time: '11:00' }]
  const { nextBus, secondsRemaining, lastBus } = calculateBuses(schedule, ref)
  assert.equal(nextBus, null)
  assert.equal(secondsRemaining, null)
  assert.equal(lastBus.time, '11:00')
})

test('getUpcomingBusesList corta desde el proximo bus con el limite pedido', () => {
  const schedule = ['06:30', '11:00', '12:30', '13:00']
  assert.deepEqual(getUpcomingBusesList(schedule, '11:00', 2), ['11:00', '12:30'])
})

// --- eventosUtils ---

test('groupEventsByDate expande rango y filtra recurrencia', () => {
  const groups = groupEventsByDate([
    {
      id: 1,
      event_date_start: '2026-08-17', // lunes
      event_date_finish: '2026-08-19', // miercoles
      recurrence_days: [2], // solo martes
      start_time: '10:00',
    },
  ])
  assert.equal(groups.length, 1)
  assert.equal(groups[0].id, '2')
  assert.equal(groups[0].eventList.length, 1)
})

test('groupEventsByDate mapea domingo a 7', () => {
  const groups = groupEventsByDate([
    { id: 9, event_date_start: '2026-08-16', event_date_finish: null, start_time: '09:00' },
  ])
  assert.equal(groups[0].id, '7')
})

test('formatEventTime pasa de 24h a 12h', () => {
  assert.equal(formatEventTime('18:30'), '6:30 PM')
  assert.equal(formatEventTime('06:30'), '6:30 AM')
  assert.equal(formatEventTime('00:15'), '12:15 AM')
  assert.equal(formatEventTime(null), null)
})

test('formatDateRange cubre rango de un dia y multi-mes', () => {
  assert.equal(formatDateRange(null, '2026-04-20'), null)
  assert.equal(formatDateRange('2026-04-16', '2026-04-16'), '16 de abril')
  assert.match(formatDateRange('2026-04-30', '2026-05-01'), /30 de abril → 1 de mayo/)
})
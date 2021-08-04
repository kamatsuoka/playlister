import dayjs from 'dayjs'
import { displayDate, localDate, parseDescription } from './dates'

const offsetMinutes = dayjs().utcOffset()
const offsetHours = offsetMinutes / 60

it('prints the date in local time in a nice format', () => {
  const utcHour = 13
  const date = dayjs(`2021-07-13T${utcHour}:42:43.000Z`)
  const display = displayDate(date)
  const localHour = (utcHour + offsetHours).toString().padStart(2, 0)
  expect(display).toMatch(/^2021-07-13 /)
  expect(display).toContain(` ${localHour}:42:43 `)
  expect(display).toMatch(/ [A-Z]{3}$/)  // ends with time zone abbrev
})

it('parses the description to get startTime and endTime', () => {
  const desc = '{"startTime":"2021-07-13T03:42:43.000Z","endTime":"2021-07-13T03:42:53.000Z"}'
  const { startTime, endTime } = parseDescription(desc)
  expect(startTime).toEqual('2021-07-13T03:42:43.000Z')
  expect(endTime).toEqual('2021-07-13T03:42:53.000Z')
})

it('truncates the time zone abbreviation from a local date', () => {
  const utcHour = 13
  const date = dayjs(`2021-07-13T${utcHour}:42:43.000Z`)
  const local = localDate(date)
  const localHour = (utcHour + offsetHours).toString().padStart(2, 0)
  expect(local).toEqual(`2021-07-13 ${localHour}:42:43`)
})

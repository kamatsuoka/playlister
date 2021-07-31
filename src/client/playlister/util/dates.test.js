import { parseDescription } from './dates'

it('parses the description to get startTime and endTime', () => {
  const desc = '{"startTime":"2021-07-13T03:42:43.000Z","endTime":"2021-07-13T03:42:53.000Z"}'
  const { startTime, endTime } = parseDescription(desc)
  expect(startTime).toEqual('2021-07-13T03:42:43.000Z')
  expect(endTime).toEqual('2021-07-13T03:42:53.000Z')
})

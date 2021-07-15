import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { tableOverrides } from './TableOverrides'
import { Table } from 'baseui/table-semantic'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const StartEndList = ({ metadata, overrideTimeZone, timeAdjust, startEndList, setStartEndList }) => {
  /**
   * Calculate start and end time from file info
   */
  useEffect(() => {
    const parseTimestamp = (timestamp) => {
      if (overrideTimeZone) {
        const time = timestamp.replace('UTC ', '')
        return dayjs(time).local()
      } else {
        if (timestamp.match('^UTC ')) {
          const time = timestamp.replace('UTC ', '') + ' +00:00'
          return dayjs(time, 'YYYY-MM-DD HH:mm:ss Z').tz('UTC')
        } else {
          return dayjs(timestamp)
        }
      }
    }

    const adjustTime = time => time
      .add(timeAdjust.year || 0, 'y')
      .add(timeAdjust.month || 0, 'M')
      .add(timeAdjust.day || 0, 'd')
      .add(timeAdjust.hour || 0, 'h')
      .add(timeAdjust.minute || 0, 'm')
      .add(timeAdjust.second || 0, 's')

    const calculateStartEnd = (resultId, result) => {
      const parsedStartTime = parseTimestamp(result.startTime)
      const startTime = adjustTime(parsedStartTime)
      const endTime = startTime.add(result.duration, 'second')
      return {
        id: resultId,
        name: result.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    }

    // filter out any files that don't have a start time (probably not media files)
    const startEnds = Object.entries(metadata)
      .flatMap(([resultId, result]) =>
        result.startTime ? [calculateStartEnd(resultId, result)] : []
      ).sort((s1, s2) => s1.startTime > s2.startTime ? 1 : -1)
    setStartEndList(startEnds)
  }, [metadata, overrideTimeZone, setStartEndList, timeAdjust])

  const displayTemplate = 'YYYY-MM-DD HH:mm:ss z'

  const COLUMNS = ['Name', 'Start Time', 'End Time']

  return (
    <div id='start-end'>
      <Table
        columns={COLUMNS} overrides={tableOverrides}
        data={startEndList.map(startEnd => [
          startEnd.name,
          dayjs(startEnd.startTime).format(displayTemplate),
          dayjs(startEnd.endTime).format(displayTemplate)
        ])}
      />
    </div>
  )
}

export default StartEndList

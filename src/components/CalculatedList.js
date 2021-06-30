import React, {useEffect} from "react"
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import localizedFormat from "dayjs/plugin/localizedFormat"
import advancedFormat from "dayjs/plugin/advancedFormat"
import timezone from "dayjs/plugin/timezone" // dependent on utc plugin
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const CalculatedList = ({fileInfo, overrideTimeZone, fileProperties, setFileProperties}) => {

  /**
   * Calculate start and end time from file info
   */
  useEffect(() => {
    const parseTimestamp = (timestamp) => {
      if (overrideTimeZone) {
        const time = timestamp.replace('UTC ', '')
        return dayjs(time).local()
      } else {
        if (timestamp.match("^UTC ")) {
          const time = timestamp.replace('UTC ', '') + ' +00:00'
          return dayjs(time, 'YYYY-MM-DD HH:mm:ss Z').tz("UTC")
        } else {
          return dayjs(timestamp)
        }
      }
    }

    const calculateStartEnd = (result) => {
      const startTime = parseTimestamp(result.startTime)
      const endTime = startTime.add(result.duration, "second")
      return {
        name: result.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    }

    const fileProps = Object.fromEntries(
      Object.entries(fileInfo)
        .flatMap(([resultId, result]) =>
          result.startTime ? [[resultId, calculateStartEnd(result)]] : []
        )
    )
    setFileProperties(fileProps)
  }, [fileInfo, overrideTimeZone, setFileProperties])

  const displayTemplate = 'ddd MMM D h:mm:ss A z YYYY'

  return (
    <div id="calculated">
      <table className="file-list">
        <thead>
        <tr>
          <th>Name</th>
          <th>Start Time</th>
          <th>End Time</th>
        </tr>
        </thead>
        <tbody>
        {Object
          .entries(fileProperties)
          .map(([resultId, result]) =>
            (
              <tr key={resultId}>
                <td>{result.name}</td>
                <td>{dayjs(result.startTime).format(displayTemplate)}</td>
                <td>{dayjs(result.endTime).format(displayTemplate)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default CalculatedList

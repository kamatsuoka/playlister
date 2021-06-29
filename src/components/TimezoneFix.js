import {TimezonePicker} from "baseui/timezonepicker"
import {findTimeZone, getZonedTime, listTimeZones,} from 'timezone-support/dist/index-1900-2050.js'
import {formatZonedTime} from 'timezone-support/dist/parse-format.js'
import {SIZE} from "baseui/input"
import React, {useEffect} from "react"

const TimezoneFix = ({results}) => {
  const [value, setValue] = React.useState(
    ""
  );
  const [zoneOption, setZoneOption] = React.useState("default")

  /**
   * Finds the local time zone id by printing out the local date and searching in the
   * zone ids. Not guaranteed to work ...
   */
  const findLocalZoneId = () => {
    const compareDate = new Date()
    const timeZones = listTimeZones().map(zone => {
      const timezone = findTimeZone(zone);
      const zonedTime = getZonedTime(compareDate, timezone);
      return formatZonedTime(
        zonedTime,
        `z - [${zone}] ([GMT] Z)`,
      ).replace('_', ' ');
    })
    const dateString = compareDate.toString()
    const parenIndex = dateString.indexOf("(")
    const zoneName = dateString.substring(parenIndex + 1, dateString.lastIndexOf(")"))
    let timeZone = timeZones.filter((tz) => tz.includes(zoneName))[0]
    if (!timeZone) {
      const parts = dateString.substring(0, parenIndex).trim().split(" ")
      const gmtOffset = parts[parts.length - 1].replace(/00$/, ":00")
      timeZone = timeZones.filter((tz) => tz.includes(gmtOffset))[0]
    }
    const parts = timeZone.substring(0, timeZone.indexOf("(")).trim().split(" ")
    return parts[parts.length - 1]
  }

  useEffect(() => {
    if (value === "") {
      const zoneId = findLocalZoneId()
      setValue(zoneId)
    }
  }, [])

  const onOptionChange = (event) => {
    setZoneOption(event.target.value)
  }

  if (results !== null && Object.keys(results).length !== 0) {
    return (
      <div id="timezonefix">
        <div className="radio">Use time zone:</div>
        <div className="radio">
          <label>
            <input
              type="radio"
              value="default"
              checked={zoneOption === "default"}
              onChange={onOptionChange}
            />
            Default
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              value="override"
              checked={zoneOption === "override"}
              onChange={onOptionChange}
            />
            Override
          </label>
        </div>
        <TimezonePicker
          value={value}
          size={SIZE.mini}
          onChange={({id}) => {
            setValue(id)
          }}
          disabled={zoneOption === "default"}
        />
      </div>
    )
  } else {
    return null
  }

}

export default TimezoneFix

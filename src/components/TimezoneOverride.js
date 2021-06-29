import {TimezonePicker} from "baseui/timezonepicker"
import {findTimeZone, getZonedTime, listTimeZones,} from 'timezone-support/dist/index-1900-2050.js'
import {formatZonedTime} from 'timezone-support/dist/parse-format.js'
import {SIZE} from "baseui/input"
import React, {useEffect} from "react"
import {Checkbox} from "baseui/checkbox"

const TimezoneOverride = ({value, setValue, override, setOverride}) => {

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
  }, [setValue, value])

  return (
    <div id="timezonefix">
      <Checkbox
        checked={override}
        onChange={e => setOverride(e.target.checked)}
      >
        Override time zone
      </Checkbox>
      <TimezonePicker
        value={value}
        size={SIZE.default}
        onChange={({id}) => {
          setValue(id)
        }}
        disabled={!override}
        className="picker"
      />
    </div>
  )

}

export default TimezoneOverride

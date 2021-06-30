import {TimezonePicker} from "baseui/timezonepicker"
import {SIZE} from "baseui/input"
import React, {useEffect} from "react"
import {Checkbox} from "baseui/checkbox"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const TimezoneOverride = ({value, setValue, override, setOverride}) => {

  /**
   * Guess local time zone
   */
  useEffect(() => {
    if (value === "") {
      const zoneId = dayjs.tz.guess()
      setValue(zoneId)
    }
  }, [setValue, value])

  return (
    <div id="timezonefix">
      <Checkbox
        checked={override}
        onChange={e => setOverride(e.target.checked)}
      >
        Are start times above actually in local time zone?
      </Checkbox>

      <div style={{display: "none"}}>
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
    </div>
  )

}

export default TimezoneOverride

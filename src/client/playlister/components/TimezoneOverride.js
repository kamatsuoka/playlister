import React from 'react'
import { Checkbox } from 'baseui/checkbox'

const TimezoneOverride = ({ fileInfo, value, setValue }) => {
  return (
    <div>
      <Checkbox
        disabled={Object.keys(fileInfo).length === 0}
        checked={value}
        onChange={e => setValue(e.target.checked)}
      >
        File metadata times are actually in local time zone
      </Checkbox>
    </div>
  )
}

export default TimezoneOverride

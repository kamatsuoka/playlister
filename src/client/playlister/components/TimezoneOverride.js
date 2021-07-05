import React from 'react'
import { Checkbox } from 'baseui/checkbox'

const TimezoneOverride = ({ value, setValue }) => {

  return (
    <div>
      <Checkbox
        checked={value}
        onChange={e => setValue(e.target.checked)}
      >
        Start times above are actually in local time zone
      </Checkbox>
    </div>
  )

}

export default TimezoneOverride

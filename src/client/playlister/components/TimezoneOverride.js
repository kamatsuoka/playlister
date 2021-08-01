import React from 'react'
import { Checkbox } from 'baseui/checkbox'
import { SIZE } from 'baseui/input'
import { useStyletron } from 'baseui'
import dayjs from 'dayjs'
import Tooltip from './Tooltip'

const TimezoneOverride = ({ mediaList, value, setValue }) => {
  const [css, theme] = useStyletron()

  const SmallSpan = ({ children }) => (
    <span className={css({
      fontSize: theme.typography.LabelSmall.fontSize,
      fontWeight: theme.typography.ParagraphSmall.fontWeight
    })}
    >
      {children}
    </span>)

  const utcMessage = (
    <div>
      If your videos are from a camera that doesn't put a time zone on its timestamps,<br />
      the start/end times get interpreted in UTC unless this option is checked.
    </div>
  )

  return (
    <div style={{ paddingTop: '10px', paddingBottom: '10px' }}>
      <SmallSpan />
      <Checkbox
        size={SIZE.small}
        disabled={mediaList.length === 0}
        checked={value}
        onChange={e => setValue(e.target.checked)}
        overrides={{
          Root: {
            style: {
              verticalAlign: 'bottom'
            }
          },
          Checkmark: {
            style: ({ $theme }) => ({
              height: $theme.sizing.scale600,
              width: $theme.sizing.scale600,
              marginTop: $theme.sizing.scale100
            })
          }
        }}
      >
        <SmallSpan>
          <Tooltip tooltip={utcMessage}>
            Interpret Times
          </Tooltip>
          {' '} in local time zone ({dayjs.tz.guess()})
        </SmallSpan>
      </Checkbox>
    </div>
  )
}

export default TimezoneOverride

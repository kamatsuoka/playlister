import React from 'react'
import { Checkbox } from 'baseui/checkbox'
import { SIZE } from 'baseui/input'
import { useStyletron } from 'baseui'
import Tooltip from './Tooltip'

const TimeCode = ({ mediaList, value, setValue }) => {
  const [css, theme] = useStyletron()

  const SmallSpan = ({ children }) => (
    <span className={css({
      fontSize: theme.typography.LabelSmall.fontSize,
      fontWeight: theme.typography.ParagraphSmall.fontWeight
    })}
    >
      {children}
    </span>)

  const timeCodeMessage = (
    <div>
      Recent GoPro cameras split videos into "chapters" and record the start time of the first
      chapter in each subsequent chapter. As a workaround, check this box to use the
      "Time code of first frame" metadata to calculate start times instead. You may also
      need to adjust the time offest, below.
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
          Use {' '}
          <Tooltip tooltip={timeCodeMessage}>
            time code of first frame
          </Tooltip>
          {' '} to calculate start times
        </SmallSpan>
      </Checkbox>
    </div>
  )
}

export default TimeCode

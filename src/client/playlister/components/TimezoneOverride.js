import React from 'react'
import { Checkbox } from 'baseui/checkbox'
import { SIZE } from 'baseui/input'
import { useStyletron } from 'baseui'

const TimezoneOverride = ({ fileInfo, value, setValue }) => {
  const [css, theme] = useStyletron()
  return (
    <div>
      <Checkbox
        size={SIZE.small}
        disabled={Object.keys(fileInfo).length === 0}
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
        <span className={css({
          fontSize: theme.typography.LabelSmall.fontSize
        })}
        >
          File metadata times are actually in local time zone
        </span>
      </Checkbox>
    </div>
  )
}

export default TimezoneOverride

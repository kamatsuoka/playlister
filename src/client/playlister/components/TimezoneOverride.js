import React from 'react'
import { Checkbox } from 'baseui/checkbox'
import { SIZE } from 'baseui/input'
import { useStyletron } from 'baseui'
import { StatefulTooltip } from 'baseui/tooltip'

const TimezoneOverride = ({ metadata, value, setValue }) => {
  const [css, theme] = useStyletron()

  const SmallSpan = ({children}) => <span className={css({
      fontSize: theme.typography.LabelSmall.fontSize,
      fontWeight: theme.typography.ParagraphSmall.fontWeight,
    })}>{children}</span>


  return (
    <div style={{paddingTop: '10px', paddingBottom: '10px'}}>
      <SmallSpan>

      </SmallSpan>
      <Checkbox
        size={SIZE.small}
        disabled={Object.keys(metadata).length === 0}
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
          <StatefulTooltip
            accessibilityType={'tooltip'}
            content="Metadata times are interpreted in UTC if camera doesn't record time zone"
          >
            <span className={css({ borderBottomWidth: '1px', borderBottomStyle: 'dotted' })}>
              File metadata times
            </span>
          </StatefulTooltip>
          {' '}are actually in local time zone
        </SmallSpan>
      </Checkbox>
    </div>
  )
}

export default TimezoneOverride

import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { createTheme, lightThemePrimitives, ThemeProvider, useStyletron } from 'baseui'

const DEFAULT_DATE = 'default_date'
const CUSTOM_DATE = 'custom_date'

const EventDate = ({ eventData, setEventData }) => {
  const [css, theme] = useStyletron()

  const handleChange = (evt) => {
    setEventData({
      ...eventData,
      [evt.target.name]: evt.target.value
    })
  }

  const themeOverrides = () =>
    eventData.dateChoice === DEFAULT_DATE && eventData.defaultDate
      ? ({
          colors: {
            inputTextDisabled: 'black',
            backgroundStateDisabled: theme.colors.backgroundOverlayDark
          }
        })
      : {}

  const radioOverrides = {
    Root: {
      style: () => ({
        alignItems: 'start'
      })
    },
    RadioMarkOuter: {
      style: ({ $theme }) => ({
        marginTop: $theme.sizing.scale600
      })
    },
    Label: {
      style: ({ $theme }) => ({
        fontSize: $theme.typography.LabelSmall.fontSize
      })
    }
  }

  const inputOverrides = (inputInputStyle) => ({
    Root: {
      style: ({ $theme }) => ({
        width: $theme.sizing.scale3200,
        marginRight: $theme.sizing.scale600
      })
    },
    Input: {
      style: ({ $theme }) => ({
        paddingLeft: $theme.sizing.scale100,
        ...inputInputStyle
      })
    }
  })

  const defaultInputOverrides = inputOverrides({ caretColor: 'transparent' })
  const customInputOverrides = inputOverrides({})

  return (
    <ThemeProvider
      theme={createTheme(lightThemePrimitives, themeOverrides())}
    >
      <RadioGroup
        value={eventData.dateChoice}
        name='dateChoice'
        onChange={handleChange}
        align={ALIGN.horizontal}
      >
        <Radio value={DEFAULT_DATE} overrides={radioOverrides}>
          <Input
            value={eventData.defaultDate || ''}
            placeholder='[inferred from start times]'
            readOnly
            maxLength={8}
            overrides={defaultInputOverrides}
          />
          <div className={css({ marginLeft: theme.sizing.scale300 })}>default</div>
        </Radio>
        <Radio value={CUSTOM_DATE} overrides={radioOverrides}>
          <Input
            value={eventData.customDate || ''}
            placeholder='custom date'
            name='customDate'
            inputMode='numeric'
            maxLength={8}
            onChange={handleChange}
            onFocus={() => setEventData({ ...eventData, dateChoice: CUSTOM_DATE })}
            overrides={customInputOverrides}
          />
          <div className={css({ marginLeft: theme.sizing.scale300 })}>custom</div>
        </Radio>
      </RadioGroup>
    </ThemeProvider>
  )
}
export default EventDate
export { DEFAULT_DATE, CUSTOM_DATE }

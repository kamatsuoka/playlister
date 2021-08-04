import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { createTheme, lightThemePrimitives, ThemeProvider, useStyletron } from 'baseui'
import { FormControl } from 'baseui/form-control'
import { CUSTOM_DATE, DEFAULT_DATE } from '../models/dates'

const EventDate = ({ eventData, setEventData }) => {
  const [, theme] = useStyletron()

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
        paddingTop: $theme.sizing.scale100,
        paddingBottom: $theme.sizing.scale100,
        paddingLeft: $theme.sizing.scale200,
        paddingRight: $theme.sizing.scale200,
        ...inputInputStyle
      })
    }
  })

  const defaultInputOverrides = inputOverrides({ caretColor: 'transparent' })
  const customInputOverrides = inputOverrides({})

  const formControlOverrides = {
    ControlContainer: {
      style: ({
        marginBottom: 0
      })
    },
    Caption: {
      style: ({
        marginBottom: 0
      })
    }
  }

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
          <FormControl caption='default' overrides={formControlOverrides}>
            <Input
              value={eventData.defaultDate || ''}
              placeholder='[inferred from start times]'
              readOnly
              overrides={defaultInputOverrides}
            />
          </FormControl>
        </Radio>
        <Radio value={CUSTOM_DATE} overrides={radioOverrides}>
          <FormControl caption='custom' overrides={formControlOverrides}>
            <Input
              value={eventData.customDate || ''}
              placeholder='YYYYMMDD'
              name='customDate'
              type='number'
              inputMode='numeric'
              maxLength={8}
              min={19320000}
              max={99999999}
              onChange={handleChange}
              onFocus={() => setEventData({ ...eventData, dateChoice: CUSTOM_DATE })}
              overrides={customInputOverrides}
            />
          </FormControl>
        </Radio>
      </RadioGroup>
    </ThemeProvider>
  )
}
export default EventDate

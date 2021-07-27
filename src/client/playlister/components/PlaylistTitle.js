import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'
import { FormControl } from 'baseui/form-control'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistTitle = ({ suggestedTitle, playlistTitle, setPlaylistTitle }) => {
  const handleChange = (evt) => {
    setPlaylistTitle({
      ...playlistTitle,
      [evt.target.name]: evt.target.value
    })
  }

  const themeOverrides = () =>
    playlistTitle.titleChoice === SUGGESTED && suggestedTitle
      ? ({ colors: { inputTextDisabled: 'black' } })
      : {}

  const radioOverrides = {
    Root: {
      style: ({ $theme }) => ({
        alignItems: 'start',
        marginRight: $theme.sizing.scale600
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

  const inputOverrides = {
    Root: {
      style: ({ $theme }) => ({
        minWidth: '250px' // $theme.sizing.scale4800
      })
    }
  }

  const suggestedInputOverrides = {
    ...inputOverrides,
    Input: {
      props: {
        spellCheck: 'false'
      },
      style: ({
        caretColor: 'transparent'
      })
    }
  }
  return (
    <ThemeProvider
      theme={createTheme(lightThemePrimitives, themeOverrides())}
    >
      <RadioGroup
        value={playlistTitle.titleChoice}
        name='titleChoice'
        onChange={handleChange}
        align={ALIGN.horizontal}
      >
        <Radio value={SUGGESTED} overrides={radioOverrides}>
          <FormControl caption='suggested title'>
            <Input
              value={suggestedTitle}
              readOnly
              overrides={suggestedInputOverrides}
            />
          </FormControl>
        </Radio>
        <Radio value={CUSTOM} overrides={radioOverrides}>
          <FormControl caption='custom title'>
            <Input
              value={playlistTitle.customTitle || ''}
              placeholder='custom title'
              name='customTitle'
              onChange={handleChange}
              onFocus={() => setPlaylistTitle({ ...playlistTitle, titleChoice: CUSTOM })}
              overrides={inputOverrides}
            />
          </FormControl>
        </Radio>
      </RadioGroup>
    </ThemeProvider>
  )
}

export default PlaylistTitle
export { SUGGESTED, CUSTOM }

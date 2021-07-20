import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistTitle = ({ eventData, suggestedTitle, playlistTitle, setPlaylistTitle }) => {
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
    Label: {
      style: ({ $theme }) => ({
        fontSize: $theme.typography.LabelSmall.fontSize
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
        <Radio value={SUGGESTED} overrides={radioOverrides}>suggested title&nbsp;</Radio>
        <Radio value={CUSTOM} overrides={radioOverrides}>custom title</Radio>
      </RadioGroup>
      {playlistTitle.titleChoice === 'custom'
        ? <Input
            value={playlistTitle.customTitle || ''}
            placeholder='enter custom title'
            name='customTitle'
            onChange={handleChange}
          />
        : <Input
            value={suggestedTitle}
            placeholder='[date] + [event type]'
            disabled
          />}
    </ThemeProvider>
  )
}
export default PlaylistTitle
export { SUGGESTED, CUSTOM }

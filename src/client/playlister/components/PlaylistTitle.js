import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { BaseCard } from './BaseCard'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'

const PlaylistTitle = ({ eventData, playlistTitle, setPlaylistTitle }) => {
  const suggestedTitle = () => eventData.inferredDate ? `${eventData.inferredDate} ${eventData.eventType}` : ''

  const handleChange = (evt) => {
    const value = evt.target.value
    setPlaylistTitle({
      ...value,
      [evt.target.name]: value
    })
  }

  const themeOverrides = () =>
    playlistTitle.titleChoice === 'suggested' && eventData.inferredDate
      ? ({
          colors: { inputTextDisabled: 'black' }
        })
      : {}

  return (
    <ThemeProvider
      theme={createTheme(lightThemePrimitives, themeOverrides())}
    >
      <BaseCard title='Playlist Title'>
        <RadioGroup
          value={playlistTitle.titleChoice}
          name='titleChoice'
          onChange={handleChange}
          align={ALIGN.horizontal}
        >
          <Radio value='suggested'>Suggested &nbsp;</Radio>
          <Radio value='custom'>Custom</Radio>
        </RadioGroup>
        {playlistTitle.titleChoice === 'custom'
          ? <Input
              value={playlistTitle.customTitle || ''}
              placeholder='enter custom title'
              name='customTitle'
              onChange={handleChange}
            />
          : <Input
              value={suggestedTitle()}
              placeholder='[date] + [event type]'
              disabled
            />}
      </BaseCard>
    </ThemeProvider>
  )
}
export default PlaylistTitle

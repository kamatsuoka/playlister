import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React from 'react'
import { Input } from 'baseui/input'
import { BaseCard } from './BaseCard'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Combobox } from 'baseui/combobox'
import inferDate from './InferredDate'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistTitle = ({ eventData, setEventData, fileDataList, suggestedTitle, playlistTitle, setPlaylistTitle }) => {
  const handlePlaylistTitleChange = (evt) => {
    setPlaylistTitle({
      ...playlistTitle,
      [evt.target.name]: evt.target.value
    })
  }

  const handleEventDataChange = (evt) => {
    setEventData({
      ...eventData,
      [evt.target.name]: evt.target.value
    })
  }

  const themeOverrides = () =>
    playlistTitle.titleChoice === SUGGESTED && suggestedTitle
      ? ({ colors: { inputTextDisabled: 'black' } })
      : {}

  return (
    <ThemeProvider
      theme={createTheme(lightThemePrimitives, themeOverrides())}
    >
      <RadioGroup
        value={playlistTitle.titleChoice}
        name='titleChoice'
        onChange={handlePlaylistTitleChange}
        align={ALIGN.horizontal}
      >
        <Radio value={SUGGESTED}>Suggested &nbsp;</Radio>
        <Radio value={CUSTOM}>Custom</Radio>
      </RadioGroup>
      {playlistTitle.titleChoice === 'custom'
        ? <Input
            value={playlistTitle.customTitle || ''}
            placeholder='enter custom title'
            name='customTitle'
            onChange={handlePlaylistTitleChange}
          />
        : <Input
            value={suggestedTitle}
            placeholder='[date] + [event type]'
            disabled
          />}
      <BaseCard title='Event Data'>
        <FlexGrid
          flexGridColumnCount={2}
          flexGridColumnGap='scale800'
          flexGridRowGap='scale800'
        >
          <FlexGridItem>
            <FormControl label='event date'>
              <Input
                value={eventData.eventDate || inferDate(fileDataList)}
                name='eventDate'
                onChange={handleEventDataChange}
              />
            </FormControl>
          </FlexGridItem>
          <FlexGridItem>
            <FormControl label='event type'>
              <Combobox
                value={eventData.eventType}
                name='eventType'
                onChange={handleEventDataChange}
                options={['rehearsal', 'coaching']}
                mapOptionToString={option => option}
              />
            </FormControl>
          </FlexGridItem>
        </FlexGrid>
      </BaseCard>
    </ThemeProvider>
  )
}
export default PlaylistTitle
export { SUGGESTED, CUSTOM }

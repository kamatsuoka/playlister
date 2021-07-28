import React from 'react'
import { BaseCard } from './BaseCard'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import inferDate from './InferredDate'
import { Combobox } from 'baseui/combobox'

const EventData = ({ files, eventData, setEventData }) => {
  const handleChange = (evt) => {
    setEventData({
      ...eventData,
      [evt.target.name]: evt.target.value
    })
  }

  return (
    <BaseCard title='Event Data'>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem>
          <FormControl label='event date'>
            <Input
              value={eventData.eventDate || inferDate(files)}
              name='eventDate'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem>
          <FormControl label='event type'>
            <Combobox
              value={eventData.eventType}
              name='eventType'
              onChange={handleChange}
              options={['rehearsal', 'coaching', 'performance']}
              mapOptionToString={option => option}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
    </BaseCard>
  )
}

export default EventData

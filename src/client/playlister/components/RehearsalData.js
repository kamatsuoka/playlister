import React from 'react'
import { FormControl } from 'baseui/form-control'
import { Combobox } from 'baseui/combobox'
import { Input } from 'baseui/input'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { BaseCard } from './BaseCard'

const RehearsalData = ({ inferredDate, value, setValue }) => {

  return (
    <BaseCard title='Rehearsal Data'>
      <FlexGrid flexGridColumnCount={2}
                flexGridColumnGap='scale800'
                flexGridRowGap='scale800'
      >
        <FlexGridItem><FormControl label='inferred date'>
          <Input disabled value={inferredDate.date || ''}/>
        </FormControl></FlexGridItem>
        <FlexGridItem><FormControl label="event type">
          <Combobox
            value={value.eventType}
            onChange={eventType => setValue({...value, eventType: eventType})}
            options={["rehearsal", "coaching"]}
            mapOptionToString={option => option}
          />
        </FormControl>
        </FlexGridItem>
      </FlexGrid>
    </BaseCard>
  )
}

export default RehearsalData

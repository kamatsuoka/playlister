import React from 'react'
import {FormControl} from "baseui/form-control"
import {Cell, Grid} from "baseui/layout-grid"
import {Combobox} from "baseui/combobox"
import dayjs from "dayjs"

const inferredDate = (startEndList) => {
  const dateSet = new Set()
  startEndList.map(f => dayjs(f.startTime)
    .format("YYYY-MM-DD"))
    .forEach(d => dateSet.add(d))
  return dateSet.size > 0 ? dateSet.values().next().value : ''
}

const RehearsalData = ({startEndList, value, setValue}) => {

  return (
    <Grid>
      <Cell span={[1, 2, 3]}>
        <FormControl label="inferred date">
          <label>{inferredDate(startEndList)}</label>
        </FormControl>
      </Cell>
      <Cell span={[1, 2, 3]}>
        <FormControl label="event type">
          <Combobox
            value={value.eventType}
            onChange={eventType => setValue({...value, eventType: eventType})}
            options={["rehearsal", "coaching"]}
            mapOptionToString={option => option}
          />
        </FormControl>
      </Cell>
    </Grid>
  )
}

export {inferredDate, RehearsalData}

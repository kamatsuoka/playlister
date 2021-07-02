import React, {useEffect} from 'react'
import {Input} from "baseui/input"
import {FormControl} from "baseui/form-control"
import {Cell, Grid} from "baseui/layout-grid"
import {Combobox} from "baseui/combobox"
import {Heading} from "baseui/heading"


const PlaylistSettings = ({value, setValue}) => {

  const getDefaultTitle = () => {
    const d = value.date
    if (d) {
      return d.replaceAll('-', '') + ' ' + value.eventType
    } else {
      return value.eventType
    }
  }

  useEffect(() => {
    if (!value.title) setValue({...value, title: getDefaultTitle()})
  })

  return (
    <React.Fragment>
      <Heading styleLevel={6}>Playlist</Heading>
      <Grid>
        <Cell span={[1, 2, 3]}>
          <FormControl label="date">
            <Input
              value={value.date || ''}
              onChange={e => setValue({...value, date: e.target.value})}
            />
          </FormControl>
        </Cell>
        <Cell span={[1, 2, 3]}>
          <FormControl label="event type">
            <Combobox
              value={value.eventType}
              onChange={e => setValue({...value, eventType: e.target.value})}
              options={["rehearsal", "coaching"]}
              mapOptionToString={option => option}
            />
          </FormControl>
        </Cell>
        <Cell span={[2, 3, 4]}>
          <FormControl label="title">
            <Input
              value={value.title || ''}
              onChange={e => setValue({...value, title: e.target.value})}
            />
          </FormControl>
        </Cell>
      </Grid>
    </React.Fragment>
  )
}

export default PlaylistSettings

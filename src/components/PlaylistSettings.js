import React, {useEffect} from 'react'
import {Input} from "baseui/input"
import {FormControl} from "baseui/form-control"
import {Cell, Grid} from "baseui/layout-grid"
import {Combobox} from "baseui/combobox"
import {createTheme, lightThemePrimitives, ThemeProvider} from "baseui"
import {Heading} from "baseui/heading"


const PlaylistSettings = ({value, setValue}) => {

  const getDefaultPlaylistName = () => {
    const d = value.date
    if (d) {
      return d.replaceAll('-', '') + ' ' + value.eventType
    } else {
      return value.eventType
    }
  }

  useEffect(() => {
    if (!value.playlistName) setValue({...value, playlistName: getDefaultPlaylistName()})
  })

  return (
    <ThemeProvider
      theme={createTheme(lightThemePrimitives, {
        colors: {inputTextDisabled: 'black'}
      })}
    >
      <Grid>
        <Cell span={[1, 2, 3]}>
          <FormControl label="date">
            <Input
              value={value.date}
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
          <FormControl label="playlist name">
            <Input
              value={value.playlistName}
              onChange={e => setValue({...value, playlistName: e.target.value})}
              disabled={true}
            />
          </FormControl>
        </Cell>
      </Grid>
      <Heading styleLevel={6}>Track Naming</Heading>
      <Grid>
        <Cell span={[1, 2, 2]}>
          <FormControl label="prefix">
            <Input
              value={value.prefix}
              onChange={e => setValue({...value, prefix: e.target.value})}
            />
          </FormControl>
        </Cell>
        <Cell span={[2, 3, 4]}>
          <FormControl label="camera view">
            <Combobox
              value={value.cameraView}
              onChange={e => setValue({...value, cameraView: e.target.value})}
              options={["chorus", "director", "corner", "elevated"]}
              mapOptionToString={option => option}
            />
          </FormControl>
        </Cell>
      </Grid>
    </ThemeProvider>
  )
}

export default PlaylistSettings

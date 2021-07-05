import React from 'react'
import {Input} from "baseui/input"
import {FormControl} from "baseui/form-control"
import {Cell, Grid} from "baseui/layout-grid"
import {Combobox} from "baseui/combobox"
import {BaseCard} from "./BaseCard"


const VideoNaming = ({playlistSettings, value, setValue}) => {

  return (
    <BaseCard title="Video Naming">
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
              onChange={e => setValue({...value, cameraView: e})}
              options={["chorus", "director", "corner", "elevated"]}
              mapOptionToString={option => option}
            />
          </FormControl>
        </Cell>
        <Cell span={[1, 2, 2]}>
          <FormControl label="next index">
            <Input
              value={(playlistSettings.itemCount || 0) + 1}
              type="number"
              disabled
            />
          </FormControl>
        </Cell>
        <Cell span={[1, 2, 2]}>
          <FormControl label="index offset">
            <Input
              value={value.indexOffset}
              type="number"
              min={-(playlistSettings.itemCount || 0)}
              onChange={e => setValue({...value, indexOffset: e.target.value})}
            />
          </FormControl>
        </Cell>
      </Grid>
    </BaseCard>
  )
}

export default VideoNaming

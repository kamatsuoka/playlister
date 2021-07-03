import React from 'react'
import {Input} from "baseui/input"
import {FormControl} from "baseui/form-control"
import {Cell, Grid} from "baseui/layout-grid"
import {Combobox} from "baseui/combobox"


const VideoNameSettings = ({value, setValue}) => {

  return (
    <React.Fragment>
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
      </Grid>
    </React.Fragment>
  )
}

export default VideoNameSettings

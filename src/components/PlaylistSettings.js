import {Input} from "baseui/input"
import {FormControl} from "baseui/form-control"
import dayjs from "dayjs"
import {Cell, Grid} from "baseui/layout-grid"

const PlaylistSettings = ({startEndList, value, setValue}) => {

  // If video dates are all the same, use that as default
  const dateSet = new Set()
  startEndList.map(f => dayjs(f.startTime)
    .format("YYYY-MM-DD"))
    .forEach(d => dateSet.add(d))
  const defaultDate = dateSet.size === 1 ? dateSet.values().next().value : null

  return (
    <Grid>
      <Cell span={[1, 2, 3]}>
        <FormControl label="prefix">
          <Input
            value={value.prefix}
            onChange={e => setValue({...value, prefix: e.target.value})}
          />
        </FormControl>
      </Cell>
      <Cell span={[1, 2, 3]}>
        <FormControl label="date">
          <Input
            value={value.hasOwnProperty('date') ? value.date : ''}
            onChange={e => setValue({...value, date: e.target.value})}
            placeholder={defaultDate}
          />
        </FormControl>
      </Cell>
      <Cell span={[1, 2, 3]}>
        <FormControl label="camera view">
          <Input
            value={value.cameraView}
            onChange={e => setValue({...value, cameraView: e.target.value})}
          />
        </FormControl>
      </Cell>
      <Cell span={[1, 2]}>
        <FormControl label="starting index">
          <Input
            value={value.startIndex}
            onChange={e => setValue({...value, startIndex: e.target.value})}
          />
        </FormControl>
      </Cell>
    </Grid>
  )
}

export default PlaylistSettings

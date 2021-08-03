import React from 'react'
import { FormControl } from 'baseui/form-control'
import { Combobox } from 'baseui/combobox'
import { BaseCard } from './BaseCard'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'

const VideoNaming = ({ videoNaming, setVideoNaming }) => {
  const handleChange = (evt) => {
    setVideoNaming({
      ...videoNaming,
      [evt.target.name]: evt.target.value
    })
  }

  const itemProps = {
    overrides: {
      Block: {
        style: ({ $theme }) => ({
          width: $theme.sizing.scale3200,
          flexGrow: 0.5
        })
      }
    }
  }

  return (
    <BaseCard title='Video Naming'>
      <FlexGrid
        flexGridColumnCount={4}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem {...itemProps}>
          <FormControl label='default camera view'>
            <Combobox
              value={videoNaming.cameraView}
              name='cameraView'
              options={['chorus', 'director', 'corner', 'elevated']}
              mapOptionToString={option => option}
              onChange={cameraView => setVideoNaming({ ...videoNaming, cameraView: cameraView })}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
    </BaseCard>
  )
}

export default VideoNaming

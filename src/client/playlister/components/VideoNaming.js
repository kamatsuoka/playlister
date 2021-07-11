import React from 'react'
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import { Combobox } from 'baseui/combobox'
import { BaseCard } from './BaseCard'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'

const VideoNaming = ({ playlistSettings, value, setValue }) => {
  const handleChange = (evt) => {
    const value = evt.target.value
    setValue({
      ...value,
      [evt.target.name]: value
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
          <FormControl label='prefix'>
            <Input
              value={value.prefix}
              name='prefix'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemProps}>
          <FormControl label='camera view'>
            <Combobox
              value={value.cameraView}
              name='cameraView'
              options={['chorus', 'director', 'corner', 'elevated']}
              mapOptionToString={option => option}
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemProps}>
          <FormControl label='next index'>
            <Input
              value={(playlistSettings.itemCount || 0) + 1}
              type='number'
              disabled
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemProps}>
          <FormControl label='index offset'>
            <Input
              value={value.indexOffset}
              type='number'
              name='indexOffset'
              min={-(playlistSettings.itemCount || 0)}
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
    </BaseCard>
  )
}

export default VideoNaming

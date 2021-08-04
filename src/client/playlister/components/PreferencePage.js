/**
 * Stores preferences that aren't expected to change too often
 */
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import React from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Combobox } from 'baseui/combobox'
import { copyData, usePersist } from '../hooks/usePersist'
import { useStyletron } from 'baseui'

const PreferencePage = ({
  orgInfo, setOrgInfo, password, setPassword,
  eventData, setEventData, cameraInfo, setCameraInfo,
  defaultCameraView, setDefaultCameraView
}) => {
  const [, theme] = useStyletron()
  const handleChange = (evt, setValues) => {
    const value = evt.target.value
    setValues(values => ({
      ...values,
      [evt.target.name]: value
    }))
  }

  const ORG_DATA_KEY = 'org_info'
  usePersist({
    key: ORG_DATA_KEY,
    onRestore: copyData,
    setState: setOrgInfo,
    state: orgInfo
  })

  const CAMERA_DATA_KEY = 'camera_info'
  usePersist({
    key: CAMERA_DATA_KEY,
    onRestore: copyData,
    setState: setCameraInfo,
    state: cameraInfo
  })

  return (
    <FlexGrid
      flexGridColumnCount={2}
      flexGridColumnGap='scale800'
      flexGridRowGap='scale800'
      width={`calc(${theme.sizing.scale4800} * 4)`}
    >
      <FlexGridItem>
        <FormControl label='organization' caption="short form of your organization's name">
          <Input
            value={orgInfo.orgName || ''}
            name='orgName'
            onChange={evt => handleChange(evt, setOrgInfo)}
            required
          />
        </FormControl>
      </FlexGridItem>
      <FlexGridItem>
        <FormControl label='password'>
          <Input
            value={password || ''}
            onChange={setPassword}
          />
        </FormControl>
      </FlexGridItem>
      <FlexGridItem>
        <FormControl label='event type' caption='the type of event you recorded'>
          <Combobox
            value={eventData.eventType}
            onChange={value => setEventData({ ...eventData, eventType: value })}
            options={['rehearsal', 'coaching', 'performance']}
            mapOptionToString={option => option}
          />
        </FormControl>
      </FlexGridItem>
      <FlexGridItem>
        <FormControl label='default camera view' caption='what the camera was mostly facing'>
          <Combobox
            value={defaultCameraView}
            name='cameraView'
            options={['chorus', 'corner', 'director', 'elevated']}
            mapOptionToString={option => option}
            onChange={setDefaultCameraView}
          />
        </FormControl>
      </FlexGridItem>
      <FlexGridItem>
        <FormControl label='camera number' caption='cameras are numbered 1-N'>
          <Input
            value={cameraInfo.cameraNumber || ''}
            name='cameraNumber'
            type='number'
            min={1}
            max={9}
            onChange={evt => handleChange(evt, setCameraInfo)}
            required
          />
        </FormControl>
      </FlexGridItem>
      <FlexGridItem>
        <FormControl label='camera name' caption='name or type of camera you used'>
          <Combobox
            value={cameraInfo.cameraName || ''}
            onChange={value => setCameraInfo({ ...cameraInfo, cameraName: value })}
            options={['q2n4k', 'q2n', 'iPhone']}
            mapOptionToString={option => option}
          />
        </FormControl>
      </FlexGridItem>
    </FlexGrid>
  )
}

export default PreferencePage

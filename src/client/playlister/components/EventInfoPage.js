/**
 * Stores preferences that aren't expected to change too often
 */
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import React from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Combobox } from 'baseui/combobox'
import { useStyletron } from 'baseui'
import { copyData, usePersist } from '../hooks/usePersist'
import PrevNextButtons from './PrevNextButtons'
import { toaster, ToasterContainer } from 'baseui/toast'
import { Button, KIND, SIZE } from 'baseui/button'
import { Heading } from 'baseui/heading'

export const BASE_SHEETS_URL = 'https://www.youtube.com/'

const EventInfoPage = ({
  current, setCurrent, orgInfo, setOrgInfo,
  eventData, setEventData, cameraInfo, setCameraInfo
}) => {
  const [css, theme] = useStyletron()

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

  const allFilled = () =>
    orgInfo.orgName && eventData.eventType && cameraInfo.defaultCameraView &&
      cameraInfo.cameraNumber && cameraInfo.cameraName

  const warnToast = (
    <>
      <div className={css({ fontSize: theme.typography.DisplayLarge, marginBottom: theme.sizing.scale600 })}>
        Please fill out all required fields
      </div>
      <Button
        kind={KIND.secondary} size={SIZE.mini} onClick={() => setCurrent(current + 1)}
        overrides={{ Root: { style: ({ float: 'right' }) } }}
      >
        Go forward anyway
      </Button>
    </>
  )

  const warnFields = () => toaster.negative(warnToast, ({
    autoHideDuration: 2000,
    overrides: {
      Body: {
        style: ({
          width: 'fit-content'

        })
      },
      CloseIcon: {
        style: ({
          display: 'none'
        })
      }
    }
  }))

  return (
    <>
      <Heading styleLevel={5}>Event Info</Heading>
      <FlexGrid
        flexGridColumnCount={3}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale400'
        width={`calc(${theme.sizing.scale4800} * 4)`}
      >
        <FlexGridItem>
          <FormControl label='organization' caption="short form of your organization's name">
            <Input
              value={orgInfo.orgName || ''}
              name='orgName'
              onChange={evt => handleChange(evt, setOrgInfo)}
              positive={orgInfo.orgName}
              error={!orgInfo.orgName}
              required
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
              positive={eventData.eventType}
              error={!eventData.eventType}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem />
        <FlexGridItem>
          <FormControl label='default camera view' caption='what camera was mostly facing'>
            <Combobox
              value={cameraInfo.defaultCameraView || ''}
              name='cameraView'
              options={['chorus', 'corner', 'director', 'elevated']}
              mapOptionToString={option => option}
              onChange={value => setCameraInfo({ ...cameraInfo, defaultCameraView: value })}
              positive={cameraInfo.defaultCameraView}
              error={!cameraInfo.defaultCameraView}
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
              positive={cameraInfo.cameraNumber}
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
              positive={cameraInfo.cameraName}
              error={!cameraInfo.cameraName}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
      <ToasterContainer>
        <PrevNextButtons
          current={current} setCurrent={setCurrent}
          nextProps={{
            onClick: () => allFilled() ? setCurrent(current + 1) : warnFields()
          }}
        />
      </ToasterContainer>
    </>
  )
}

export default EventInfoPage

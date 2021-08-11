/**
 * Stores preferences that aren't expected to change too often
 */
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import React, { useState } from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Combobox } from 'baseui/combobox'
import { useStyletron } from 'baseui'
import { copyData, usePersist } from '../hooks/usePersist'
import PrevNextButtons from './PrevNextButtons'
import { toaster, ToasterContainer } from 'baseui/toast'
import { Button, KIND, SIZE } from 'baseui/button'
import GoogleSheetInfo from './GoogleSheetInfo'
import BaseCard from './BaseCard'
import { Paragraph3 } from 'baseui/typography'

export const BASE_SHEETS_URL = 'https://www.youtube.com/'

const SetupPage = ({
  current, setCurrent, orgInfo, setOrgInfo, password, setPassword,
  eventData, setEventData, cameraInfo, setCameraInfo,
  spreadsheetInfo, setSpreadsheetInfo, tailed, setTailed
}) => {
  const [css, theme] = useStyletron()
  const [tail, setTail] = useState([])
  const [storeKey, setStoreKey] = useState(false)

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

  const SPREADSHEET_DATA_KEY = 'spreadsheet_info'
  usePersist({
    key: SPREADSHEET_DATA_KEY,
    onRestore: copyData,
    setState: setSpreadsheetInfo,
    state: spreadsheetInfo
  })

  const STORE_PASSWORD_DATA_KEY = 'store_password_info'
  usePersist({
    key: STORE_PASSWORD_DATA_KEY,
    onRestore: copyData,
    setState: setStoreKey,
    state: storeKey
  })

  const PASSWORD_DATA_KEY = 'password_info'
  usePersist({
    key: PASSWORD_DATA_KEY,
    onRestore: copyData,
    setState: setPassword,
    state: password,
    enabled: storeKey
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
      <BaseCard title='Event / Camera Info'>
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
      </BaseCard>
      <BaseCard title='Google Sheet'>
        <Paragraph3>
          This sheet will hold the video metadata. Make sure you have access to it by clicking
          the search icon.
        </Paragraph3>

        <GoogleSheetInfo
          spreadsheetInfo={spreadsheetInfo} setSpreadsheetInfo={setSpreadsheetInfo}
          tailed={tailed} setTailed={setTailed} tail={tail} setTail={setTail} baseUrl={BASE_SHEETS_URL}
        />
      </BaseCard>
      <ToasterContainer>
        <PrevNextButtons
          current={current} setCurrent={setCurrent}
          nextProps={{
            onClick: () => allFilled() ? setCurrent(current + 1) : warnFields(),
            disabled: !tailed,
            title: tailed ? '' : 'click the search icon to verify your access to the google sheet'
          }}
        />
      </ToasterContainer>
    </>
  )
}

export default SetupPage

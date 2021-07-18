import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import FileDataList from './FileDataList'
import { FormControl } from 'baseui/form-control'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Input } from 'baseui/input'
import MetadataReader from './MetadataReader'
import { BaseCard } from './BaseCard'
import { KIND as NKind, Notification } from 'baseui/notification'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const FileDataPage = ({
  metadataList, setMetadataList,
  fileDataList, setFileDataList,
  timeAdjust, setTimeAdjust, prevNextButtons
}) => {
  const [metadataErrors, setMetadataErrors] = useState([])
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  const timeOffset = (name, max) => (
    <FlexGridItem>
      <FormControl label={name}>
        <Input
          value={timeAdjust[name] || 0}
          type='number'
          min={-max}
          max={max}
          name={name}
          onChange={(evt) => {
            setTimeAdjust({
              ...timeAdjust,
              [evt.target.name]: parseInt(evt.target.value)
            })
          }}
          overrides={{
            Root: {
              style: ({ $theme }) => ({
                height: $theme.sizing.scale1000
              })
            }
          }}
        />
      </FormControl>
    </FlexGridItem>
  )

  function filesAndOffset () {
    return (
      <>
        <FileDataList
          metadataList={metadataList} setMetadataList={setMetadataList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          fileDataList={fileDataList} setFileDataList={setFileDataList}
        />
        <BaseCard title='Time Adjustments'>
          <TimezoneOverride metadata={metadataList} value={overrideTimeZone} setValue={setOverrideTimeZone} />
          Offsets
          <FlexGrid flexGridColumnCount={6} flexGridColumnGap='scale400' flexGridRowGap='scale200'>
            {timeOffset('year', 2000)}
            {timeOffset('month', 11)}
            {timeOffset('day', 30)}
            {timeOffset('hour', 23)}
            {timeOffset('minute', 59)}
            {timeOffset('second', 59)}
          </FlexGrid>
        </BaseCard>
      </>
    )
  }

  const errorTable = () => {
    if (metadataErrors.length > 0) {
      return (
        <>
          <Notification kind={NKind.negative} closeable overrides={{ Body: { style: { width: 'auto' } } }}>
            <ul>
              {metadataErrors.map((e, i) => <li key={i}>{e.name}: invalid media file</li>)}
            </ul>
          </Notification>
        </>
      )
    } else {
      return null
    }
  }

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} setMetadataErrors={setMetadataErrors} />
      {errorTable()}
      {metadataList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons}
    </>
  )
}

export default FileDataPage

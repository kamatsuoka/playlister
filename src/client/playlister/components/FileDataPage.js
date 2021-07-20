import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import FileDataList from './FileDataList'
import { FormControl } from 'baseui/form-control'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Input } from 'baseui/input'
import MediaReader from './MediaReader'
import { BaseCard } from './BaseCard'
import { KIND as NKind, Notification } from 'baseui/notification'
import { Paragraph3 } from 'baseui/typography'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const FileDataPage = ({
  mediaList, setMediaList,
  fileDataList, setFileDataList,
  timeAdjust, setTimeAdjust, prevNextButtons
}) => {
  /**
   * fileDataList items:
   * - fileId
   * - name
   * - startTime
   * - duration
   * - endTime
   */
  const [mediaErrors, setMediaErrors] = useState([])
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
        <BaseCard title=''>
          <FlexGrid flexGridColumnCount={2}>
            <FlexGridItem>Time Adjustments</FlexGridItem>
            <FlexGridItem>
              <TimezoneOverride mediaList={mediaList} value={overrideTimeZone} setValue={setOverrideTimeZone} />
            </FlexGridItem>
          </FlexGrid>
          <FlexGrid flexGridColumnCount={7} flexGridColumnGap='scale400' flexGridRowGap='scale200'>
            <FlexGridItem>Offsets</FlexGridItem>
            {timeOffset('year', 2000)}
            {timeOffset('month', 11)}
            {timeOffset('day', 30)}
            {timeOffset('hour', 23)}
            {timeOffset('minute', 59)}
            {timeOffset('second', 59)}
          </FlexGrid>
        </BaseCard>
        <Paragraph3>
          Take a look at the start and end times below and make sure they match
          what you expect. <br /> If they need adjusting, you can use the time adjustments above.
        </Paragraph3>
        <FileDataList
          mediaList={mediaList} setMediaList={setMediaList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          fileDataList={fileDataList} setFileDataList={setFileDataList}
        />
      </>
    )
  }

  const errorTable = () => {
    if (mediaErrors.length > 0) {
      return (
        <>
          <Notification kind={NKind.negative} closeable overrides={{ Body: { style: { width: 'auto' } } }}>
            <ul>
              {mediaErrors.map((e, i) => <li key={i}>{e.filename}: invalid media file</li>)}
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
      <MediaReader setMediaList={setMediaList} setMediaErrors={setMediaErrors} />
      {errorTable()}
      {mediaList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons}
    </>
  )
}

export default FileDataPage

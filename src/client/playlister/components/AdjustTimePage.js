import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { FormControl } from 'baseui/form-control'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Input } from 'baseui/input'
import MetadataReader from './MetadataReader'
import { BaseCard } from './BaseCard'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const AdjustTimePage = ({
  metadataList, setMetadataList, setMetadataErrors,
  startEndList, setStartEndList,
  timeAdjust, setTimeAdjust, prevNextButtons
}) => {
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
        <StartEndList
          metadataList={metadataList} setMetadataList={setMetadataList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          startEndList={startEndList} setStartEndList={setStartEndList}
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

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} setMetadataErrors={setMetadataErrors} />
      {metadataList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons}
    </>
  )
}

export default AdjustTimePage

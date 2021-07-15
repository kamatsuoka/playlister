import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { BaseCard } from './BaseCard'
import { FormControl } from 'baseui/form-control'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Input } from 'baseui/input'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const AdjustTimePage = ({ metadataList, startEndList, setStartEndList, timeAdjust, setTimeAdjust,
  current, prevButton, nextButton }) => {
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  const handleChange = (evt) => {
    setTimeAdjust({
      ...timeAdjust,
      [evt.target.name]: evt.target.value
    })
  }

  const timeOffset = (name, max) => (
    <FlexGridItem>
      <FormControl label={name}>
        <Input
          value={timeAdjust[name] || 0}
          type='number'
          min={-max}
          max={max}
          name={name}
          onChange={handleChange}
        />
      </FormControl>
    </FlexGridItem>
  )

  return (
    <>
      <BaseCard title='Start and End Times'>
        <StartEndList
          metadata={metadataList} overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          startEndList={startEndList} setStartEndList={setStartEndList}
        />
      </BaseCard>
      <BaseCard title='Adjust Times'>
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
      <div align='right'>
        {prevButton(current)}
        &nbsp;
        {nextButton(current)}
      </div>
    </>
  )
}

export default AdjustTimePage

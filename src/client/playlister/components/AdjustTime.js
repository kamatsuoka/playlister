import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { BaseCard } from './BaseCard'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const AdjustTimePage = ({ metadataList, startEndList, setStartEndList, current, prevButton, nextButton }) => {
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  return (
    <>
      <BaseCard title='Start and End Times'>
        <TimezoneOverride metadata={metadataList} value={overrideTimeZone} setValue={setOverrideTimeZone} />
        <StartEndList
          metadata={metadataList} overrideTimeZone={overrideTimeZone}
          startEndList={startEndList} setStartEndList={setStartEndList}
        />
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

import MediaInfoJs from './MediaInfoJs'
import React, { useState } from 'react'
import MetadataList from './MetadataList'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { StyledLink } from 'baseui/link'
import { BaseCard } from './BaseCard'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({
  fileInfo, setFileInfo,
  startEndList, setStartEndList,
  setActiveKey
}) => {
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  return (
    <>
      <MediaInfoJs setResults={setFileInfo}/>
      <BaseCard title="File Metadata">
        <MetadataList values={fileInfo} setValues={setFileInfo}/>
        <div align="right" style={{ marginTop: '10px' }}>
          {startEndList.length === 0 ? null : <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>}
        </div>
      </BaseCard>
      <BaseCard title="Start and End Times">
        <TimezoneOverride fileInfo={fileInfo} value={overrideTimeZone} setValue={setOverrideTimeZone}/>
        <StartEndList
          fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
          startEndList={startEndList} setStartEndList={setStartEndList}
        />
      </BaseCard>
    </>
  )
}

export default FilePage

import MediaInfoJs from './MediaInfoJs'
import React, { useState } from 'react'
import MetadataList from './MetadataList'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { StyledLink } from 'baseui/link'
import { BaseCard } from './BaseCard'
import PlaylistPage from './PlaylistPage'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({
  fileInfo, setFileInfo,
  startEndList, setStartEndList, eventData, setEventData,
  inferredDate, setInferredDate, playlistTitle, setPlaylistTitle,
  playlistSettings, setPlaylistSettings, setActiveKey
}) => {
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  return (
    <>
      <MediaInfoJs setResults={setFileInfo}/>
      <BaseCard title="File Metadata">
        <MetadataList values={fileInfo} setValues={setFileInfo}/>
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>
        </div>
      </BaseCard>
      <BaseCard title="Start and End Times">
        <TimezoneOverride fileInfo={fileInfo} value={overrideTimeZone} setValue={setOverrideTimeZone}/>
        <StartEndList
          fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
          startEndList={startEndList} setStartEndList={setStartEndList}
        />
      </BaseCard>
      <PlaylistPage
        startEndList={startEndList}
        eventData={eventData} setEventData={setEventData}
        inferredDate={inferredDate} setInferredDate={setInferredDate}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
        value={playlistSettings} setValue={setPlaylistSettings}
        setActiveKey={setActiveKey}
      />
    </>
  )
}

export default FilePage

import MediaInfoJs from './MediaInfoJs'
import React, { useCallback, useState } from 'react'
import MetadataList from './MetadataList'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { StyledLink } from 'baseui/link'
import { BaseCard } from './BaseCard'
import { Button, KIND, SIZE } from 'baseui/button'
import { findRecentVideos } from '../youtube/api'
import dayjs from 'dayjs'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({
  fileInfo, setFileInfo,
  uploadStatus, setUploadStatus,
  startEndList, setStartEndList,
  current, prevButton, nextButton
}) => {
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  const checkUploadStatus = useCallback(() => {
    const onSuccess = videos => {
      const dateNow = dayjs()
      const items = videos.items.filter(item =>
        dateNow.diff(dayjs(item.snippet.publishedAt), 'days') < 30
      )
      const uploadedTitles = new Set(items.map(item => item.snippet.title))
      setUploadStatus(
        Object.fromEntries(
          Object.entries(fileInfo)
            .map(([id, metadata]) => [id, uploadedTitles.has(metadata.name)])
        )
      )
    }
    // TODO: show error in UI
    return findRecentVideos(onSuccess, err => console.log(err))
  })

  return (
    <>
      <MediaInfoJs setResults={setFileInfo} />
      <BaseCard title='File Metadata'>
        <MetadataList uploadStatus={uploadStatus} values={fileInfo} setValues={setFileInfo} />
        <div align='right' style={{ marginTop: '10px' }}>
          {startEndList.length === 0 ? null : <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>}
        </div>
        <Button
          size={SIZE.compact} disabled={Object.keys(fileInfo).length === 0}
          onClick={checkUploadStatus}
        >
          Check Upload Status
        </Button>
      </BaseCard>
      <BaseCard title='Start and End Times'>
        <TimezoneOverride fileInfo={fileInfo} value={overrideTimeZone} setValue={setOverrideTimeZone} />
        <StartEndList
          fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
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

export default FilePage

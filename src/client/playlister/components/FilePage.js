import MediaInfoJs from './MediaInfoJs'
import React, { useCallback, useState } from 'react'
import MetadataList from './MetadataList'
import TimezoneOverride from './TimezoneOverride'
import StartEndList from './StartEndList'
import { BaseCard } from './BaseCard'
import { Button, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
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
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      const uploaded = new Set(items.map(item => item.filename))
      setUploadStatus(
        Object.fromEntries(
          Object.entries(fileInfo)
            .map(([id, metadata]) => [id, uploaded.has(metadata.name)])
        )
      )
    }
    const filenames = Object.values(fileInfo).map(meta => meta.name)
    // TODO: show error in UI
    return findUploads(filenames, onSuccess, err => console.log(err))
  })

  return (
    <>
      <MediaInfoJs setResults={setFileInfo} />
      <BaseCard title='File Metadata'>
        <MetadataList uploadStatus={uploadStatus} values={fileInfo} setValues={setFileInfo} />
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

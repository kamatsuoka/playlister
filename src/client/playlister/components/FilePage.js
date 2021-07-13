import MediaInfoJs from './MediaInfoJs'
import React, { useCallback } from 'react'
import MetadataList from './MetadataList'
import { BaseCard } from './BaseCard'
import { Button, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
import dayjs from 'dayjs'
import UploadStatus from './UploadStatus'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({
  fileInfo, setFileInfo,
  uploadStatus, setUploadStatus,
  current, prevButton, nextButton
}) => {
  const checkUploadStatus = useCallback(() => {
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      setUploadStatus(items)
    }
    const filenames = Object.values(fileInfo).map(meta => meta.name)
    // TODO: show error in UI
    return findUploads(filenames, onSuccess, err => console.log(err))
  })

  return (
    <>
      <MediaInfoJs setResults={setFileInfo} />
      <BaseCard title='File Metadata'>
        <MetadataList value={fileInfo} setValue={setFileInfo} />
        <Button style={{marginTop: '10px'}}
          size={SIZE.compact} disabled={Object.keys(fileInfo).length === 0}
          onClick={checkUploadStatus}
        >
          Check Upload Status
        </Button>
      </BaseCard>
      <BaseCard title='Uploaded Videos'>
        <UploadStatus fileInfo={fileInfo} values={uploadStatus} setValues={setUploadStatus}/>
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

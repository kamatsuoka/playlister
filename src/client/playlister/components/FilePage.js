import MetadataReader from './MetadataReader'
import React, { useCallback, useState } from 'react'
import MetadataList from './MetadataList'
import { BaseCard } from './BaseCard'
import { Button, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
import dayjs from 'dayjs'
import UploadStatus from './UploadStatus'
import { KIND, Notification } from 'baseui/notification'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({ metadataList, setMetadataList, uploadStatus, setUploadStatus, current, prevButton, nextButton }) => {
  console.log('FilePage: metadataList = ', metadataList)
  const [error, setError] = useState('')

  const checkUploadStatus = useCallback(() => {
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      setUploadStatus(items)
    }
    return findUploads(metadataList,
      onSuccess,
      err => {
        setError(err)
        console.log(err)
      })
  })

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} />
      <BaseCard title='File Metadata'>
        <MetadataList metadataList={metadataList} setMetadataList={setMetadataList} />
        <Button style={{marginTop: '10px'}}
          size={SIZE.compact} disabled={metadataList.length === 0}
          onClick={checkUploadStatus}
        >
          Check Upload Status
        </Button>
      </BaseCard>
      <BaseCard title='Upload Status'>
        <UploadStatus metadataList={metadataList} values={uploadStatus}/>
      </BaseCard>
      {error
        ? <Notification kind={KIND.negative} closeable>{error}</Notification>
        : null}
      <div align='right'>
        {prevButton(current)}
        &nbsp;
        {nextButton(current)}
      </div>
    </>
  )
}

export default FilePage

import React, { useCallback, useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import FileList from './FileList'
import dayjs from 'dayjs'
import { findUploads } from '../youtube/api'
import { KIND as NKind, Notification } from 'baseui/notification'

/**
 * Page for uploading videos, or finding previously-uploaded videos for same files
 */
const UploadPage = ({ metadataList, uploadStatus, setUploadStatus, current, prevButton, nextButton }) => {
  const [error, setError] = useState('')
  const [allUploaded, setAllUploaded] = useState(false)
  // used to show spinner on 'Check Upload Status' button
  const [checkingStatus, setCheckingStatus] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())

  const checkUploadStatus = useCallback(() => {
    const fileIds = metadataList.map(data => data.fileId)
    setCheckingStatus(true)
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      setUploadStatus(items)
      setCheckedFileIds(new Set(fileIds))
      setCheckingStatus(false)
    }
    return findUploads(metadataList,
      onSuccess,
      err => {
        setError(err)
        console.log(err)
        setCheckingStatus(false)
      })
  }, [metadataList, setCheckingStatus, setUploadStatus])

  const allChecked = () =>
    metadataList.length > 0 &&
    metadataList.map(data => data.fileId).every(fileId => checkedFileIds.has(fileId))

  return (
    <>
      <FileList
        metadataList={metadataList} checkedFileIds={checkedFileIds}
        uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
        setAllUploaded={setAllUploaded}
      />
      {error ? <Notification kind={NKind.negative} closeable>{error}</Notification> : null}
      <div align='left'>
        <Button
          style={{ marginTop: '10px' }}
          size={SIZE.compact} disabled={metadataList.length === 0}
          isLoading={checkingStatus}
          kind={allChecked() ? KIND.secondary : KIND.primary}
          onClick={checkUploadStatus}
        >
          Check Upload Status
        </Button>
      </div>
      <div align='right'>
        {prevButton({ current })}
        &nbsp;
        {nextButton({ current, kind: allUploaded ? KIND.primary : KIND.secondary })}
      </div>
    </>
  )
}

export default UploadPage

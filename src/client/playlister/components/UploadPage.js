import React, { useCallback, useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import UploadList from './UploadList'
import dayjs from 'dayjs'
import { findUploads } from '../youtube/api'
import { StyledLink } from 'baseui/link'
import { Paragraph3 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import prevNextButtons from './PrevNextButtons'

/**
 * Page for uploading videos, or finding previously-uploaded videos for same files
 */
const UploadPage = ({ current, setCurrent, files, uploads, setUploads }) => {
  /**
   * uploads items, keyed by file id:
   * - videoId
   * - title
   * - publishedAt
   * - fileId
   * - filename
   * - startTime
   * - endTime
   */

  // used to show spinner on 'Check Upload Status' button
  const [checkingStatus, setCheckingStatus] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const checkUploadStatus = useCallback(() => {
    const fileIds = files.map(data => data.fileId)
    setCheckingStatus(true)
    const onSuccess = foundUploads => {
      const dateNow = dayjs()
      const recentUploads = foundUploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      ).map(upload => [
        upload.fileData.fileId, {
          videoId: upload.videoId,
          title: upload.title,
          publishedAt: upload.publishedAt,
          ...upload.fileData
        }])
      setUploads(Object.fromEntries(recentUploads))
      setCheckedFileIds(new Set(fileIds))
      setCheckingStatus(false)
    }
    const onFailure = err => {
      showError(err)
      setCheckingStatus(false)
    }

    try {
      return findUploads(files, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }, [enqueue, files, setCheckingStatus, setUploads])

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 &&
    files.map(file => file.fileId).every(fileId => uploadedFileIds.has(fileId))

  const allChecked = files.length > 0 &&
    files.map(file => file.fileId).every(fileId => checkedFileIds.has(fileId))

  return (
    <>
      <Paragraph3>
        You can upload your files to YouTube on this page or by using {' '}
        <StyledLink href='https://www.youtube.com/upload' target='_blank' rel='noopener noreferrer'>
          YouTube's upload page
        </StyledLink>.
        <br />
        Either way, you'll need to check for your uploads by clicking the button below.
      </Paragraph3>
      <UploadList
        files={files} checkedFileIds={checkedFileIds}
        uploads={uploads} setUploads={setUploads}
      />
      <Button
        style={{ marginTop: '10px' }}
        size={SIZE.small} disabled={files.length === 0}
        isLoading={checkingStatus}
        kind={allChecked ? KIND.secondary : KIND.primary}
        onClick={checkUploadStatus}
      >
        Check Upload Status
      </Button>
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: allUploaded ? KIND.primary : KIND.secondary }
      })}
    </>
  )
}

export default UploadPage

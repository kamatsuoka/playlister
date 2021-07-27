import React, { useCallback, useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import UploadList from './UploadList'
import dayjs from 'dayjs'
import { findUploads } from '../youtube/api'
import { StyledLink } from 'baseui/link'
import { Paragraph3 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { showError } from '../util/showError'
import prevNextButtons from './PrevNextButtons'

/**
 * Page for uploading videos, or finding previously-uploaded videos for same files
 */
const UploadPage = ({ current, setCurrent, fileDataList, uploadList, setUploadList }) => {
  /**
   * uploadList items:
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

  const checkUploadStatus = useCallback(() => {
    const fileIds = fileDataList.map(data => data.fileId)
    setCheckingStatus(true)
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const recentUploads = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      ).map(upload => ({
        videoId: upload.videoId,
        title: upload.title,
        publishedAt: upload.publishedAt,
        ...upload.fileData
      }))
      setUploadList(recentUploads)
      setCheckedFileIds(new Set(fileIds))
      setCheckingStatus(false)
    }
    const onFailure = err => {
      showError(enqueue, err)
      console.log(err)
      setCheckingStatus(false)
    }

    try {
      return findUploads(fileDataList, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }, [enqueue, fileDataList, setCheckingStatus, setUploadList])

  const uploadedFileIds = new Set(
    uploadList
      .filter(upload => upload.videoId)
      .map(upload => upload.fileId)
  )

  const allUploaded = fileDataList.length > 0 &&
    fileDataList.map(data => data.fileId).every(fileId => uploadedFileIds.has(fileId))

  const allChecked =
    fileDataList.length > 0 &&
    fileDataList.map(data => data.fileId).every(fileId => checkedFileIds.has(fileId))

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
        fileDataList={fileDataList} checkedFileIds={checkedFileIds}
        uploadList={uploadList} setUploadList={setUploadList}
        // setAllUploaded={setAllUploaded}
      />
      <Button
        style={{ marginTop: '10px' }}
        size={SIZE.compact} disabled={fileDataList.length === 0}
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

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { displayDate, parseDescription } from '../models/dates'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { youtubeTitle } from '../models/renaming'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import UploadWatcher from '../api/youtube/youtube-uploader'
import { Button, KIND, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import ActionButton from './ActionButton'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import { tableOverrides, withCellStyle } from './TableOverrides'
import GreenCheckMark from './GreenCheckMark'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'

const UPLOADING = 'uploading'
const ERROR = 'error'

const UploadVideosStep = ({ files, uploads, setUploads, allUploaded }) => {
  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { password } = useContext(PasswordContext)
  const [uploadButtonState, setUploadButtonState] = useState({})
  // map of fileId to upload progress
  const [uploadProgress, setUploadProgress] = useState({})
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [authToken, setAuthToken] = useState('')

  const checkUploads = useCallback(() => {
    console.log('in checkUploads')
    const fileIds = files.map(data => data.fileId)
    if (fileIds.length === 0) {
      return
    }
    setChecking(true)
    const onSuccess = foundUploads => {
      setUploads(Object.fromEntries(foundUploads.map(upload => [
        upload.fileData.fileId, {
          videoId: upload.videoId,
          title: upload.title,
          publishedAt: upload.publishedAt,
          ...upload.fileData,
          ...parseDescription(upload.description)
        }])))
      setCheckedFileIds(new Set(fileIds))
      setChecking(false)
    }
    const onFailure = err => {
      showError(err)
      setChecking(false)
    }

    const fileMap = Object.fromEntries(
      files.map(file => [file.filename, {
        title: youtubeTitle(file.filename),
        fileData: { ...file, file: undefined } // can't send DOM File over wire
      }])
    )

    try {
      return callServer('findUploads', onSuccess, onFailure, ({ password, fileMap }))
    } catch (e) {
      onFailure(e)
    }
  }, [showError, files, setChecking, password, setUploads])

  useEffect(() => {
    if (!allUploaded) {
      return checkUploads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const uploadFile = (file, fileId, startTime, endTime) => {
    const progressHandler = percent => {
      setUploadProgress({ ...uploadProgress, [fileId]: percent })
    }
    const errorHandler = error => {
      setUploadButtonState({ ...uploadButtonState, [fileId]: ERROR })
      showError(error)
    }
    const completeHandler = uploaded => {
      console.log('completeHandler: uploaded = ', uploaded)
      return setUploads(uploads => ({ ...uploads, [fileId]: uploaded }))
    }
    const startUpload = authToken =>
      new UploadWatcher(progressHandler, completeHandler, errorHandler)
        .uploadFile(file, fileId, startTime, endTime, authToken)

    if (authToken) {
      return startUpload(authToken)
    } else {
      const onSuccess = token => {
        setAuthToken(token)
        return startUpload(token)
      }
      return callServer('getToken', onSuccess, errorHandler, {})
    }
  }

  const getButtonContent = fileId => {
    if (!uploadButtonState[fileId]) {
      return '⇧ upload'
    }
    if (uploadButtonState[fileId] === UPLOADING) {
      return ' '
    }
    if (uploadButtonState[fileId] === ERROR) {
      return 'upload error'
    }
  }

  /**
   * Renders:
   * - the published-at date if the file has been uploaded
   * - an upload button if the file's upload status has been checked but it hasn't been uploaded
   * - a spinner if the upload button has been clicked but no progress event has been received
   * - a progress percent if the file is being uploaded and a progress event was received
   *
   * @param row
   * @returns {JSX.Element|string}
   */
  const uploadButton = row => {
    if (uploads[row.fileId] && uploads[row.fileId].publishedAt) {
      return displayDate(uploads[row.fileId].publishedAt)
    }
    if (uploadProgress[row.fileId]) {
      return `${uploadProgress[row.fileId]}%`
    }
    const checked = checkedFileIds.has(row.fileId)
    if (checked) {
      return (
        <Button
          onClick={() => {
            setUploadButtonState({ ...uploadButtonState, [row.fileId]: UPLOADING })
            uploadFile(row.file, row.fileId, row.startTime, row.endTime)
          }}
          title='Upload'
          kind={KIND.tertiary}
          size={SIZE.mini}
          isLoading={uploadButtonState[row.fileId] === UPLOADING}
        >
          {getButtonContent(row.fileId)}
        </Button>
      )
    } else {
      return <FontAwesomeIcon icon={faQuestion} size='sm' title='Check status' />
    }
  }

  const syncColumnOverrides = withCellStyle(({ $theme }) => ({
    textAlign: 'center'
  }))

  const syncButton = (
    <ActionButton
      onClick={checkUploads} spin={checking} title='sync' icon={faSyncAlt}
      borderless disabled={files.length === 0} grayed={allUploaded}
    />
  )

  return (
    <>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn overrides={syncColumnOverrides} header={syncButton}>
          {row => uploads[row.fileId] ? <GreenCheckMark /> : null}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={tableOverrides} header='Filename'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={tableOverrides} header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={tableOverrides} header='Upload Date'>
          {row => uploadButton(row)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={tableOverrides} header='YouTube Title'>
          {row => uploads[row.fileId] ? uploads[row.fileId].title : null}
        </TableBuilderColumn>
      </TableBuilder>
    </>
  )
}

export default UploadVideosStep

import React, { useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/esm/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { tableOverrides } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import UploadWatcher from '../api/youtube/youtube-uploader'
import { displayDate } from '../models/dates'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import GreenCheckMark from './GreenCheckMark'
import { callServer } from '../api/api'

const UPLOADING = 'uploading'
const ERROR = 'error'

/**
 * List of file upload status
 */
const UploadList = ({ files, checkedFileIds, uploads, setUploads }) => {
  // map of fileId to upload button state
  const [uploadButtonState, setUploadButtonState] = useState({})
  // map of fileId to upload progress
  const [uploadProgress, setUploadProgress] = useState({})
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [authToken, setAuthToken] = useState('')

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

  const tableCellStyles = $theme => ({
    verticalAlign: 'center',
    paddingLeft: $theme.sizing.scale200,
    paddingRight: $theme.sizing.scale200,
    paddingTop: $theme.sizing.scale400,
    paddingBottom: $theme.sizing.scale400
  })

  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => {
        return tableCellStyles($theme)
      }
    }
  }

  return (
    <div>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header=''>
          {row => uploads[row.fileId] ? <GreenCheckMark /> : null}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn header='Upload Date' overrides={columnOverrides}>
          {row => uploadButton(row)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='YouTube Title'>
          {row => uploads[row.fileId] ? uploads[row.fileId].title : null}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default UploadList

import React, { useCallback, useEffect, useState } from 'react'
import { displayDate, parseDescription } from '../models/dates'
import { callServer } from '../api/api'
import { youtubeTitle } from '../models/renaming'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import UploadWatcher from '../api/youtube/uploader'
import { Button, KIND, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import ActionButton from './ActionButton'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { tableOverrides, withCellStyle } from './TableOverrides'
import GreenCheckMark from './GreenCheckMark'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { useStyletron } from 'baseui'
import { Block } from 'baseui/block'

const UPLOADING = 'uploading'
const ERROR = 'error'
const COMPLETE = 'complete'

const UploadVideosStep = ({ files, uploads, checkedFileIds, setCheckedFileIds, setUploads, allUploaded }) => {
  const [css, theme] = useStyletron()
  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // map of fileId to upload status
  const [uploading, setUploading] = useState({})
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

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
      return callServer('findUploads', onSuccess, onFailure, ({ fileMap }))
    } catch (e) {
      onFailure(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showError, files, setChecking, setUploads])

  useEffect(() => {
    if (!allUploaded) {
      return checkUploads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const uploadFile = (file, fileId, startTime, endTime) => {
    setUploading(uploading => ({ ...uploading, [fileId]: { state: UPLOADING } }))
    const progressHandler = percent => {
      setUploading(uploading => ({ ...uploading, [fileId]: { ...uploading[fileId], progress: percent } }))
    }
    const errorHandler = error => {
      setUploading(uploading => ({ ...uploading, [fileId]: { ...uploading[fileId], state: ERROR, error } }))
      showError(error)
    }
    const completeHandler = uploaded => {
      console.log('completeHandler: uploaded = ', uploaded)
      setUploading(uploading => ({ ...uploading, [fileId]: { ...uploading[fileId], state: COMPLETE } }))
      return setUploads(uploads => ({ ...uploads, [fileId]: uploaded }))
    }

    return new UploadWatcher(progressHandler, completeHandler, errorHandler)
      .uploadFile(file, fileId, startTime, endTime)
  }

  const getButtonContent = fileId => {
    const status = uploading[fileId]
    if (!status) {
      return '⇧ upload'
    }
    if (status.state === UPLOADING) {
      return ' '
    }
    if (status.state === ERROR) {
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
    if (uploading[row.fileId] && uploading[row.fileId].progress) {
      return `${uploading[row.fileId].progress}%`
    }
    const checked = checkedFileIds.has(row.fileId)
    if (checked) {
      return (
        <Button
          onClick={() => uploadFile(row.file, row.fileId, row.startTime, row.endTime)}
          title='Upload'
          kind={KIND.tertiary}
          size={SIZE.mini}
          isLoading={uploading[row.fileId] && uploading[row.fileId].state === UPLOADING}
        >
          {getButtonContent(row.fileId)}
        </Button>
      )
    } else {
      return <FontAwesomeIcon icon={faQuestion} size='sm' title='Check status' />
    }
  }

  const syncColumnOverrides = withCellStyle(() => ({
    textAlign: 'center'
  }))

  const syncButton = (
    <ActionButton
      onClick={checkUploads} spin={checking} title='sync' icon={faSyncAlt}
      borderless disabled={files.length === 0} grayed={allUploaded}
    />
  )

  // have all files been checked?
  const allChecked = files.map(data => data.fileId).every(id => checkedFileIds.has(id))

  // are any files being uploaded?
  const anyUploading = Object.values(uploading).some(status => status.state === UPLOADING)

  const uploadAll = () => {
    const filesToUpload = files.filter(file => !uploads[file.fileId])
    // noinspection JSIgnoredPromiseFromCall
    filesToUpload.forEach(file => {
      console.log(`uploading file with id: ${file.fileId}`)
      uploadFile(file.file, file.fileId, file.startTime, file.endTime)
    })
  }

  return (
    <>
      <Block className={css({ display: 'flex', alignItems: 'center' })}>
        <ActionButton
          onClick={uploadAll}
          title='upload all videos'
          icon={faUpload}
          spin={anyUploading && !allUploaded}
          disabled={!allChecked}
          grayed={allUploaded}
          text='Upload All'
          className={css({
            float: 'left',
            marginTop: theme.sizing.scale200,
            marginRight: theme.sizing.scale600
          })}
        />
      </Block>
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

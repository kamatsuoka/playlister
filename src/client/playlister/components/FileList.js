import React, { useEffect, useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamation, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import resumableUpload from '../youtube/youtube-uploader'

const UPLOADING = 'uploading'
const ERROR = 'error'

/**
 * List of file info from MediaInfo and video info from youtube
 */
const FileList = ({ metadataList, checkedFileIds, uploadStatus, setUploadStatus, setAllUploaded }) => {
  // map of fileId to upload button state
  const [uploadButtonState, setUploadButtonState] = useState({})
  // map of fileId to upload progress
  const [uploadProgress, setUploadProgress] = useState({})

  /**
   * Set the "all uploaded" state to indicate that all files have been uploaded
   */
  useEffect(() => {
    const uploadedFileIds = new Set(
      uploadStatus
        .filter(status => status.videoId)
        .map(status => status.fileId)
    )
    setAllUploaded(
      metadataList.length > 0 &&
      metadataList.map(data => data.fileId).every(fileId => uploadedFileIds.has(fileId))
    )
  }, [uploadStatus, metadataList, setAllUploaded])

  const uploadData = Object.fromEntries(
    uploadStatus.map(upload =>
      [upload.fileId, {
        videoId: upload.videoId,
        title: upload.title,
        publishedAt: upload.publishedAt,
        thumbnail: upload.thumbnail
      }]
    ))

  const uploadFile = (fileId, file) => {
    const progressHandler = percent => {
      setUploadProgress({ ...uploadProgress, [fileId]: percent })
    }
    const errorHandler = error => {
      setUploadButtonState({ ...uploadButtonState, [fileId]: ERROR })
      console.log(error) // todo: show in UI
    }
    const completeHandler = uploaded => {
      console.log('completeHandler: uploaded = ', uploaded)
      return setUploadStatus(
        uploadStatus
          .filter(status => status.fileId !== fileId)
          .concat(uploaded)
          .sort((a, b) => a.filename > b.filename ? 1 : -1)
      )
    }
    resumableUpload(file, fileId, progressHandler, completeHandler, errorHandler)
  }

  const getButtonContent = fileId => {
    if (!uploadButtonState[fileId]) {
      return '⇧'
    }
    if (uploadButtonState[fileId] === UPLOADING) {
      return ' '
    }
    if (uploadButtonState[fileId] === ERROR) {
      return faExclamation
    }
  }

  /**
   * Renders:
   * - a question icon if the file's upload status hasn't been checked,
   * - an upload button if the file's upload status has been checked but it hasn't been uploaded
   * - a spinner if the upload button has been clicked but no progress event has been received
   * - a progress percent if the file is being uploaded and a progress event was received
   *
   * @param row
   * @returns {JSX.Element|string}
   */
  const uploadButton = row => {
    if (uploadData[row.fileId] && uploadData[row.fileId].title) {
      return <FontAwesomeIcon icon={faCheck} size='sm' title='Uploaded, good job!' />
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
            uploadFile(row.fileId, row.file)
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
      return <FontAwesomeIcon icon={faQuestion} size='sm' title='Check upload status' />
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

  const buttonColumnOverrides = {
    TableBodyCell: {
      style: ({
        textAlign: 'center'
      })
    }
  }

  return (
    <div>
      <TableBuilder data={metadataList} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='YouTube Title'>
          {row => uploadData[row.fileId] ? uploadData[row.fileId].title : null}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At' overrides={columnOverrides}>
          {row => uploadData[row.fileId] ? uploadData[row.fileId].publishedAt : null}
        </TableBuilderColumn>
        <TableBuilderColumn header='Upload' overrides={{ ...columnOverrides, ...buttonColumnOverrides }}>
          {row => uploadButton(row)}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default FileList

import React, { useCallback, useEffect, useState } from 'react'
import {
  StyledTableHead,
  StyledTableHeadCell,
  StyledTableHeadRow,
  TableBuilder,
  TableBuilderColumn
} from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamation, faQuestion, faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import { durationSeconds } from '../util/dates'
import { KIND as NKind, Notification } from 'baseui/notification'
import dayjs from 'dayjs'
import { findUploads } from '../youtube/api'
import resumableUpload from '../youtube/youtube-uploader'
import { withStyle } from 'baseui'

const UPLOADING = 'uploading'
const ERROR = 'error'

/**
 * List of file info from MediaInfo and video info from youtube
 */
const FileList = ({
  metadataList, setMetadataList, metadataErrors,
  uploadStatus, setUploadStatus, setAllUploaded
}) => {
  const [error, setError] = useState('')
  // map of fileId to upload button state
  const [uploadButtonState, setUploadButtonState] = useState({})
  // map of fileId to upload progress
  const [uploadProgress, setUploadProgress] = useState({})
  // used to show spinner on 'Check Upload Status' button
  const [checkingStatus, setCheckingStatus] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())

  const onRemove = useCallback(
    fileId => setMetadataList(datas => datas.filter(data => data.fileId !== fileId)),
    [setMetadataList]
  )

  const durationOverrides = {
    TableHeadCell: {
      style: {
        textAlign: 'right'
      }
    }
  }

  const removeHeader = () => {
    if (metadataList.length === 0) {
      return null
    } else {
      return (
        <Button onClick={() => setMetadataList([])} kind={KIND.tertiary} size={SIZE.mini} title='Remove all'>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      )
    }
  }

  const errorTable = () => {
    if (metadataErrors.length > 0) {
      return (
        <>
          <Notification kind={NKind.negative} closeable overrides={{ Body: { style: { width: 'auto' } } }}>
            <p>Invalid media files:</p>
            <ul>
              {metadataErrors.map((e, i) => <li key={i}>{e.name}</li>)}
            </ul>
          </Notification>
        </>
      )
    } else {
      return null
    }
  }

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

  const removeColumnStyle = {
    style: ({ $theme }) => ({
      textAlign: 'center',
      paddingLeft: $theme.sizing.scale200,
      paddingRight: $theme.sizing.scale200
    })
  }

  const removeColumnOverrides = {
    TableHeadCell: removeColumnStyle,
    TableBodyCell: removeColumnStyle
  }

  const allChecked = () =>
    metadataList.length > 0 &&
    metadataList.map(data => data.fileId).every(fileId => checkedFileIds.has(fileId))

  const HeadCell = withStyle(StyledTableHeadCell, ({ $theme }) => tableCellStyles($theme))

  return (
    <div>
      <TableBuilder
        data={metadataList} overrides={{
          ...tableOverrides,
          TableHead: {
            component: () => (
              <StyledTableHead>
                <StyledTableHeadRow>
                  <HeadCell>&nbsp;</HeadCell>
                  <HeadCell colSpan={3}>Local File</HeadCell>
                  <HeadCell colSpan={3}>YouTube Video</HeadCell>
                </StyledTableHeadRow>
                <StyledTableHeadRow>
                  <HeadCell>{removeHeader()}</HeadCell>
                  <HeadCell>Filename</HeadCell>
                  <HeadCell style={{ textAlign: 'right' }}>Length</HeadCell>
                  <HeadCell>Start Time</HeadCell>
                  <HeadCell>Title</HeadCell>
                  <HeadCell>Published</HeadCell>
                  <HeadCell>Upload</HeadCell>
                </StyledTableHeadRow>
              </StyledTableHead>
            )
          }
        }}
      >
        <TableBuilderColumn overrides={{ ...columnOverrides, ...removeColumnOverrides }}>
          {row =>
            <Button
              onClick={() => onRemove(row.fileId)}
              title='Remove from list'
              kind={KIND.tertiary}
              size={SIZE.mini}
            >
              <FontAwesomeIcon icon={faTimes} size='sm' />
            </Button>}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={{ ...columnOverrides, ...durationOverrides }} header='Duration' numeric>
          {row => durationSeconds(row.duration)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => row.startTime.replace(/^UTC /, '')}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Title'>
          {row => uploadData[row.fileId] ? uploadData[row.fileId].title : null}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At' overrides={columnOverrides}>
          {row => uploadData[row.fileId] ? uploadData[row.fileId].publishedAt : null}
        </TableBuilderColumn>
        <TableBuilderColumn header='Upload' overrides={{ ...columnOverrides, ...buttonColumnOverrides }}>
          {row => uploadButton(row)}
        </TableBuilderColumn>
      </TableBuilder>
      {errorTable()}
      <div align='right'>
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
      {error ? <Notification kind={NKind.negative} closeable>{error}</Notification> : null}
    </div>
  )
}

export default FileList

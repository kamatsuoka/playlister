import React, { useCallback, useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamation, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import dayjs from 'dayjs'
import { Button, KIND, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
import { KIND as NKind, Notification } from 'baseui/notification'
import resumableUpload from '../youtube/youtube-uploader'

const UPLOADING = 'uploading'
const ERROR = 'error'
/**
 * List of files and their upload status
 */
const UploadStatus = ({ metadataList, uploadStatus, setUploadStatus }) => {
  const [error, setError] = useState('')
  // map of fileId to upload button state
  const [uploadButtonState, setUploadButtonState] = useState({})
  // used to show spinner on 'Check Upload Status' button
  const [checkingStatus, setCheckingStatus] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())

  const DATA = metadataList.flatMap(metadata => {
    const filename = metadata.name
    const matchingUploads = uploadStatus.filter(match => match.filename === filename)
    if (matchingUploads.length > 0) {
      return matchingUploads.map(upload => ({
        fileId: metadata.fileId,
        filename: metadata.name,
        videoId: upload.id,
        title: upload.title,
        publishedAt: upload.publishedAt,
        thumbnail: upload.thumbnail,
        file: metadata.file
      }))
    } else {
      return [{
        fileId: metadata.fileId,
        filename: metadata.name,
        file: metadata.file
      }]
    }
  })

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
  })

  const uploadFile = (fileId, file) => {
    const progressHandler = percent => {
      setUploadButtonState({...uploadButtonState, [fileId]: `progress:${percent}`})
    }
    const errorHandler = error => {
      setUploadButtonState({...uploadButtonState, [fileId]: ERROR})
      console.log(error)  // todo: show in UI
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
    resumableUpload(file, progressHandler, completeHandler, errorHandler)
  }

  const getButtonContent = fileId => {
    if (!uploadButtonState[fileId]) {
      return '⇧'
    }
    if (uploadButtonState[fileId] === ERROR) {
      return faExclamation
    }
    if (uploadButtonState[fileId].startsWith('progress')) {
      return uploadButtonState[fileId].split(':')[1] + '%'
    }
  }


  const uploadButton = row => {
    if (row.title) {
      return <FontAwesomeIcon icon={faCheck} size='sm' title='Uploaded, good job!'/>
    } else {
      const checked = checkedFileIds.has(row.fileId)
      if (checked) {
        return (<Button
          onClick={() => {
            setUploadButtonState({ ...uploadButtonState, [row.fileId]: UPLOADING })
            uploadFile(row.fileId, row.file)
          }}
          title='Upload'
          kind={KIND.tertiary}
          size={SIZE.mini}
          disabled={uploadButtonState[row.fileId] === UPLOADING}
        >
          {getButtonContent(row.fileId)}
        </Button>)
      } else {
        return <FontAwesomeIcon icon={faQuestion} size='sm' title='Check upload status'/>
      }
    }

  }

  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => ({
        verticalAlign: 'center',
        paddingLeft: $theme.sizing.scale200,
        paddingTop: $theme.sizing.scale400,
        paddingBottom: $theme.sizing.scale400
      })
    }
  }

  const buttonColumnOverrides = {
    TableBodyCell: {
      style: ({
        textAlign: 'center',
      })
    }
  }

  const uploadStatusTable = () => {
    // only show table if at least one file id has been checked
    const checkedIds = metadataList.map(data => data.fileId).filter(fileId => checkedFileIds.has(fileId))
    if (checkedIds.length > 0) {
      return (<TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header='' overrides={{...columnOverrides, ...buttonColumnOverrides}}
        >
          {row => uploadButton(row) }
        </TableBuilderColumn>
        <TableBuilderColumn header='File Name' overrides={columnOverrides}>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Title' overrides={columnOverrides}>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At' overrides={columnOverrides}>
          {row => row.publishedAt}
        </TableBuilderColumn>
      </TableBuilder>)
    } else {
      return null
    }
  }

  const allChecked = () => metadataList.map(data => data.fileId).every(fileId => checkedFileIds.has(fileId))

  return (
    <>
      {uploadStatusTable()}
      <Button style={{marginTop: '10px'}}
              size={SIZE.compact} disabled={metadataList.length === 0}
              isLoading={checkingStatus}
              kind={allChecked() ? KIND.secondary : KIND.primary}
              onClick={checkUploadStatus}
      >
        Check Upload Status
      </Button>
      {error ? <Notification kind={NKind.negative} closeable>{error}</Notification> : null}
    </>
  )
}

export default UploadStatus

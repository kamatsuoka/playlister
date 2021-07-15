import React, { useCallback, useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import dayjs from 'dayjs'
import { Button, KIND, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
import { KIND as NKind, Notification } from 'baseui/notification'
import resumableUpload from '../youtube/youtube-uploader'

/**
 * List of files and their upload status
 */
const UploadStatus = ({ metadataList, uploadStatus, setUploadStatus }) => {
  const [error, setError] = useState('')
  const [uploadButtonState, setUploadButtonState] = useState({})
  const [uploadChecking, setUploadChecking] = useState('')

  const DATA = metadataList.flatMap(metadata => {
    const filename = metadata.name
    const matchingUploads = uploadStatus.filter(match => match.filename === filename)
    if (matchingUploads.length > 0) {
      return matchingUploads.map(upload => ({
          id: upload.id,
          filename: metadata.name,
          title: upload.title,
          publishedAt: upload.publishedAt,
          thumbnail: upload.thumbnail,
          file: metadata.file
        }))
    } else {
      return [{
        id: metadata.id,
        filename: metadata.name,
        file: metadata.file
      }]
    }
  })

  const checkUploadStatus = useCallback(() => {
    setUploadChecking('checking')
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      setUploadStatus(items)
      setUploadChecking('checked')
    }
    return findUploads(metadataList,
      onSuccess,
      err => {
        setError(err)
        console.log(err)
        setUploadChecking('error')
      })
  })

  const uploadFile = (id, file) => {
    const progressHandler = percent => {
      setUploadButtonState({...uploadButtonState, [id]: `progress:${percent}`})
    }
    const errorHandler = error => {
      setUploadButtonState({...uploadButtonState, [id]: 'error'})
      console.log(error)  // todo: show in UI
    }
    const completeHandler = uploaded => {
      console.log('completeHandler: uploaded = ', uploaded)
      return setUploadStatus(
        uploadStatus
          .filter(s => s.id !== uploaded.id)
          .concat(uploaded)
          .sort((a, b) => a.filename > b.filename ? 1 : -1)
      )
    }
    resumableUpload(file, progressHandler, completeHandler, errorHandler)
  }

  const getButtonContent = id => {
    if (!uploadButtonState[id]) {
      return '⇧'
    }
    if (uploadButtonState[id] === 'error') {
      return '?'
    }
    if (uploadButtonState[id].startsWith('progress')) {
      return uploadButtonState[id].split(':')[1] + '%'
    }
  }


  const uploadButton = row => {
    if (row.title) {
      return <FontAwesomeIcon icon={faCheck} size='sm' />
    } else {
      return (<Button
        onClick={() => {
          setUploadButtonState({...uploadButtonState, [row.id]: 'uploading'})
          uploadFile(row.id, row.file)
        }}
        title='Upload'
        kind={KIND.tertiary}
        size={SIZE.mini}
        // isLoading={uploadButtonState[row.id] === 'uploading'}
        disabled={uploadButtonState[row.id] === 'uploading'}
      >
        {getButtonContent(row.id)}
      </Button>)
    }

  }

  const uploadStatusTable = () => {
    if (uploadChecking === 'checked') {
      return (<TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header=''>
          {row => uploadButton(row) }
        </TableBuilderColumn>
        <TableBuilderColumn header='File Name'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Title'>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At'>
          {row => row.publishedAt}
        </TableBuilderColumn>
      </TableBuilder>)
    } else {
      return null
    }
  }

  return (
    <>
      {uploadStatusTable()}
      <Button style={{marginTop: '10px'}}
              size={SIZE.compact} disabled={metadataList.length === 0 || uploadChecking === 'checking'}
              kind={uploadChecking === 'checked' ? KIND.secondary : KIND.primary}
              onClick={checkUploadStatus}
      >
        Check Upload Status
      </Button>
      {error
        ? <Notification kind={NKind.negative} closeable>{error}</Notification>
        : null}
    </>
  )
}

export default UploadStatus

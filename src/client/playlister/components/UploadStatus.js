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

  const onUploadComplete = useCallback(
    uploaded => {
      const status = {
        id: uploaded.videoId,
        videoTitle: uploaded.title,
        publishedAt: uploaded.publishedAt,
        thumbnail: uploaded.thumbnail
      }
      // TODO: re-sort list
      return setUploadStatus(uploadStatus.filter(s => s.id !== status.id).concat(status))
    },
    [setUploadStatus]
  )

  const DATA = metadataList.flatMap(metadata => {
    const filename = metadata.name
    const matchingUploads = uploadStatus.filter(match => match.filename === filename)
    if (matchingUploads.length > 0) {
      return matchingUploads.map(upload => ({
          id: upload.id,
          filename: metadata.name,
          videoTitle: upload.title,
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
    const onSuccess = uploads => {
      const dateNow = dayjs()
      const items = uploads.filter(upload =>
        dateNow.diff(dayjs(upload.publishedAt), 'days') < 30
      )
      setUploadStatus(items)
    }
    return findUploads(metadataList,
      onSuccess,
      err => {
        setError(err)
        console.log(err)
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
      const status = {
        id: uploaded.videoId,
        filename: file.name,
        videoTitle: uploaded.title,
        publishedAt: uploaded.publishedAt,
        thumbnail: uploaded.thumbnail,
        file: file
      }
      // TODO: re-sort list
      return setUploadStatus(uploadStatus.filter(s => s.id !== status.id).concat(status))
    }
    resumableUpload(file, progressHandler, onUploadComplete, errorHandler)

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
    if (row.videoTitle) {
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

  return (
    <>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header=''>
          {row => uploadButton(row) }
        </TableBuilderColumn>
        <TableBuilderColumn header='File Name'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Title'>
          {row => row.videoTitle}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At'>
          {row => row.publishedAt}
        </TableBuilderColumn>
        <TableBuilderColumn header='Thumbnail'>
          {row => <img alt='' src={row.thumbnail}/>}
        </TableBuilderColumn>
{/*
        <TableBuilderColumn header='Uploaded'>
          {row => statusIcon(row)}
        </TableBuilderColumn>
        <TableBuilderColumn header=''>
          {row =>
            <Button
              onClick={() => {
                uploadFile(row.file)
              }}
              title='Upload'
              kind={KIND.tertiary}
              size={SIZE.mini}
              disabled={isUndefined(row)}
            >
              ⇧
            </Button>}
        </TableBuilderColumn>
*/}
      </TableBuilder>
      <Button style={{marginTop: '10px'}}
              size={SIZE.compact} disabled={metadataList.length === 0}
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

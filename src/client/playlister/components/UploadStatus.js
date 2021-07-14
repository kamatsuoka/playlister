import React, { useCallback, useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import { prettyDuration } from '../util/dates'
import dayjs from 'dayjs'
import { Button, SIZE } from 'baseui/button'
import { findUploads } from '../youtube/api'
import { KIND, Notification } from 'baseui/notification'

/**
 * List of files and their upload status
 */
const UploadStatus = ({ metadataList, uploadStatus, setUploadStatus }) => {
  const [error, setError] = useState('')

  const DATA = metadataList.flatMap(metadata => {
    const filename = metadata.name
    const matchingUploads = uploadStatus.filter(match => match.filename === filename)
    if (matchingUploads.length > 0) {
      return matchingUploads.map(upload => ({
          id: upload.id,
          filename: metadata.name,
          videoTitle: upload.title,
          videoDuration: prettyDuration(dayjs.duration(upload.duration)),
          publishedAt: upload.publishedAt,
          thumbnail: upload.thumbnail,
          file: metadata.file
        }))
    } else {
      return [{
        id: metadata.id,
        filename: metadata.name,
        file_duration: metadata.duration,
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



  // eslint-disable-next-line no-unused-vars
  const uploadFile = file => {

  }

/*
  const isUploaded = row => uploadStatus[row.id] === true

  const isUndefined = row => typeof uploadStatus[row.id] === 'undefined'

  const statusIcon = row => {
    if (isUndefined(row)) {
      return null
    }
    if (isUploaded(row)) {
      return <FontAwesomeIcon icon={faVideo} size='sm' color='green' />
    }
    return <FontAwesomeIcon icon={faVideoSlash} size='sm' color='red' />
  }
*/

  return (
    <>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header=''>
          {row => row.videoTitle ? <FontAwesomeIcon icon={faCheck} size='sm' /> : null }
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
        ? <Notification kind={KIND.negative} closeable>{error}</Notification>
        : null}
    </>
  )
}

export default UploadStatus

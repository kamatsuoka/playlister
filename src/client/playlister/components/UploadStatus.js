import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import { prettyDuration } from '../util/dates'
import dayjs from 'dayjs'

/**
 * List of files and their upload status
 */
const UploadStatus = ({ fileInfo, values, setValues }) => {
  const onRemove = useCallback(
    id => setValues(vs => vs.filter(value => value.id !== id)),
    [setValues]
  )

  console.log('values (uploadStatus)', values)
  const DATA = Object.values(fileInfo).flatMap(metadata => {
    const filename = metadata.name
    const matchingUploads = values.filter(match => match.filename === filename)
    // console.log('matchingUploads', matchingUploads)
    if (matchingUploads.length > 0) {
      return matchingUploads.map((upload, index) => (
        {
          id: upload.id,
          filename: metadata.name,
          video_title: upload.title,
          video_duration: prettyDuration(dayjs.duration(upload.duration)),
          publishedAt: upload.publishedAt,
          thumbnail: upload.thumbnail,
          file: metadata.file
        }
      ))
    } else {
      return [{
        id: metadata.id,
        filename: metadata.name,
        file_duration: metadata.duration,
        file: metadata.file
      }]
    }
  })

  const durationOverrides = {
    TableHeadCell: {
      style: {
        textAlign: 'right',
        paddingRight: tablePadding
      }
    }
  }

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
    <div id='results'>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header=''>
          {row =>
            <Button
              onClick={() => onRemove(row.id)}
              title='Remove from list'
              kind={KIND.tertiary}
              size={SIZE.mini}
            >
              <FontAwesomeIcon icon={faTimes} size='sm' />
            </Button>}
        </TableBuilderColumn>
        <TableBuilderColumn header='File Name'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Title'>
          {row => row.video_title}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Duration'>
          {row => row.video_duration}
        </TableBuilderColumn>
        <TableBuilderColumn header='Published At'>
          {row => row.publishedAt}
        </TableBuilderColumn>
        <TableBuilderColumn header='Thumbnail'>
          {row => <img src={row.thumbnail}/>}
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
    </div>
  )
}

export default UploadStatus

import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'

/**
 * List of files and their upload status
 */
const UploadStatus = ({ fileInfo, value, setValue }) => {
  const onRemove = useCallback(
    (resultId) => setValues(({ [resultId]: _, ...rest }) => rest),
    [setValues]
  )

  const DATA = Object.values(fileInfo).map(metadata => {

    return (
      {
        id: resultId,
        name: result.name,
        format: result.format,
        startTime: result.startTime,
        duration: result.duration,
        file: result.file
      })
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

  return (
    <div id='results'>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header={
          Object.keys(values).length === 0
            ? null
            : <Button
                onClick={() => setValues({})} kind={KIND.tertiary} size={SIZE.mini} title='Remove all'
              >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
        }
        >
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
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn header='Video Title'>
          {row => row.format}
        </TableBuilderColumn>
        <TableBuilderColumn header='Start Time'>
          {row => row.startTime}
        </TableBuilderColumn>
        <TableBuilderColumn header='Duration' numeric overrides={durationOverrides}>
          {row => parseFloat(row.duration).toFixed(1).toString() + 's'}
        </TableBuilderColumn>
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
      </TableBuilder>
    </div>
  )
}

export default UploadStatus

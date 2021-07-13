import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import { durationSeconds } from '../util/dates'

/**
 * List of file info from MediaInfo
 */
const MetadataList = ({ value, setValue }) => {
  const onRemove = useCallback(
    resultId => setValue(({ [resultId]: _, ...rest }) => rest),
    [setValue]
  )

  const DATA = Object.entries(value).map(([resultId, result]) => (
    {
      id: resultId,
      name: result.name,
      format: result.format,
      startTime: result.startTime.replace(/^UTC /, ''),
      duration: durationSeconds(result.duration),
      file: result.file
    }))

  const durationOverrides = {
    TableHeadCell: {
      style: {
        textAlign: 'right',
        paddingRight: tablePadding
      }
    }
  }

  return (
    <div id='results'>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header={
          Object.keys(value).length === 0
            ? null
            : <Button
              onClick={() => setValue({})} kind={KIND.tertiary} size={SIZE.mini} title='Remove all'
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
        <TableBuilderColumn header='Name'>
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn header='Format'>
          {row => row.format}
        </TableBuilderColumn>
        <TableBuilderColumn header='Start Time'>
          {row => row.startTime}
        </TableBuilderColumn>
        <TableBuilderColumn header='Duration' numeric overrides={durationOverrides}>
          {row => row.duration}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default MetadataList

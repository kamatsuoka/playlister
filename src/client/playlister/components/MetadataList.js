import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'

/**
 * List of file info from MediaInfo
 */
const MetadataList = ({ uploadStatus, values, setValues }) => {
  const onRemove = useCallback(
    (resultId) => setValues(({ [resultId]: _, ...rest }) => rest),
    [setValues]
  )

  const DATA = Object.entries(values).map(([resultId, result]) => (
    {
      id: resultId,
      name: result.name,
      format: result.format,
      startTime: result.startTime.replace(/^UTC /, ''),
      duration: result.duration,
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
          {row => parseFloat(row.duration).toFixed(1).toString() + 's'}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default MetadataList

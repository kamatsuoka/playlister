import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'

/**
 * List of file info from MediaInfo
 */
const MetadataList = ({ values, setValues }) => {
  const onRemove = useCallback(
    (resultId) => setValues(({ [resultId]: _, ...rest }) => rest),
    [setValues]
  )

  const DATA = Object.entries(values).map(([resultId, result]) => (
    {
      id: resultId,
      name: result.name,
      format: result.format,
      startTime: result.startTime,
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

  // eslint-disable-next-line no-unused-vars
  const uploadFile = file => {

  }

  return (
    <div id='results'>
      <TableBuilder data={DATA} overrides={tableOverrides}>
        <TableBuilderColumn header="Name">
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn header="Format">
          {row => row.format}
        </TableBuilderColumn>
        <TableBuilderColumn header="Start Time">
          {row => row.startTime}
        </TableBuilderColumn>
        <TableBuilderColumn header="Duration" numeric overrides={durationOverrides}>
          {row => parseFloat(row.duration).toFixed(1).toString() + 's'}
        </TableBuilderColumn>
        <TableBuilderColumn header="">
          {row =>
            <button
              className="remove"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(row.id)
              }}
              tabIndex={0}
              title="Remove from list"
              type="button"
            >
              <FontAwesomeIcon icon={faTimes} size="lg"/>
            </button>}
        </TableBuilderColumn>
        <TableBuilderColumn header="">
          {row =>
            <button
              className="upload"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(row.id)
              }}
              tabIndex={0}
              title="Upload"
              type="button"
            >
              ⇧
            </button>}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default MetadataList

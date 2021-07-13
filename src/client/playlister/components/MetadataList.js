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
const MetadataList = ({ metadataList, setMetadataList }) => {
  console.log('MetadataList: metadataList', metadataList)
  const onRemove = useCallback(
    id => setMetadataList(vs => vs.filter(v => v.id !== id)),
    [setMetadataList]
  )

  const durationOverrides = {
    TableHeadCell: {
      style: {
        textAlign: 'right',
        paddingRight: tablePadding
      }
    }
  }

  const removeHeader = () => {
    if (metadataList.length === 0) {
      return null
    } else {
      return (
        <Button onClick={() => setMetadataList([])} kind={KIND.tertiary} size={SIZE.mini} title="Remove all">
          <FontAwesomeIcon icon={faTimes}/>
        </Button>)
    }
  }

  return (
    <div id='results'>
      <TableBuilder data={metadataList} overrides={tableOverrides}>
        <TableBuilderColumn header={removeHeader()}>
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
          {row => row.startTime.replace(/^UTC /, '')}
        </TableBuilderColumn>
        <TableBuilderColumn header='Duration' numeric overrides={durationOverrides}>
          {row => durationSeconds(row.duration)}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default MetadataList

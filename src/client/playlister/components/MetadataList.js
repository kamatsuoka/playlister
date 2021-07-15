import React, { useCallback } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides, tablePadding } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import { durationSeconds } from '../util/dates'
import { KIND as NKind, Notification } from 'baseui/notification'

/**
 * List of file info from MediaInfo
 */
const MetadataList = ({ metadataList, setMetadataList, metadataErrors }) => {
  const onRemove = useCallback(
    fileId => setMetadataList(datas => datas.filter(data => data.fileId !== fileId)),
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

  const errorTable = () => {

    if (metadataErrors.length > 0) {
      return (
        <>
          <Notification kind={NKind.negative} closeable overrides={{ Body: { style: { width: 'auto' } } }}>
            <p>Invalid media files:</p>
            <ul>
            {metadataErrors.map((e, i) => <li key={i}>{e.name}</li>)}
          </ul>
          </Notification>
        </>
      )
    } else {
      return null
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

  const removeColumnOverrides = {
    TableHeadCell: {
      style: ({
        textAlign: 'center',
      })
    },
    TableBodyCell: {
      style: ({
        textAlign: 'center',
      })
    }
  }

  return (
    <div>
      <TableBuilder data={metadataList} overrides={tableOverrides}>
        <TableBuilderColumn header={removeHeader()} overrides={{...columnOverrides, ...removeColumnOverrides}}>
          {row =>
            <Button
              onClick={() => onRemove(row.fileId)}
              title='Remove from list'
              kind={KIND.tertiary}
              size={SIZE.mini}
            >
              <FontAwesomeIcon icon={faTimes} size='sm' />
            </Button>}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Name'>
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Format'>
          {row => row.format}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => row.startTime.replace(/^UTC /, '')}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={{...columnOverrides, ...durationOverrides}} header='Duration' numeric>
          {row => durationSeconds(row.duration)}
        </TableBuilderColumn>
      </TableBuilder>
      {errorTable()}
    </div>
  )
}

export default MetadataList

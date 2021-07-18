import React, { useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { tableOverrides } from './TableOverrides'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { Button, KIND, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { durationSeconds } from '../util/dates'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of file metadata with time adjustments applied
 */
const FileDataList = ({
  metadataList, setMetadataList, overrideTimeZone, timeAdjust, fileDataList, setFileDataList
}) => {
  /**
   * fileDataList items:
   * - fileId
   * - name
   * - startTime
   * - duration
   * - endTime
   */

  const onRemove = useCallback(
    fileId => setMetadataList(datas => datas.filter(data => data.fileId !== fileId)),
    [setMetadataList]
  )

  const durationOverrides = {
    TableHeadCell: {
      style: ({ $theme }) => ({
        textAlign: 'right',
        marginRight: $theme.sizing.scale400
      })
    },
    TableBodyCell: {
      style: ({ $theme }) => ({
        marginRight: $theme.sizing.scale400
      })
    }
  }

  /**
   * Calculate start and end time from file info
   */
  useEffect(() => {
    const parseTimestamp = (timestamp) => {
      const time = timestamp.replace('UTC ', '')
      if (overrideTimeZone) {
        return dayjs(time).local()
      } else {
        if (timestamp.match('^UTC ')) {
          return dayjs(time).utc(true)
        } else {
          return dayjs(timestamp)
        }
      }
    }

    const adjustTime = time => time
      .add(timeAdjust.year || 0, 'year')
      .add(timeAdjust.month || 0, 'month')
      .add(timeAdjust.day || 0, 'day')
      .add(timeAdjust.hour || 0, 'hour')
      .add(timeAdjust.minute || 0, 'minute')
      .add(timeAdjust.second || 0, 'second')

    const calculateStartEnd = metadata => {
      const parsedStartTime = parseTimestamp(metadata.startTime)
      const startTime = adjustTime(parsedStartTime)
      const endTime = startTime.add(metadata.duration, 'second')
      return {
        fileId: metadata.fileId,
        name: metadata.name,
        startTime: startTime.toISOString(),
        duration: metadata.duration,
        endTime: endTime.toISOString()
      }
    }

    // filter out any files that don't have a start time (probably not media files)
    const fileDatas = metadataList
      .flatMap(metadata =>
        metadata.startTime ? [calculateStartEnd(metadata)] : []
      ).sort((s1, s2) => s1.startTime > s2.startTime ? 1 : -1)
    setFileDataList(fileDatas)
  }, [metadataList, overrideTimeZone, setFileDataList, timeAdjust])

  // .sort((s1, s2) => s1.startTime > s2.startTime ? 1 : -1)
  const displayTemplate = 'YYYY-MM-DD HH:mm:ss z'

  const removeHeader = () => {
    if (metadataList.length === 0) {
      return null
    } else {
      return (
        <Button onClick={() => setMetadataList([])} kind={KIND.tertiary} size={SIZE.mini} title='Remove all'>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      )
    }
  }

  const tableCellStyles = $theme => ({
    verticalAlign: 'center',
    paddingLeft: $theme.sizing.scale200,
    paddingRight: $theme.sizing.scale200,
    paddingTop: $theme.sizing.scale400,
    paddingBottom: $theme.sizing.scale400
  })

  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => {
        return tableCellStyles($theme)
      }
    }
  }

  const removeColumnStyle = {
    style: ({ $theme }) => ({
      textAlign: 'center',
      paddingLeft: $theme.sizing.scale200,
      paddingRight: $theme.sizing.scale200
    })
  }

  const removeColumnOverrides = {
    TableHeadCell: removeColumnStyle,
    TableBodyCell: removeColumnStyle
  }

  return (
    <div id='start-end'>
      <TableBuilder data={fileDataList} overrides={tableOverrides}>
        <TableBuilderColumn
          overrides={{ ...columnOverrides, ...removeColumnOverrides }}
          header={removeHeader()}
        >
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
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.name}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => dayjs(row.startTime).format(displayTemplate)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={{ ...columnOverrides, ...durationOverrides }} header='Duration' numeric>
          {row => durationSeconds(row.duration)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='End Time'>
          {row => dayjs(row.endTime).format(displayTemplate)}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default FileDataList

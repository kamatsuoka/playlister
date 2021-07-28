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
import { faPlay, faTimes } from '@fortawesome/free-solid-svg-icons'
import { displayDate, durationSeconds } from '../util/dates'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of file media info with time adjustments applied
 */
const FileList = ({
  mediaList, setMediaList, overrideTimeZone, timeAdjust, files, setFiles, setPreviewUrl
}) => {
  /**
   * Handles removing a file from the list of files
   */
  const onRemove = useCallback(
    fileId => setMediaList(datas => datas.filter(data => data.fileId !== fileId)),
    [setMediaList]
  )

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

    const calculateStartEnd = media => {
      const parsedStartTime = parseTimestamp(media.startTime)
      const startTime = adjustTime(parsedStartTime)
      const endTime = startTime.add(media.duration, 'second')
      return {
        fileId: media.fileId,
        filename: media.filename,
        startTime: startTime.toISOString(),
        duration: media.duration,
        endTime: endTime.toISOString(),
        file: media.file
      }
    }

    // filter out any files that don't have a start time (probably not media files)
    const fileDatas = mediaList
      .flatMap(media =>
        media.startTime ? [calculateStartEnd(media)] : []
      ).sort((s1, s2) => s1.startTime > s2.startTime ? 1 : -1)
    setFiles(fileDatas)
  }, [mediaList, overrideTimeZone, setFiles, timeAdjust])

  const removeHeader = () => {
    if (mediaList.length === 0) {
      return null
    } else {
      return (
        <Button onClick={() => setMediaList([])} kind={KIND.tertiary} size={SIZE.mini} title='Remove all'>
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

  const durationOverrides = {
    TableHeadCell: {
      style: ({ $theme }) => ({
        textAlign: 'right',
        paddingRight: $theme.sizing.scale800
      })
    },
    TableBodyCell: {
      style: ({ $theme }) => ({
        ...tableCellStyles($theme),
        paddingRight: $theme.sizing.scale800
      })
    }
  }

  const filenameColumnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => ({
        ...tableCellStyles($theme),
        paddingLeft: 0
      })
    }
  }

  const removeColumnStyle = {
    style: ({ $theme }) => ({
      ...tableCellStyles($theme),
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
    <>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header=''>
          {row =>
            <Button
              onClick={() => setPreviewUrl(URL.createObjectURL(row.file))}
              kind={KIND.minimal}
              overrides={{
                Root: {
                  style: ({ $theme }) => ({
                    paddingRight: $theme.sizing.scale200
                  })
                }
              }}
            >
              <FontAwesomeIcon icon={faPlay} />
            </Button>}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={filenameColumnOverrides} header='Filename'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={durationOverrides} header='Duration' numeric>
          {row => durationSeconds(row.duration)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='End Time'>
          {row => displayDate(row.endTime)}
        </TableBuilderColumn>
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
      </TableBuilder>
    </>
  )
}

export default FileList

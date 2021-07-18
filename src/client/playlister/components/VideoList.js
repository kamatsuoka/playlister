import React, { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { Input } from 'baseui/input'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const VideoList = ({ uploadList, playlistData, videoNaming }) => {
  const [cameraViews, setCameraViews] = useState({})
  const date = playlistData.eventDate
  const startIndex = parseInt(playlistData.itemCount || 0) + 1 + parseInt(videoNaming.indexOffset)
  const pad = (n) => n < 10 ? `0${n}` : `${n}`

  const getNewTitle = (row, index) => {
    const cameraView = cameraViews[row.videoId] || videoNaming.cameraView
    return `${videoNaming.prefix} ${date} ${cameraView} ${pad(startIndex + index)}`
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

  return (
    <TableBuilder data={uploadList}>
      <TableBuilderColumn overrides={columnOverrides} header='Filename'>
        {row => row.filename}
      </TableBuilderColumn>
      <TableBuilderColumn overrides={columnOverrides} header='Original Title'>
        {row => row.title}
      </TableBuilderColumn>
      <TableBuilderColumn overrides={columnOverrides} header='Camera View'>
        {row =>
          <Input
            value={cameraViews[row.videoId] || videoNaming.cameraView}
            name='cameraView'
            onChange={evt => setCameraViews({
              ...cameraViews,
              [row.videoId]: evt.target.value
            })}
          />}
      </TableBuilderColumn>
      <TableBuilderColumn overrides={columnOverrides} header='New Title'>
        {(row, index) => getNewTitle(row, index)}
      </TableBuilderColumn>

    </TableBuilder>
  )
}

export default VideoList

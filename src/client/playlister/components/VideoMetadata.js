import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import React from 'react'
import GreenCheckMark from './GreenCheckMark'
import dayjs from 'dayjs'

/**
 * Checks if a video metadata entry was added by comparing its data to an
 * added row returned from the 'appendRows' server function.
 */
export const wasAdded = ({ metadata, addedRow }) => {
  if (!addedRow) {
    return false
  }
  // check each item individually for debugging
  const props = ['date', 'videoNumber', 'startTime', 'endTime', 'link', 'cameraNumber', 'cameraView', 'cameraName']
  props.forEach((prop, index) => {
    if (prop === 'startTime' || prop === 'endTime') {
      const metaTime = metadata[prop]
      const addedTime = addedRow[index]
      if (metaTime) {
        if (!addedTime) {
          console.log(`field missing in added row for value ${metadata[prop]} for property ${prop}`)
        } else {
          const metaDayJs = dayjs(metaTime)
          const addedDayJs = dayjs(addedTime)
          if (!metaDayJs.isSame(addedDayJs)) {
            console.log(`dayJs value ${addedDayJs} in added row didn't match value ${metaDayJs} for property ${prop}`)
          }
        }
      }
    } else if (addedRow[index] !== metadata[prop].toString()) {
      console.log(`value ${addedRow[index]} in added row didn't match value ${metadata[prop]} for property ${prop}`)
      return false
    }
  })
  return true
}

const VideoMetadata = ({ videoMetadata, addedRows }) => (
  <TableBuilder data={videoMetadata} overrides={tableOverrides}>
    <TableBuilderColumn header=''>
      {(row, index) =>
        wasAdded({ metadata: row, addedRow: addedRows[index] }) ? <GreenCheckMark /> : null}
    </TableBuilderColumn>
    <TableBuilderColumn header='date'>
      {row => row.date}
    </TableBuilderColumn>
    <TableBuilderColumn header='vid #'>
      {row => row.videoNumber}
    </TableBuilderColumn>
    <TableBuilderColumn header='start time'>
      {row => row.startTime}
    </TableBuilderColumn>
    <TableBuilderColumn header='end time'>
      {row => row.endTime}
    </TableBuilderColumn>
    <TableBuilderColumn header='link'>
      {row =>
        <StyledLink href={row.link} target='_blank' rel='noopener noreferrer'>
          {row.title}
        </StyledLink>}
    </TableBuilderColumn>
    <TableBuilderColumn header='cam #'>
      {row => row.cameraNumber}
    </TableBuilderColumn>
    <TableBuilderColumn header='cam view'>
      {row => row.cameraView}
    </TableBuilderColumn>
    <TableBuilderColumn header='cam name'>
      {row => row.cameraName}
    </TableBuilderColumn>
  </TableBuilder>
)

export default VideoMetadata

import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import React from 'react'
import GreenCheckMark from './GreenCheckMark'

/**
 * Checks if a video metadata entry was added by comparing its data to an
 * added row returned from the 'appendRows' server function.
 */
export const wasAdded = ({ metadata, addedRow }) =>
  addedRow &&
  addedRow[0] === metadata.date &&
  addedRow[1] === metadata.videoNumber &&
  addedRow[2] === metadata.startTime &&
  addedRow[3] === metadata.endTime &&
  addedRow[4] === metadata.link &&
  addedRow[5] === metadata.cameraNumber &&
  addedRow[6] === metadata.cameraView &&
  addedRow[7] === metadata.cameraName

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

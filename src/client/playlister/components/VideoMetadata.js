import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import React from 'react'
import GreenCheckMark from './GreenCheckMark'

const VideoMetadata = ({ videoMetadata, addedRows }) => (
  <TableBuilder data={videoMetadata} overrides={tableOverrides}>
    <TableBuilderColumn header=''>
      {(row, index) => {
        const added = addedRows[index]
        return added &&
          added[0] === row.date &&
          added[1] === row.videoNumber &&
          added[2] === row.startTime &&
          added[3] === row.endTime &&
          added[4] === row.link &&
          added[5] === row.cameraNumber &&
          added[6] === row.cameraView &&
          added[7] === row.cameraName
          ? <GreenCheckMark />
          : null
      }}
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

import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import React from 'react'

const VideoMetadata = ({ videoMetadata }) => (
  <TableBuilder data={videoMetadata} overrides={tableOverrides}>
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

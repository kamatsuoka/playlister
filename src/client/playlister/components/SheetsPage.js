import React, { useCallback, useEffect, useState } from 'react'
import { resourceToPlaylistItem } from '../models/playlists'
import * as youtube from '../youtube/api'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { getChosenDate, localDate } from '../models/dates'
import { getVideoNumber } from '../models/renaming'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'

const SheetsPage = ({ cameraInfo, eventData, cameraViews, defaultCameraView, playlist }) => {
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])

  const playlistItemsToVideoMetadata = useCallback(items => {
    return items.map((item, index) => ({
      date: getChosenDate(eventData),
      videoNumber: getVideoNumber(cameraInfo, index),
      startTime: localDate(item.startTime),
      endTime: localDate(item.endTime),
      title: item.title,
      videoId: item.videoId,
      playlistId: item.playlistId,
      position: item.position
    }))
  }, [eventData, cameraInfo])

  /**
   * Gets the updated list of playlist items
   */
  const getPlaylistItems = useCallback(() => {
    if (!playlist.playlistId) {
      return
    }
    setVideoMetadata([])
    const onSuccess = resources => {
      const videoMetadatas = playlistItemsToVideoMetadata(
        resources
          .map(resourceToPlaylistItem)
          .sort((item1, item2) => item1.position - item2.position)
      )
      console.log('Derived video metadata from listPlaylistItems: ', videoMetadatas)
      return setVideoMetadata(videoMetadatas)
    }
    if (playlist.playlistId) {
      console.log('calling youtube.listPlaylistItems ...')
      return youtube.listPlaylistItems(playlist.playlistId, onSuccess, showError)
    }
  }, [playlist.playlistId, showError, setVideoMetadata])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getPlaylistItems, [playlist.playlistId])

  const BASE_URL = 'https://www.youtube.com/watch'
  const getUrl = metadata => {
    const url = `${BASE_URL}?v=${metadata.videoId}&list=${metadata.playlistId}&index=${metadata.position + 1}`
    console.log(`built url: ${url}`)
    return url
  }

  return (
    <TableBuilder
      data={videoMetadata}
      overrides={tableOverrides}
    >
      <TableBuilderColumn header='date'>
        {row => row.date}
      </TableBuilderColumn>
      <TableBuilderColumn header='video #'>
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
          <StyledLink href={getUrl(row)} target='_blank' rel='noopener noreferrer'>
            {row.title}
          </StyledLink>}
      </TableBuilderColumn>
      <TableBuilderColumn header='camera #'>
        {() => cameraInfo.cameraNumber}
      </TableBuilderColumn>
      <TableBuilderColumn header='camera view'>
        {row => cameraViews[row.videoId] || defaultCameraView}
      </TableBuilderColumn>
      <TableBuilderColumn header='camera name'>
        {() => cameraInfo.cameraName}
      </TableBuilderColumn>
    </TableBuilder>
  )
}

export default SheetsPage

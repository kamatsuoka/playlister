import React, { useState } from 'react'
import { Button, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { Label1 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { useStyletron } from 'baseui'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate, parseDescription } from '../util/dates'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons'

export const resourceToPlaylistItem = resource => ({
  playlistItemId: resource.id,
  playlistId: resource.snippet.playlistId,
  videoId: resource.snippet.resourceId.videoId,
  title: resource.snippet.title,
  position: resource.snippet.position,
  ...parseDescription(resource.snippet.description)
})

/**
 * List of items (videos) in playlist
 * with button to add videos to playlist.
 *
 * Youtube (as of July 2021) adds new playlist items to the end of the playlist.
 * The insert api seems to ignore the 'position' param.
 */
const PlaylistItems = ({ playlist, files, uploads, playlistItems, setPlaylistItems }) => {
  const [, theme] = useStyletron()
  const [adding, setAdding] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  /**
   * Add videos to playlist in the position specified by their order in the array.
   * If video is already in playlist, just put it in the correct position.
   *
   * @param videoIds array of video ids
   */
  const addToPlaylist = videoIds => {
    console.log(`addToPlaylist: ${videoIds}`)
    if (videoIds.length === 0) {
      setAdding(false)
      return
    }
    const successHandler = items => {
      setPlaylistItems(items.map(resourceToPlaylistItem))
      setAdding(false)
    }
    const failureHandler = err => {
      setAdding(false)
      showError(err)
    }
    youtube.addToPlaylist(
      videoIds, playlist.playlistId, successHandler, failureHandler
    )
  }

  const addAllToPlaylist = () => {
    setAdding(true)
    const videos = {}
    for (const upload of files.map(file => uploads[file.fileId])) {
      videos[upload.videoId] = { title: upload.title, startTime: upload.startTime }
    }
    for (const playlistItem of Object.values(playlistItems)) {
      if (videos[playlistItem.videoId] && videos[playlistItem.videoId].startTime) {
        continue
      }
      videos[playlistItem.videoId] = { title: playlistItem.title, startTime: playlistItem.startTime }
    }
    const orderedEntries = Object.entries(videos).sort(([, v1], [, v2]) => {
      if (!v1.startTime && !v2.startTime) { return v1.title > v2.title ? 1 : -1 }
      if (!v1.startTime) { return -1 }
      if (!v2.startTime) { return 1 }
      return v1.startTime > v2.startTime ? 1 : -1
    })
    console.log('orderedEntries: ', orderedEntries)
    const orderedIds = orderedEntries.map(([id]) => id)
    addToPlaylist(orderedIds)
  }

  const buttonOverrides = {
    Root: {
      style: ({
        width: '100%',
        height: theme.sizing.scale1200,
        marginTop: theme.sizing.scale600,
        marginBottom: theme.sizing.scale600
      })
    }
  }

  /**
   * Adds videos to playlist
   */
  const showAddButton = () => (
    <>
      <Button
        onClick={addAllToPlaylist}
        size={SIZE.small}
        isLoading={adding}
        overrides={buttonOverrides}
      >
        <FontAwesomeIcon icon={faAngleDoubleDown} />
        &nbsp; Add to Playlist &nbsp;
        <FontAwesomeIcon icon={faAngleDoubleDown} />
      </Button>
    </>
  )

  function showPlaylistItems () {
    return (
      <>
        <Label1 paddingLeft={theme.sizing.scale200} style={{ textDecoration: 'underline' }}>
          {playlist.title}
        </Label1>
        <TableBuilder data={Object.values(playlistItems)} overrides={tableOverrides}>
          <TableBuilderColumn header='Title'>
            {row => row.title}
          </TableBuilderColumn>
          <TableBuilderColumn header='Start Time'>
            {row => displayDate(row.startTime)}
          </TableBuilderColumn>
          <TableBuilderColumn header='Position'>
            {row => row.position}
          </TableBuilderColumn>
        </TableBuilder>
      </>
    )
  }

  return (
    <>
      <Label1 paddingLeft={theme.sizing.scale200} style={{ textDecoration: 'underline' }}>
        Uploads
      </Label1>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn header='Title'>
          {row => uploads[row.fileId].title}
        </TableBuilderColumn>
        <TableBuilderColumn header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
      </TableBuilder>
      {playlist.playlistId ? showAddButton() : null}
      {playlist.playlistId ? showPlaylistItems() : null}
    </>
  )
}

export default PlaylistItems

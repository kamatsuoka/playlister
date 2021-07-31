import React, { useState } from 'react'
import { Button, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { Label1 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { useStyletron } from 'baseui'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate } from '../util/dates'

export const descriptionToStartTime = description => {
  try {
    return JSON.parse(description).startTime
  } catch {
    return undefined
  }
}

export const resourceToPlaylistItem = resource => ({
  playlistItemId: resource.id,
  playlistId: resource.snippet.playlistId,
  videoId: resource.snippet.resourceId.videoId,
  title: resource.snippet.title,
  position: resource.snippet.position,
  startTime: descriptionToStartTime(resource.description)
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

  const addToPlaylist = (videoIds, position) => {
    console.log(`addToPlaylist: ${videoIds.length} videos, position ${position}`)
    if (videoIds.length === 0) {
      setAdding(false)
      return
    }
    const videoId = videoIds.shift() // pop off head of array
    const successHandler = resource => {
      const item = resourceToPlaylistItem(resource)
      setPlaylistItems(playlistItems => ({ ...playlistItems, [item.videoId]: item }))
      addToPlaylist(videoIds, position + 1)
    }
    const failureHandler = err => {
      setAdding(false)
      showError(err)
    }
    const existingItem = playlistItems[videoId]
    // if video is already in playlist
    if (existingItem && existingItem.playlistId === playlist.playlistId) {
      // update its position if necessary
      if (existingItem.position !== position) {
        youtube.updatePlaylistItem({
          playlistItemId: existingItem.playlistItemId,
          videoId,
          playlistId: playlist.playlistId,
          position,
          successHandler,
          failureHandler
        })
      } else {
        addToPlaylist(videoIds, position + 1)
      }
    } else {
      youtube.insertPlaylistItem(
        videoId, playlist.playlistId, successHandler, failureHandler
      )
    }
  }

  const addAllToPlaylist = () => {
    setAdding(true)
    // in the happy path, we insert all the videos into the playlist
    // in the correct order and never have to go back and add more later
    // TODO: update playlist after items inserted
    addToPlaylist(files.map(file => uploads[file.fileId].videoId), playlist.itemCount)
  }

  const buttonOverrides = {
    Root: {
      style: ({
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
        Add Videos to Playlist
      </Button>
    </>
  )

  return (
    <>
      <Label1 paddingLeft={theme.sizing.scale200} style={{ textAlign: 'center', textDecoration: 'underline' }}>
        {playlist.title}
      </Label1>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn header='Title'>
          {row => uploads[row.fileId].title}
        </TableBuilderColumn>
        <TableBuilderColumn header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn header='Position'>
          {row => {
            const plist = playlistItems[uploads[row.fileId].videoId]
            return plist ? plist.position : undefined
          }}
        </TableBuilderColumn>
      </TableBuilder>
      {showAddButton()}
    </>
  )
}

export default PlaylistItems

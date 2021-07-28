import React, { useState } from 'react'
import { Button, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { Label1 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { showError } from '../util/showError'
import { useStyletron } from 'baseui'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate } from '../util/dates'

/**
 * Adds videos to playlist.
 *
 * Youtube (as of July 2021) adds new playlist items to the end of the playlist.
 * The insert api seems to ignore the 'position' param.
 */
const AddToPlaylist = ({
  playlist, files, uploads, videoPlaylist, setVideoPlaylist
}) => {
  const [, theme] = useStyletron()
  const [adding, setAdding] = useState(false)
  const { enqueue } = useSnackbar()

  const addToPlaylist = (videoIds, position) => {
    console.log(`addToPlaylist: ${videoIds.length} uploads, position ${position}`)
    const videoId = videoIds.shift() // pop off head of array
    const successHandler = playlistItem => {
      const videoId = playlistItem.snippet.resourceId.videoId
      const playlistId = playlistItem.snippet.playlistId
      setVideoPlaylist(videoPlaylist => ({ ...videoPlaylist, [videoId]: playlistId }))
      if (videoIds.length > 0) {
        addToPlaylist(videoIds)
      } else {
        setAdding(false)
      }
    }
    const failureHandler = err => {
      setAdding(false)
      showError(enqueue, err)
    }
    youtube.insertPlaylistItem(
      videoId, playlist.playlistId, successHandler, failureHandler
    )
  }

  const addAllToPlaylist = () => {
    setAdding(true)
    // in the happy path, we insert all the videos into the playlist
    // in the correct order and never have to go back and add more later
    addToPlaylist(files.map(file => uploads[file.fileId].videoId))
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
  const columnOverrides = {}

  return (
    <>
      <Label1 paddingLeft={theme.sizing.scale200} style={{ textAlign: 'center', textDecoration: 'underline' }}>
        {playlist.title}
      </Label1>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header='Title'>
          {row => uploads[row.fileId].title}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Added'>
          {row => {
            const playlistId = videoPlaylist[uploads[row.fileId].videoId]
            if (playlistId === playlist.playlistId) {
              return 'Yes'
            }
            return null
          }}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Position'>
          {row => null}
        </TableBuilderColumn>
      </TableBuilder>
      {showAddButton()}
    </>
  )
}

export default AddToPlaylist

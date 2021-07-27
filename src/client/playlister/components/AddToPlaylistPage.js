import React, { useState } from 'react'
import { Button, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { Label1 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { showError } from '../util/showError'
import { useStyletron } from 'baseui'
import prevNextButtons from './PrevNextButtons'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'

/**
 * Adds videos to playlist
 */
const AddToPlaylistPage = ({
  current, setCurrent, playlistData, uploadList, videoPlaylist, setVideoPlaylist
}) => {
  const [, theme] = useStyletron()
  const [adding, setAdding] = useState([])
  const { enqueue } = useSnackbar()

  const addToPlaylist = async () => {
    const addingIds = uploadList.map(upload => upload.videoId)
    setAdding(addingIds)
    const successHandler = playlistItem => {
      const videoId = playlistItem.snippet.resourceId.videoId
      const playlistId = playlistItem.snippet.playlistId
      const position = playlistItem.snippet.position
      setVideoPlaylist(videoPlaylist => ({ ...videoPlaylist, [videoId]: { playlistId, position } }))
      setAdding(adding => adding.filter(id => id !== videoId))
    }
    const failureHandler = err => showError(enqueue, err)
    for (const [index, upload] of uploadList.entries()) {
      await youtube.insertPlaylistItem(
        upload.videoId, playlistData.playlistId, index + playlistData.itemCount,
        successHandler, failureHandler)
    }
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
        onClick={addToPlaylist}
        size={SIZE.small}
        isLoading={adding.length > 0}
        overrides={buttonOverrides}
      >
        Add Videos to Playlist
      </Button>
    </>
  )
  const columnOverrides = {}

  return (
    <>
      <Label1>{playlistData.title}</Label1>
      <TableBuilder data={uploadList} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header='Title'>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Added'>
          {row => {
            const playlist = videoPlaylist[row.videoId]
            if (playlist && playlist.playlistId === playlistData.playlistId) {
              return 'Yes'
            }
            return null
          }}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Position'>
          {row => {
            const playlist = videoPlaylist[row.videoId]
            if (playlist && playlist.playlistId === playlistData.playlistId) {
              return playlist.position
            }
            return null
          }}
        </TableBuilderColumn>
      </TableBuilder>
      {showAddButton()}
      {prevNextButtons({ current, setCurrent })}
    </>
  )
}

export default AddToPlaylistPage

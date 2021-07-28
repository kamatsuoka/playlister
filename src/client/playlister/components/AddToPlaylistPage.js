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
import { displayDate } from '../util/dates'

/**
 * Adds videos to playlist
 */
const AddToPlaylistPage = ({
  current, setCurrent, playlistData, files, uploads, videoPlaylist, setVideoPlaylist
}) => {
  const [, theme] = useStyletron()
  const [adding, setAdding] = useState(false)
  const { enqueue } = useSnackbar()

  const addToPlaylist = (videoIds, position) => {
    console.log(`addToPlaylist: ${videoIds.length} uploads, position ${position}`)
    const videoId = videoIds.pop()
    const successHandler = playlistItem => {
      const videoId = playlistItem.snippet.resourceId.videoId
      const playlistId = playlistItem.snippet.playlistId
      setVideoPlaylist(videoPlaylist => ({ ...videoPlaylist, [videoId]: playlistId }))
      if (videoIds.length > 0) {
        addToPlaylist(videoIds, position + 1)
      } else {
        setAdding(false)
      }
    }
    const failureHandler = err => {
      setAdding(false)
      showError(enqueue, err)
    }
    youtube.insertPlaylistItem(
      videoId, playlistData.playlistId, position, successHandler, failureHandler
    )
  }

  const addAllToPlaylist = () => {
    setAdding(true)
    addToPlaylist(files.map(file => uploads[file.fileId].videoId), playlistData.itemCount)
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
      <Label1>{playlistData.title}</Label1>
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
            if (playlistId === playlistData.playlistId) {
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
      {prevNextButtons({ current, setCurrent })}
    </>
  )
}

export default AddToPlaylistPage

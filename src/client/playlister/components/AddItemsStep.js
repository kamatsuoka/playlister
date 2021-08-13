import React, { useContext, useState } from 'react'
import { useStyletron } from 'baseui'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate } from '../models/dates'
import ActionButton from './ActionButton'
import { resourceToPlaylistItem } from '../models/playlists'
import GreenCheckMark from './GreenCheckMark'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

/**
 * List of items (videos) in playlist
 * with button to add videos to playlist.
 *
 * Youtube (as of July 2021) adds new playlist items to the end of the playlist.
 * The insert api seems to ignore the 'position' param.
 */
const AddItemsStep = ({
  playlist, files, uploads, playlistItems, setPlaylistItems, allAdded, enqueue, showError
}) => {
  const [css, theme] = useStyletron()
  const [adding, setAdding] = useState(false)
  const { password } = useContext(PasswordContext)

  /**
   * Add videos to playlist in the position specified by their order in the array.
   * If video is already in playlist, just put it in the correct position.
   *
   * @param sortedVideos sorted array of video data
   */
  const addToPlaylist = sortedVideos => {
    if (sortedVideos.length === 0) {
      setAdding(false)
      return
    }
    const onSuccess = resources => {
      setPlaylistItems(Object.fromEntries(
        resources.map(resourceToPlaylistItem)
          .sort((a, b) => a.position - b.position)
          .map(item => [item.videoId, item])
      ))
      enqueue({ message: `all videos added to ${playlist.title}` })
      setAdding(false)
    }
    const onFailure = err => {
      setAdding(false)
      showError(err)
    }
    return callServer('addToPlaylist', onSuccess, onFailure,
      { password, videos: sortedVideos, playlistId: playlist.playlistId }
    )
  }

  const addAllToPlaylist = () => {
    setAdding(true)
    const videos = {}
    for (const upload of files.map(file => uploads[file.fileId])) {
      videos[upload.videoId] = {
        title: upload.title, startTime: upload.startTime, videoId: upload.videoId
      }
    }
    for (const playlistItem of Object.values(playlistItems)) {
      if (videos[playlistItem.videoId] && videos[playlistItem.videoId].startTime) {
        continue
      }
      videos[playlistItem.videoId] = {
        title: playlistItem.title, startTime: playlistItem.startTime, videoId: playlistItem.videoId
      }
    }
    const sortedVideos = Object.values(videos).sort((v1, v2) => {
      if (!v1.startTime && !v2.startTime) { return v1.title > v2.title ? 1 : -1 }
      if (!v1.startTime) { return -1 }
      if (!v2.startTime) { return 1 }
      return v1.startTime > v2.startTime ? 1 : -1
    })
    console.log('sortedVideos: ', sortedVideos)
    return addToPlaylist(sortedVideos)
  }

  return (
    <>
      <ActionButton
        onClick={addAllToPlaylist}
        title='add videos to playlist'
        icon={faPlus}
        spin={adding}
        disabled={!(playlist.playlistId || files.map(file => uploads[file.fileId]).length)}
        grayed={allAdded}
        text='Add'
        className={css({
          float: 'left',
          marginTop: theme.sizing.scale200,
          marginRight: theme.sizing.scale600
        })}
      />
      <TableBuilder
        data={Object.values(playlistItems).sort((a, b) => a.position - b.position)}
        overrides={tableOverrides}
      >
        <TableBuilderColumn header=''>
          {row => row.position !== undefined ? <GreenCheckMark /> : null}
        </TableBuilderColumn>
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

export default AddItemsStep

import React, { useState } from 'react'
import * as youtube from '../api/youtube/youtube-client'
import { useStyletron } from 'baseui'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate } from '../models/dates'
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { resourceToPlaylistItem } from '../models/playlists'

/**
 * List of items (videos) in playlist
 * with button to add videos to playlist.
 *
 * Youtube (as of July 2021) adds new playlist items to the end of the playlist.
 * The insert api seems to ignore the 'position' param.
 */
const PlaylistItems = ({
  playlist, files, uploads, playlistItems, setPlaylistItems, allAdded, enqueue, showError
}) => {
  const [css] = useStyletron()
  const [adding, setAdding] = useState(false)

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
    const successHandler = resources => {
      setPlaylistItems(Object.fromEntries(
        resources.map(resourceToPlaylistItem)
          .sort((a, b) => a.position - b.position)
          .map(item => [item.videoId, item])
      ))
      enqueue({ message: `all videos added to ${playlist.title}` })
      setAdding(false)
    }
    const failureHandler = err => {
      setAdding(false)
      showError(err)
    }
    return youtube.addToPlaylist(
      sortedVideos, playlist.playlistId, successHandler, failureHandler
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
    // const orderedIds = sortedVideos.map(([id]) => id)
    return addToPlaylist(sortedVideos)
  }

  function showPlaylistItems () {
    return (
      <>
        <Heading styleLevel={5} className={css({ display: 'inline' })}>3. Add Videos &nbsp;
          <ActionButton
            onClick={addAllToPlaylist}
            title='add videos to playlist'
            icon={faAngleDoubleDown}
            spin={adding}
            grayed={allAdded}
          />
        </Heading>
        <TableBuilder
          data={Object.values(playlistItems).sort((a, b) => a.position - b.position)}
          overrides={tableOverrides}
        >
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

  return playlist.playlistId && playlistItems ? showPlaylistItems() : null
}

export default PlaylistItems

import React, { useState } from 'react'
import { Button, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { Label2 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { errorMessage, showError } from '../util/showError'
import { useStyletron } from 'baseui'
import prevNextButtons from './PrevNextButtons'

/**
 * Adds videos to playlist
 */
const AddToPlaylistPage = ({
  current, setCurrent, playlistData, uploadList
}) => {
  const [, theme] = useStyletron()
  const [adding, setAdding] = useState(false)
  const { enqueue } = useSnackbar()

  /**
   * Gets properties of interest from youtube Playlist resource
   *
   * https://developers.google.com/youtube/v3/docs/playlists#resource
   */
  const playlistResource = playlist => ({
    playlistId: playlist.id,
    title: playlist.snippet.title,
    itemCount: playlist.contentDetails.itemCount,
    publishedAt: playlist.snippet.publishedAt,
    description: playlist.snippet.description
  })

  const storePlaylist = playlist => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      const resource = playlistResource(playlist)
      console.log('storing playlist in playlistData:', resource)
      return setPlaylistData({
        ...playlistData,
        ...resource
      })
    } else {
      return setPlaylistData({})
    }
  }

  /**
   * Success handler for creating or finding a playlist
   */
  const playlistSuccess = (eventDate, action) => playlist => {
    const msgIntro = action === ACTION_FIND ? 'Found existing' : 'Created'
    storePlaylist(playlist)
    const statusFn = action === ACTION_FIND ? setFindStatus : setCreateStatus
    statusFn(values => ({
      ...values,
      result: `${action} success`,
      title: playlist.snippet.title,
      message: `${msgIntro} playlist "${playlist.snippet.title}"`,
      isError: false
    }))
    if (action === ACTION_FIND) {
      console.log('findStatus: ', findStatus)
      setFinding(false)
    } else {
      console.log('createStatus: ', createStatus)
      setCreating(false)
    }
  }

  /**
   * Failure handler for creating or finding a playlist
   */
  const playlistFailure = action => err => {
    let verb = ''
    if (action === ACTION_FIND) {
      setFinding(false)
      verb = 'finding'
    } else if (action === ACTION_CREATE) {
      setCreating(false)
      verb = 'creating'
    } else if (action === ACTION_LIST) {
      setListing(false)
      verb = 'listing'
    } else {
      console.log(`playlistFailure: unexpected action: ${action}`)
      return
    }
    showError(enqueue, `Error ${verb} playlist: ${errorMessage(err)}`)
  }

  const addToPlaylist = async () => {
    setAdding(true)
    // TODO: onsuccess, onfailure, display results for each video
    for (const upload of uploadList) {
      await youtube.insertPlaylistItem(upload.videoId, playlistData.playlistId)
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
      <Label2>Playlist: {playlistData.title}</Label2>
      <Button
        onClick={addToPlaylist}
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
      {showAddButton()}
      {prevNextButtons({ current, setCurrent })}
    </>
  )
}

export default AddToPlaylistPage

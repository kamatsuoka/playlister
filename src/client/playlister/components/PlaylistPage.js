import React, { useCallback, useState } from 'react'
import { KIND } from 'baseui/button'
import * as youtube from '../youtube/api'
import { useSnackbar } from 'baseui/snackbar'
import { errorMessage, showError } from '../util/showError'
import { Tab, Tabs } from 'baseui/tabs-motion'
import prevNextButtons from './PrevNextButtons'
import PlaylistCreate from './PlaylistCreate'
import PlaylistSelect from './PlaylistSelect'

/**
 * Shows event data form:
 * - event date (defaults to date inferred from video start time)
 * Shows suggested playlist as [inferred date] + [event type]
 */
const PlaylistPage = ({
  current, setCurrent,
  orgInfo, cameraInfo,
  eventData, files, uploads,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist,
  playlistData, setPlaylistData
}) => {
  /**
   * playlistData:
   * - id
   * - title
   * - itemCount
   * - publishedAt
   * - description
   */
  const [listing, setListing] = useState(false)

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

  /**
   * Failure handler for listing playlists
   */
  const playlistFailure = err => {
    setListing(false)
    showError(enqueue, `Error listing playlists: ${errorMessage(err)}`)
  }

  /**
   * Find list of (hopefully recent) playlists
   */
  function listPlaylists () {
    setListing(true)
    const successHandler = playlists => {
      setPlaylists(playlists.map(playlistResource))
      setListing(false)
    }
    try {
      return youtube.listPlaylists(successHandler, playlistFailure)
    } catch (e) {
      playlistFailure(e)
    }
  }

  const storeSelected = useCallback(playlist => setPlaylistData(playlist), [playlistData])

  const nextOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
    (playlistTitle.tabIndex === 1 && selectedPlaylist[0] && selectedPlaylist[0].title)

  const tabOverrides = {
    TabPanel: {
      style: ({
        paddingBottom: 0
      })
    }
  }

  const uploadedFileIds = files.map(file => file.fileId).filter(fileId => uploads[fileId])

  return (
    <>
      <Tabs
        activeKey={playlistTitle.tabIndex}
        onChange={({ activeKey }) => {
          setPlaylistTitle({ ...playlistTitle, tabIndex: parseInt(activeKey) })
          if (activeKey === '1' && playlists.length === 0) {
            return listPlaylists()
          }
        }}
      >
        <Tab title='Create new playlist' overrides={tabOverrides}>
          <PlaylistCreate
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
            createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
            playlistResource={playlistResource} uploadedFileIds={uploadedFileIds}
            playlistData={playlistData} setPlaylistData={setPlaylistData}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
          />
        </Tab>
        <Tab title='Use existing playlist' overrides={tabOverrides}>
          <PlaylistSelect
            playlists={playlists} selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
            listPlaylists={listPlaylists} listing={listing}
          />
        </Tab>
      </Tabs>
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: {
          kind: nextOkay ? KIND.primary : KIND.secondary,
          onClick: () => {
            if (playlistTitle.tabIndex === 1 && selectedPlaylist[0]) {
              storeSelected(selectedPlaylist[0])
            }
            setCurrent(current + 1)
          }
        }
      })}
    </>
  )
}

export default PlaylistPage

import PlaylistCreate from './PlaylistCreate'
import PlaylistSelect from './PlaylistSelect'
import React, { useCallback, useContext, useState } from 'react'
// import { useStyletron } from 'baseui'
import { resourceToPlaylist, resourceToPlaylistItem } from '../models/playlists'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { Tab, Tabs } from 'baseui/tabs-motion'

const ChoosePlaylistStep = ({
  setPlaylist, playlists, setPlaylists,
  setPlaylistItems, uploadedFileIds,
  createdPlaylist, setCreatedPlaylist,
  selectedPlaylist, setSelectedPlaylist,
  playlistTitle, setPlaylistTitle,
  eventData, orgInfo, cameraInfo, enqueue, showError
}) => {
  // const [css, theme] = useStyletron()
  const [listing, setListing] = useState(false)
  const { password } = useContext(PasswordContext)

  /**
   * Find list of (hopefully recent) playlists
   */
  function listPlaylists () {
    setListing(true)
    const onSuccess = resources => {
      setPlaylists(resources.map(resourceToPlaylist))
      setListing(false)
    }
    const onFailure = err => {
      setListing(false)
      showError(err)
    }
    try {
      return callServer('listPlaylists', onSuccess, onFailure, {})
    } catch (e) {
      onFailure(e)
    }
  }

  /**
   * Sets the playlist and fetches its list of videos
   */
  const setAndListPlaylist = useCallback(playlist => {
    setPlaylist(playlist)
    const onSuccess = resources => {
      console.log('Got playlistItem resources from listPlaylistItems: ', resources)
      return setPlaylistItems(Object.fromEntries(
        resources
          .map(resourceToPlaylistItem)
          .sort((item1, item2) => item1.startTime > item2.startTime ? 1 : -1)
          .map(item => [item.videoId, item])
      ))
    }
    if (playlist.playlistId) {
      console.log('calling listPlaylistItems ...')
      return callServer('listPlaylistItems', onSuccess, showError,
        { password, playlistId: playlist.playlistId }
      )
    }
  }, [showError, setPlaylist, setPlaylistItems])

  const tabOverrides = {
    TabPanel: {
      style: ({
        // paddingTop: 0,
        // paddingBottom: 0
      })
    }
  }

  return (
    <Tabs
      activeKey={playlistTitle.tabIndex}
      onChange={({ activeKey }) => {
        setPlaylistTitle({ ...playlistTitle, tabIndex: parseInt(activeKey) })
        if (activeKey === '1' && playlists.length === 0) {
          return listPlaylists()
        }
        if (activeKey === '0' && Object.keys(createdPlaylist).length > 0) {
          return setAndListPlaylist(createdPlaylist)
        } else if (activeKey === '1' && selectedPlaylist[0] && Object.keys(selectedPlaylist[0]).length > 0) {
          return setAndListPlaylist(selectedPlaylist[0])
        }
      }}
    >
      <Tab title='New' overrides={tabOverrides}>
        <PlaylistCreate
          eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo} createdPlaylist={createdPlaylist}
          setCreatedPlaylist={setCreatedPlaylist} resourceToPlaylist={resourceToPlaylist}
          uploadedFileIds={uploadedFileIds} setPlaylist={setAndListPlaylist}
          playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
          enqueue={enqueue} showError={showError}
        />
      </Tab>
      <Tab title='Existing' overrides={tabOverrides}>
        <PlaylistSelect
          playlists={playlists}
          selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
          setPlaylist={setAndListPlaylist} listPlaylists={listPlaylists} listing={listing}
        />
      </Tab>
    </Tabs>

  )
}
export default ChoosePlaylistStep

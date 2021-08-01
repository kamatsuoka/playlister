import React, { useCallback, useState } from 'react'
import { KIND } from 'baseui/button'
import * as youtube from '../youtube/api'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError, errorMessage } from '../util/enqueueError'
import { Tab, Tabs } from 'baseui/tabs-motion'
import prevNextButtons from './PrevNextButtons'
import PlaylistCreate from './PlaylistCreate'
import PlaylistSelect from './PlaylistSelect'
import PlaylistItems, { resourceToPlaylistItem } from './PlaylistItems'
import { Label1 } from 'baseui/typography'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { displayDate } from '../util/dates'
import { useStyletron } from 'baseui'

/**
 * Create new or find existing playlist.
 * Add uploaded videos to playlist.
 */
const PlaylistPage = ({
  current, setCurrent,
  orgInfo, cameraInfo,
  eventData, files, uploads,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist,
  playlist, setPlaylist,
  playlistItems, setPlaylistItems
}) => {
  /**
   * playlist:
   * - id
   * - title
   * - itemCount
   * - publishedAt
   * - description
   */
  const [, theme] = useStyletron()
  const [listing, setListing] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

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
      console.log('calling youtube.listPlaylistItems ...')
      youtube.listPlaylistItems(playlist.playlistId, onSuccess, showError)
    }
  }, [showError, setPlaylist, setPlaylistItems])

  console.log('playlistItems', playlistItems)

  /**
   * Gets playlist properties of interest from youtube Playlist resource
   *
   * https://developers.google.com/youtube/v3/docs/playlists#resource
   */
  const resourceToPlaylist = plist => ({
    playlistId: plist.id,
    title: plist.snippet.title,
    itemCount: plist.contentDetails.itemCount,
    publishedAt: plist.snippet.publishedAt,
    description: plist.snippet.description
  })

  /**
   * Failure handler for listing playlists
   */
  const playlistFailure = err => {
    setListing(false)
    showError(`Error listing playlists: ${errorMessage(err)}`)
  }

  /**
   * Find list of (hopefully recent) playlists
   */
  function listPlaylists () {
    setListing(true)
    const successHandler = resources => {
      setPlaylists(resources.map(resourceToPlaylist))
      setListing(false)
    }
    try {
      return youtube.listPlaylists(successHandler, playlistFailure)
    } catch (e) {
      playlistFailure(e)
    }
  }

  const playlistOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
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
          if (activeKey === '0' && Object.keys(createdPlaylist).length > 0) {
            setAndListPlaylist(createdPlaylist)
          } else if (activeKey === '1' && selectedPlaylist[0] && Object.keys(selectedPlaylist[0]).length > 0) {
            setAndListPlaylist(selectedPlaylist[0])
          }
        }}
      >
        <Tab title='New' overrides={tabOverrides}>
          <PlaylistCreate
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
            createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
            resourceToPlaylist={resourceToPlaylist} uploadedFileIds={uploadedFileIds}
            playlist={playlist} setPlaylist={setAndListPlaylist}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
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
      <PlaylistItems
        files={files} uploads={uploads} playlist={playlist}
        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems}
      />
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: playlistOkay ? KIND.primary : KIND.secondary }
      })}
    </>
  )
}

export default PlaylistPage

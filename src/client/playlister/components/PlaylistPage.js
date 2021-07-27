import React, { useCallback, useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import { KIND as NKind, Notification } from 'baseui/notification'
import * as youtube from '../youtube/api'
import PlaylistTitle, { CUSTOM, SUGGESTED } from './PlaylistTitle'
import { useSnackbar } from 'baseui/snackbar'
import { errorMessage, showError } from '../util/showError'
import { DEFAULT_DATE } from './EventDate'
import { useStyletron } from 'baseui'
import { Tab, Tabs } from 'baseui/tabs-motion'
import { FormControl } from 'baseui/form-control'
import { Select } from 'baseui/select'
import prevNextButtons from './PrevNextButtons'

const ACTION_CREATE = 'create'
const ACTION_LIST = 'list'

/**
 * Shows event data form:
 * - event date (defaults to date inferred from video start time)
 * Shows suggested playlist as [inferred date] + [event type]
 */
const PlaylistPage = ({
  current, setCurrent,
  orgInfo, cameraInfo,
  eventData, uploadList,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
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
  const [css, theme] = useStyletron()
  const [listing, setListing] = useState(false)
  const [creating, setCreating] = useState(false)
  /**
   * Playlist created by clicking Create
   */
  const [createdPlaylist, setCreatedPlaylist] = useState({})

  const { enqueue } = useSnackbar()

  const eventDate = eventData.dateChoice === DEFAULT_DATE ? eventData.defaultDate : eventData.customDate

  const titleParts = [orgInfo.orgName, eventDate, eventData.eventType, 'cam', cameraInfo.cameraNumber]
  const suggestedTitle = titleParts.filter(p => p).join(' ')
  const desiredTitle = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle

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
   * Success handler for creating a playlist
   */
  const playlistSuccess = playlist => {
    if (playlist.id) {
      const created = playlistResource(playlist)
      setCreatedPlaylist(created)
      setPlaylistData(created)
      console.log('created: ', created)
    } else {
      showError(enqueue, 'Unexpected response: ' + JSON.stringify(playlist))
    }
    setCreating(false)
  }

  /**
   * Failure handler for creating or finding a playlist
   */
  const playlistFailure = action => err => {
    let verb = ''
    if (action === ACTION_CREATE) {
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

  /**
   * Find list of (hopefully recent) playlists
   */
  function listPlaylists () {
    setListing(true)
    const successHandler = playlists => {
      setPlaylists(playlists.map(playlistResource))
      setListing(false)
    }
    const failureHandler = playlistFailure(ACTION_LIST)
    try {
      return youtube.listPlaylists(successHandler, failureHandler)
    } catch (e) {
      failureHandler(e)
    }
  }

  function createPlaylist () {
    setCreatedPlaylist({})
    setPlaylistData({})
    setCreating(true)
    try {
      youtube.insertPlaylist(
        desiredTitle,
        eventDate,
        playlistSuccess,
        playlistFailure(ACTION_CREATE)
      )
    } catch (e) {
      playlistFailure(ACTION_CREATE)(e)
    }
  }

  const isValidTitle = () => {
    if (playlistTitle.titleChoice === SUGGESTED) {
      return suggestedTitle !== ''
    } else {
      return playlistTitle.customTitle !== ''
    }
  }

  const playlistWasCreated = () => {
    const created = playlistData.title && createdPlaylist.title === playlistData.title &&
      playlistData.title === desiredTitle
    console.log(`playlistWasCreated: ${created}`)
    return created
  }

  const notifOverrides = {
    Body: {
      style: ({
        marginLeft: theme.sizing.scale600,
        width: 'auto',
        alignItems: 'center'
      })
    }
  }

  const showCreateStatus = () => {
    if (playlistTitle.tabIndex === 0 && playlistWasCreated()) {
      return (
        <Notification kind={NKind.positive} overrides={notifOverrides}>
          Playlist created: {createdPlaylist.title}
        </Notification>
      )
    }
    return null
  }

  const buttonOverrides = {
    Root: {
      style: ({
        marginTop: theme.sizing.scale600,
        marginBottom: theme.sizing.scale600
      })
    }
  }

  const showList = () => (
    <>
      <FormControl label='recent playlists'>
        <Select
          value={selectedPlaylist}
          onChange={({ value }) => {
            console.log('in recent playlists onChange: value = ', value)
            setSelectedPlaylist(value)
          }}
          isLoading={listing}
          options={playlists}
          valueKey='playlistId'
          labelKey='title'
          clearable={false}
        />
      </FormControl>
      <div className={css({ display: 'inline-flex', alignItems: 'center' })}>
        <Button
          onClick={listPlaylists}
          size={SIZE.small}
          isLoading={listing}
          overrides={buttonOverrides}
        >
          Refresh
        </Button>
      </div>
    </>
  )

  const showCreate = () => (
    <>
      <PlaylistTitle
        eventData={eventData}
        fileDataList={uploadList} suggestedTitle={suggestedTitle}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
      />
      <Button
        onClick={() => createPlaylist()}
        size={SIZE.small}
        kind={playlistWasCreated() ? KIND.secondary : KIND.primary}
        isLoading={creating}
        disabled={uploadList.length === 0 || !isValidTitle()}
        overrides={buttonOverrides}
      >
        Create
      </Button>
    </>
  )

  const storeSelected = useCallback(playlist => setPlaylistData(playlist), [playlistData])

  const nextOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
    (playlistTitle.tabIndex === 1 && selectedPlaylist[0] && selectedPlaylist[0].title)

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
        <Tab title='Create new playlist'>
          {showCreate()}
        </Tab>
        <Tab title='Use existing playlist'>
          {showList()}
        </Tab>
      </Tabs>
      {showCreateStatus()}
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

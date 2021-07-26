import React, { useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import { KIND as NKind, Notification } from 'baseui/notification'
import * as youtube from '../youtube/api'
import PlaylistTitle, { CUSTOM, SUGGESTED } from './PlaylistTitle'
import { Label2, Paragraph3 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'
import { errorMessage, showError } from '../util/showError'
import { DEFAULT_DATE } from './EventDate'
import { useStyletron } from 'baseui'

const ACTION_FIND = 'find'
const ACTION_CREATE = 'create'
const NOT_FOUND = 'not_found'

/**
 * Shows event data form:
 * - event date (defaults to date inferred from video start time)
 * Shows suggested playlist as [inferred date] + [event type]
 */
const PlaylistPage = ({
  orgInfo, uploadList,
  eventData,
  playlistTitle, setPlaylistTitle,
  playlistData, setPlaylistData,
  cameraInfo
}) => {
  /**
   * playlistData:
   * - id
   * - title
   * - itemCount
   * - publishedAt
   * - description
   * - eventDate
   */
  const [css, theme] = useStyletron()
  const [findStatus, setFindStatus] = useState({ message: '' })
  const [createStatus, setCreateStatus] = useState({ message: '' })
  const [finding, setFinding] = useState(false)
  const [creating, setCreating] = useState(false)
  const [adding, setAdding] = useState(false)
  const { enqueue } = useSnackbar()

  const eventDate =
    (eventData.dateChoice === DEFAULT_DATE ? eventData.defaultDate : eventData.customDate) || 'date?'

  const suggestedTitle =
    `${orgInfo.orgName || 'unknown org'} ${eventDate} ${eventData.eventType} cam ${cameraInfo.cameraNumber}`

  const desiredTitle = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle

  const foundOrCreatedPlaylist = playlistData.title && playlistData.title === desiredTitle

  const storePlaylist = (playlist, eventDate, msgIntro) => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      return setPlaylistData({
        ...playlistData,
        playlistId: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description,
        msgIntro: msgIntro
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
    storePlaylist(playlist, eventDate, msgIntro)
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
    const msgIntro = action === ACTION_FIND ? 'Error finding' : 'Error creating'
    showError(enqueue, `${msgIntro} playlist: ${errorMessage(err)}`)
    if (action === ACTION_FIND) {
      setFinding(false)
    } else {
      setCreating(false)
    }
  }

  function findPlaylist () {
    setFindStatus({}) // clear message, if any, first
    storePlaylist({}) // clear existing found playlist, if any
    setFinding(true)

    const title = desiredTitle

    const successHandler = playlist => {
      if (playlist) {
        playlistSuccess(eventDate, ACTION_FIND)(playlist)
      } else {
        setFinding(false)
        setFindStatus({ title: title, result: NOT_FOUND })
      }
    }

    try {
      return youtube.findPlaylist(title, successHandler, playlistFailure(ACTION_FIND))
    } catch (e) {
      playlistFailure(ACTION_FIND)(e)
    }
  }

  function createPlaylist () {
    setCreateStatus({})
    storePlaylist({}) // clear existing found / created playlist, if any
    setCreating(true)
    try {
      youtube.insertPlaylist(
        desiredTitle,
        eventDate,
        playlistSuccess(eventDate, ACTION_CREATE),
        playlistFailure(ACTION_CREATE)
      )
    } catch (e) {
      playlistFailure(ACTION_CREATE)(e)
    }
  }

  const addToPlaylist = async () => {
    setAdding(true)
    // TODO: onsuccess, onfailure, display results for each video
    for (const upload of uploadList) {
      await youtube.insertPlaylistItem(upload.videoId, playlistData.playlistId)
    }
  }

  const isValidTitle = () => {
    if (playlistTitle.titleChoice === SUGGESTED) {
      return suggestedTitle !== ''
    } else {
      return playlistTitle.customTitle !== ''
    }
  }

  const playlistWasFound = () => {
    return playlistData.title && findStatus.title === playlistData.title &&
      foundOrCreatedPlaylist && findStatus.result !== NOT_FOUND
  }

  const playlistWasNotFound = () => {
    return findStatus.title === desiredTitle && !foundOrCreatedPlaylist && findStatus.result === NOT_FOUND
  }

  const playlistWasCreated = () => {
    return playlistData.title && createStatus.title === playlistData.title && foundOrCreatedPlaylist
  }

  const playlistWasNotCreated = () => {
    return createStatus.title === desiredTitle && !foundOrCreatedPlaylist
  }

  const notifOverrides = {
    Body: {
      style: ({ $theme }) => ({
        marginLeft: $theme.sizing.scale600,
        width: 'auto',
        alignItems: 'center'
      })
    }
  }

  const showFindStatus = () => {
    if (playlistWasFound()) {
      return (
        <Notification kind={NKind.positive} overrides={notifOverrides}>
          Playlist found: {playlistData.title}
        </Notification>
      )
    }
    if (playlistWasNotFound()) {
      return (
        <Notification kind={NKind.neutral} overrides={notifOverrides}>
          Playlist not found: {findStatus.title}
        </Notification>
      )
    }
    return null
  }

  const showCreateStatus = () => {
    if (playlistWasCreated()) {
      return (
        <Notification kind={NKind.positive} overrides={notifOverrides}>
          Playlist created: {playlistData.title}
        </Notification>
      )
    }
    if (playlistWasNotCreated()) {
      return (
        <Notification kind={NKind.negative} overrides={notifOverrides}>
          Playlist not created: {findStatus.title}
        </Notification>
      )
    }
    return null
  }

  const buttonOverrides = {
    Root: {
      style: ({ $theme }) => ({
        marginTop: $theme.sizing.scale600,
        marginBottom: $theme.sizing.scale600
      })
    }
  }

  const showFindButton = () => (
    <>
      <Label2>2a. Check</Label2>
      <div className={css({ display: 'inline-flex', alignItems: 'center' })}>
        <Button
          onClick={() => findPlaylist()}
          size={SIZE.small}
          kind={playlistWasCreated() || playlistWasFound() || playlistWasNotFound() ? KIND.secondary : KIND.primary}
          isLoading={finding}
          disabled={uploadList.length === 0 || !isValidTitle()}
          overrides={buttonOverrides}
        >
          Check for Existing Playlist
        </Button>
        {showFindStatus()}
      </div>
    </>
  )

  const showCreateButton = () =>
    (
      <>
        <Label2>2b. Create</Label2>
        <div className={css({ display: 'inline-flex', alignItems: 'center' })}>
          <Button
            onClick={() => createPlaylist()}
            size={SIZE.small}
            kind={playlistWasCreated() ? KIND.secondary : KIND.primary}
            isLoading={creating}
            disabled={uploadList.length === 0 || !isValidTitle()}
            overrides={buttonOverrides}
          >
            Create New Playlist
          </Button>
          {showCreateStatus()}
        </div>
      </>
    )

  /**
   * Adds videos to playlist
   */
  const showAddButton = () =>
    (
      <>
        <Label2>3. Add</Label2>
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
      <Paragraph3>
        Choose an existing playlist to add your videos to, or create a new one.
      </Paragraph3>
      <Label2>1. Choose Title</Label2>
      <PlaylistTitle
        eventData={eventData}
        fileDataList={uploadList} suggestedTitle={suggestedTitle}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
      />
      {showFindButton()}
      {findStatus.result === NOT_FOUND ? showCreateButton() : null}
      {foundOrCreatedPlaylist ? showAddButton() : null}
    </>
  )
}

export default PlaylistPage

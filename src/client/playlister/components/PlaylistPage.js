import React, { useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import { KIND as NKind, Notification } from 'baseui/notification'
import EventData from './EventData'
import { findPlaylist, insertPlaylist } from '../youtube/api'
import PlaylistTitle, { CUSTOM, SUGGESTED } from './PlaylistTitle'
import inferDate from './InferredDate'
import { Paragraph3 } from 'baseui/typography'
import { useSnackbar } from 'baseui/snackbar'

/**
 * Shows event data form:
 * - event date (defaults to date inferred from video start time)
 * Shows suggested playlist as [inferred date] + [event type]
 */
const PlaylistPage = ({
  uploadList,
  eventData, setEventData,
  playlistTitle, setPlaylistTitle,
  playlistData, setPlaylistData
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
  const [playlistStatus, setPlaylistStatus] = useState({ message: '' })
  const [loading, setLoading] = useState(false)
  const { enqueue } = useSnackbar()

  const inferredDate = inferDate(uploadList)

  const suggestedTitle = () => {
    const date = eventData.eventDate || inferredDate
    const eventType = eventData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  const storePlaylist = (playlist, eventDate, msgIntro) => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      return setPlaylistData({
        ...playlistData,
        id: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description,
        eventDate: eventDate,
        msgIntro: msgIntro
      })
    } else {
      return setPlaylistData({})
    }
  }

  /**
   * Success handler for creating or finding a playlist
   */
  const playlistSuccess = (msgIntro, eventDate) => playlist => {
    storePlaylist(playlist, eventDate, msgIntro)
    setPlaylistStatus({
      ...playlistStatus,
      message: `${msgIntro} playlist "${playlist.snippet.title}"`,
      isError: false
    })
    setLoading(false)
  }

  /**
   * Failure handler for creating or finding a playlist
   */
  const playlistFailure = msgIntro => err => {
    let errorMsg = err
    try {
      errorMsg = JSON.stringify(err)
    } catch {
      // no-op
    }
    enqueue({ message: `${msgIntro} playlist: ${errorMsg}` })
    setLoading(false)
  }

  function findOrCreatePlaylist () {
    setPlaylistStatus({}) // clear message, if any, first
    storePlaylist({}) // clear existing found playlist, if any
    const eventDate = eventData.eventDate || inferDate(uploadList)
    setLoading(true)
    const title = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle()
    const successHandler = playlist => {
      if (playlist) {
        playlistSuccess('Found existing', eventDate)(playlist)
      } else {
        createPlaylist(title, eventDate)
      }
    }

    try {
      return findPlaylist(title, successHandler, playlistFailure('Error finding'))
    } catch (e) {
      enqueue({ message: e.message })
      setLoading(false)
    }
  }

  function createPlaylist (title, eventDate) {
    insertPlaylist(
      title,
      eventDate,
      playlistSuccess('Created', eventDate),
      playlistFailure('Error creating')
    )
  }

  const showFindCreateStatus = () => {
    if (playlistData.id) {
      const kind = NKind.positive
      return (
        <Notification kind={kind}>
          {playlistData.msgIntro} playlist {playlistData.title}
        </Notification>
      )
    } else {
      return null
    }
  }

  const isValidTitle = () => {
    if (playlistTitle.titleChoice === SUGGESTED) {
      return suggestedTitle() !== ''
    } else {
      return playlistTitle.customTitle !== ''
    }
  }

  return (
    <>
      <Paragraph3>
        You'll need to find an existing playlist to add your videos to, or create a new one.<br />
        The suggested playlist title is based on the event date and event type.
      </Paragraph3>
      <PlaylistTitle
        eventData={eventData}
        fileDataList={uploadList} suggestedTitle={suggestedTitle()}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
      />
      <EventData
        eventData={eventData} setEventData={setEventData}
        fileDataList={uploadList}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={() => findOrCreatePlaylist()}
          size={SIZE.compact}
          kind={playlistData.id ? KIND.secondary : KIND.primary}
          isLoading={loading}
          disabled={uploadList.length === 0 || !isValidTitle()}
          overrides={{
            Root: {
              style: ({ $theme }) => ({
                marginTop: $theme.sizing.scale600,
                marginBottom: $theme.sizing.scale600
              })
            }
          }}
        >
          Find or Create Playlist
        </Button>
        {showFindCreateStatus()}
      </div>
    </>
  )
}

export default PlaylistPage

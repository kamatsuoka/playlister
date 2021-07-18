import React, { useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import { Table } from 'baseui/table-semantic'
import { KIND as NKind, Notification } from 'baseui/notification'
import { BaseCard } from './BaseCard'
import { findPlaylist, insertPlaylist } from '../youtube/api'
import PlaylistTitle, { CUSTOM, SUGGESTED } from './PlaylistTitle'
import inferDate from './InferredDate'

/**
 * Shows event data form:
 * - event date (defaults to date inferred from video start time)
 * Shows suggested playlist as [inferred date] + [event type]
 */
const PlaylistPage = ({
  fileDataList,
  eventData, setEventData,
  playlistTitle, setPlaylistTitle,
  playlistData, setPlaylistData
}) => {
  const [playlistStatus, setPlaylistStatus] = useState({ message: '' })
  const [loading, setLoading] = useState(false)

  const inferredDate = inferDate(fileDataList)

  const suggestedTitle = () => {
    const date = eventData.eventDate || inferredDate
    const eventType = eventData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  const storePlaylist = playlist => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      return setPlaylistData({
        ...playlistData,
        id: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description
      })
    } else {
      return setPlaylistData({})
    }
  }

  /**
   * Success handler for creating or finding a playlist
   */
  const playlistSuccess = msgIntro => playlist => {
    storePlaylist(playlist)
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
    setPlaylistStatus({
      ...playlistStatus,
      message: `${msgIntro} playlist: ${errorMsg}`,
      isError: true
    })
    setLoading(false)
  }

  function findOrCreatePlaylist () {
    setPlaylistStatus({}) // clear message, if any, first
    storePlaylist({}) // clear existing found playlist, if any
    setLoading(true)
    const title = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle()
    const successHandler = playlist => {
      if (playlist) {
        playlistSuccess('Found existing')(playlist)
      } else {
        createPlaylist(title)
      }
    }
    return findPlaylist(title, successHandler, playlistFailure('Error finding'))
  }

  function createPlaylist (title) {
    insertPlaylist(title, playlistSuccess('Created'), playlistFailure('Error creating'))
  }

  const showPlaylist = () => {
    if (playlistData.id) {
      const DATA = [
        ['title', playlistData.title],
        ['description', playlistData.description],
        ['id', playlistData.id],
        ['item count', playlistData.itemCount],
        ['published at', playlistData.publishedAt]
      ]
      return (
        <BaseCard title='Playlist'>
          <Table data={DATA} columns={['Field', 'Value']} />
        </BaseCard>
      )
    }
    return null
  }

  const showNotification = () => {
    if (playlistStatus.message) {
      const kind = playlistStatus.isError ? NKind.negative : NKind.positive
      return (
        <Notification kind={kind} overrides={{ Body: { style: { width: 'auto' } } }} closeable>
          {playlistStatus.message}
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
      <Button
        onClick={() => findOrCreatePlaylist()}
        size={SIZE.compact}
        kind={playlistData.id ? KIND.secondary : KIND.primary}
        isLoading={loading}
        disabled={fileDataList.length === 0 || !isValidTitle()}
        overrides={{
          Root: { style: ({ $theme }) => ({ marginBottom: $theme.sizing.scale600 }) }
        }}
      >
        Find or Create Playlist
      </Button>
      <PlaylistTitle
        eventData={eventData} setEventData={setEventData}
        fileDataList={fileDataList} suggestedTitle={suggestedTitle()}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
      />
      {showNotification()}
      {showPlaylist()}
    </>
  )
}

export default PlaylistPage

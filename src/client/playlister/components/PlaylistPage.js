import React, { useEffect, useState } from 'react'
import { Button, KIND, SIZE } from 'baseui/button'
import { Table } from 'baseui/table-semantic'
import EventData from './EventData'
import PlaylistTitle from './PlaylistTitle'
import { KIND as NKind, Notification } from 'baseui/notification'
import { BaseCard } from './BaseCard'
import { findPlaylist, insertPlaylist } from '../youtube/api'
import dayjs from 'dayjs'

const inferDate = (startEndList) => {
  const dateSet = new Set()
  startEndList.map(f => dayjs(f.startTime)
    .format('YYYYMMDD'))
    .forEach(d => dateSet.add(d))
  return dateSet.size > 0 ? dateSet.values().next().value : ''
}

const PlaylistPage = ({
  startEndList,
  eventData, setEventData,
  playlistTitle, setPlaylistTitle,
  playlistSettings, setPlaylistSettings
}) => {
  const [playlistStatus, setPlaylistStatus] = useState({ message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEventData({ ...eventData, inferredDate: inferDate(startEndList) })
  }, [eventData, setEventData, startEndList])

  const suggestedTitle = () => {
    const date = eventData.inferredDate || ''
    const eventType = eventData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  const storePlaylist = (playlist) => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      return setPlaylistSettings({
        ...playlistSettings,
        id: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description
      })
    } else {
      return setPlaylistSettings({})
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
    const title = playlistTitle.titleChoice === 'custom' ? playlistTitle.customTitle : suggestedTitle()
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
    if (playlistSettings.id) {
      const DATA = [
        ['title', playlistSettings.title],
        ['description', playlistSettings.description],
        ['id', playlistSettings.id],
        ['item count', playlistSettings.itemCount],
        ['published at', playlistSettings.publishedAt]
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

  return (
    <>
      <EventData value={eventData} setValue={setEventData} />
      <PlaylistTitle
        eventData={eventData}
        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
      />
      <Button
        onClick={() => findOrCreatePlaylist()}
        size={SIZE.compact}
        kind={playlistSettings.id ? KIND.secondary : KIND.primary}
        isLoading={loading}
      >
        Find or Create Playlist
      </Button>
      {showNotification()}
      {showPlaylist()}
    </>
  )
}

export default PlaylistPage

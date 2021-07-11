import React, { useState } from 'react'
import { Button, KIND as BKind } from 'baseui/button'
import { Table } from 'baseui/table-semantic'
import RehearsalData from './RehearsalData'
import PlaylistTitle from './PlaylistTitle'
import { KIND, Notification } from 'baseui/notification'
import { BaseCard } from './BaseCard'
import { findPlaylist, insertPlaylist } from '../youtube/api'

const PlaylistPage = ({
  rehearsalData, setRehearsalData,
  inferredDate, setActiveKey,
  playlistTitle, setPlaylistTitle,
  value, setValue
}) => {
  const [playlistStatus, setPlaylistStatus] = useState({ message: '' })

  const suggestedTitle = () => {
    const date = inferredDate.date || ''
    const eventType = rehearsalData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  const storePlaylist = (playlist) => {
    // eslint-disable-next-line no-prototype-builtins
    if (playlist.hasOwnProperty(['id'])) {
      return setValue({
        ...value,
        id: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description
      })
    } else {
      return setValue({})
    }
  }

  function findOrCreatePlaylist () {
    setPlaylistStatus({}) // clear message, if any, first
    const title = playlistTitle.titleChoice === 'custom' ? playlistTitle.customTitle : suggestedTitle()
    const successHandler = playlist => {
      if (playlist) {
        storePlaylist(playlist)
        setPlaylistStatus({
          ...playlistStatus,
          message: `Found existing playlist "${playlist.snippet.title}"`,
          isError: false
        })
      } else {
        return createPlaylist(title)
      }
    }
    const failureHandler = error => setPlaylistStatus({
      ...playlistStatus,
      message: `Error calling findPlaylist: ${error}`,
      isError: true
    })

    return findPlaylist(title, successHandler, failureHandler)
  }

  function createPlaylist (title) {
    const successHandler = playlist => {
      storePlaylist(playlist)
      setPlaylistStatus({
        ...playlistStatus,
        message: `Created playlist "${playlist.snippet.title}"`,
        isError: false
      })
    }
    const failureHandler = err => {
      console.error('Execute error', err)
      storePlaylist({})
      setPlaylistStatus({
        ...playlistStatus,
        message: `Error creating playlist: ${JSON.stringify(err)}`,
        isError: true
      })
    }
    insertPlaylist(title, successHandler, failureHandler)
  }

  const showPlaylist = () => {
    if (value.id) {
      const DATA = [
        ['title', value.title],
        ['description', value.description],
        ['id', value.id],
        ['item count', value.itemCount],
        ['published at', value.publishedAt]
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
      const kind = playlistStatus.isError ? KIND.negative : KIND.positive
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
      <RehearsalData inferredDate={inferredDate} value={rehearsalData} setValue={setRehearsalData}/>
      <PlaylistTitle
        inferredDate={inferredDate} rehearsalData={rehearsalData}
        value={playlistTitle} setValue={setPlaylistTitle}
      />
      <Button onClick={() => findOrCreatePlaylist()} kind={value.id ? BKind.secondary : BKind.primary}>
        Find or Create Playlist
      </Button>
      {showNotification()}
      {showPlaylist()}
    </>
  )
}

export default PlaylistPage

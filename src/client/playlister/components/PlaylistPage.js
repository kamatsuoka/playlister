import React, { useState } from 'react'
import { Button, KIND as BKind } from 'baseui/button'
import dayjs from 'dayjs'
import { Table } from 'baseui/table-semantic'
import RehearsalData from './RehearsalData'
import PlaylistTitle from './PlaylistTitle'
import { KIND, Notification } from 'baseui/notification'
import { BaseCard } from './BaseCard'
import { StyledLink } from 'baseui/link'
import { gapi, isAuthenticated } from '../util/auth'

const PlaylistPage = ({
                        rehearsalData, setRehearsalData,
                        inferredDate, setActiveKey,
                        playlistTitle, setPlaylistTitle,
                        value, setValue,
                      }) => {
  const [playlistStatus, setPlaylistStatus] = useState({ message: '' })
  const MAX_RESULTS = 50

  const suggestedTitle = () => {
    const date = inferredDate.date || ''
    const eventType = rehearsalData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  const storePlaylist = (playlist) => {
    if (playlist.hasOwnProperty(['id'])) {
      return setValue({
        ...value,
        id: playlist.id,
        title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount,
        publishedAt: playlist.snippet.publishedAt,
        description: playlist.snippet.description,
      })
    } else {
      return setValue({})
    }
  }

  function searchPlaylists() {
    const searchTitle = playlistTitle.titleChoice === 'custom' ? playlistTitle.customTitle : suggestedTitle()
    const failureHandler = error => setPlaylistStatus({
      ...playlistStatus,
      message: `Error calling findMyPlaylist: ${error}`,
      isError: true,
    })

    const successHandler = playlist => {
      console.log(`in searchPlaylists, playlist = ${playlist}`)
      if (playlist) {
        storePlaylist(playlist)
        setPlaylistStatus({
          ...playlistStatus,
          message: `Found existing playlist "${playlist.snippet.title}"`,
          isError: false,
        })
      } else {
        // insertPlaylist(searchTitle)
      }
    }

    google.script.run
      .withSuccessHandler(successHandler)
      .withFailureHandler(failureHandler)
      .findMyPlaylist(searchTitle)
  }

  function insertPlaylist(title) {
    const playlistProps = {
      'part': [
        'snippet,contentDetails,status',
      ],
      'resource': {
        'snippet': {
          'title': title,
          'description': `created by playlister on ${dayjs()}`,
        },
        'status': {
          'privacyStatus': 'unlisted',
        },
      },
    }
    return gapi.client.youtube.playlists.insert(playlistProps).then(response => {
      const playlist = response.result
      storePlaylist(playlist)
      setPlaylistStatus({
        ...playlistStatus,
        message: `Created playlist "${response.result.snippet.title}"`,
        isError: false,
      })
    }, err => {
      console.error('Execute error', err)
      storePlaylist({})
      setPlaylistStatus({
        ...playlistStatus,
        message: `Error creating playlist: ${JSON.stringify(err)}`,
        isError: true,
      })
    })
  }

  const showPlaylist = () => {
    if (value.id) {
      const DATA = [
        ['title', value.title],
        ['description', value.description],
        ['id', value.id],
        ['item count', value.itemCount],
        ['published at', value.publishedAt],
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
    if (!isAuthenticated()) {
      return <Notification kind={KIND.negative}
                           overrides={{
                             Body: { style: { width: 'auto' } },
                           }}
      >
        Please &nbsp;
        <StyledLink onClick={() => setActiveKey(1)}>authenticate</StyledLink>
        &nbsp; first
      </Notification>
    } else if (playlistStatus.message) {
      const kind = playlistStatus.isError ? KIND.negative : KIND.positive
      return <Notification kind={kind}
                           overrides={{
                             Body: { style: { width: 'auto' } },
                           }}
                           closeable
      >
        {playlistStatus.message}
      </Notification>
    } else {
      return null
    }
  }

  return (
    <React.Fragment>
      <RehearsalData inferredDate={inferredDate} value={rehearsalData} setValue={setRehearsalData} />
      <PlaylistTitle inferredDate={inferredDate} rehearsalData={rehearsalData}
                     value={playlistTitle} setValue={setPlaylistTitle} />
      <Button onClick={() => searchPlaylists()} kind={value.id ? BKind.secondary : BKind.primary}>
        Find Playlist
      </Button>
      {showNotification()}
      {showPlaylist()}
    </React.Fragment>
  )
}

export default PlaylistPage

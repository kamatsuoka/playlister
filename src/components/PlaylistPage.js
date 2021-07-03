import React, {useState} from "react"
import {Button, KIND as BKind, SIZE} from "baseui/button"
import dayjs from "dayjs"
import {Table} from "baseui/table-semantic"
import RehearsalData from "./RehearsalData"
import PlaylistTitle from "./PlaylistTitle"
import {KIND, Notification} from "baseui/notification"
import {BaseCard} from "./BaseCard"

const gapi = window.gapi


const PlaylistPage = ({
                        googleAuth, rehearsalData, setRehearsalData,
                        inferredDate, setActiveKey, value, setValue
                      }) => {
  const [playlistStatus, setPlaylistStatus] = useState({message: ''})
  const [playlistTitle, setPlaylistTitle] = useState({titleChoice: 'suggested'})
  const MAX_RESULTS = 50

  const suggestedTitle = () => {
    const date = inferredDate.date || ''
    const eventType = rehearsalData.eventType
    return (date && eventType) ? date.replaceAll('-', '') + ' ' + eventType : ''
  }

  /**
   * Find existing playlist with same name
   */
  const findMatchingPlaylist = (result, searchTitle) => {
    const matchingPlaylists = result.items.filter(i => i.snippet.title === searchTitle)
    if (matchingPlaylists && matchingPlaylists[0]) {
      return matchingPlaylists[0]
    }
    return null
  }

  const storePlaylist = (playlist) => {
    console.log('storePlaylist: playlist = ', playlist)
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


  function searchPlaylists(nextPageToken = '') {
    const request = {
      "part": [
        "snippet,contentDetails"
      ],
      "maxResults": MAX_RESULTS,
      "mine": true
    }
    const searchTitle = playlistTitle.titleChoice === 'custom' ? playlistTitle.customTitle : suggestedTitle()

    if (nextPageToken !== '')
      request.pageToken = nextPageToken
    return gapi.client.youtube.playlists.list(request).then(
      response => {
        const playlist = findMatchingPlaylist(response.result, searchTitle)
        if (playlist) {
          console.log('found matching playlist', playlist)
          storePlaylist(playlist)
          setPlaylistStatus({
            ...playlistStatus,
            message: `Found existing playlist "${playlist.snippet.title}"`,
            isError: false
          })
        } else if (response.result.nextPageToken) {
          searchPlaylists(response.result.nextPageToken)
        } else {
          insertPlaylist(searchTitle)
        }
      },
      err => console.error("Execute error", err)
    )
  }

  function insertPlaylist(title) {
    const playlistProps = {
      "part": [
        "snippet,contentDetails,status"
      ],
      "resource": {
        "snippet": {
          "title": title,
          "description": `created by playlister on ${dayjs()}`,
        },
        "status": {
          "privacyStatus": "unlisted"
        }
      }
    }
    console.log('insertPlaylist: inserting playlist with props', playlistProps)
    return gapi.client.youtube.playlists.insert(playlistProps).then(response => {
      const playlist = response.result
      console.log('insertPlaylist: playlist = ', playlist)
      storePlaylist(playlist)
      setPlaylistStatus({
        ...playlistStatus,
        message: `Created playlist "${response.result.snippet.title}"`,
        isError: false
      })
    }, err => {
      console.error("Execute error", err)
      storePlaylist({})
      setPlaylistStatus({
        ...playlistStatus,
        message: `Error creating playlist: ${JSON.stringify(err)}`,
        isError: true
      })
    })
  }

  const isAuthenticated = () => googleAuth && googleAuth.isSignedIn

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
        <BaseCard title="Playlist">
          <Table data={DATA} columns={['Field', 'Value']}/>
        </BaseCard>
      )
    }
    return null
  }

  const showNotification = () => {
    if (!isAuthenticated()) {
      return <Notification kind={KIND.negative}
                           overrides={{
                             Body: {style: {width: 'auto'}}
                           }}
      >
        Please
        <Button kind={BKind.minimal} size={SIZE.compact} onClick={() => setActiveKey(1)}
                overrides={{
                  BaseButton: {style: {padding: '2px 7px'}}
                }}
        >
          authenticate
        </Button>
        to find or create the playlist
      </Notification>
    } else if (playlistStatus.message) {
      const kind = playlistStatus.isError ? KIND.negative : KIND.positive
      return <Notification kind={kind}
                           overrides={{
                             Body: {style: {width: 'auto'}},
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
      <RehearsalData inferredDate={inferredDate} value={rehearsalData} setValue={setRehearsalData}/>
      <PlaylistTitle inferredDate={inferredDate} rehearsalData={rehearsalData}
                     value={playlistTitle} setValue={setPlaylistTitle}/>
      <Button onClick={() => searchPlaylists()} kind={value.id ? BKind.secondary : BKind.primary}
              disabled={!isAuthenticated()}
      >
        Find or Create Playlist
      </Button>
      {showNotification()}
      {showPlaylist()}
    </React.Fragment>
  )
}

export default PlaylistPage

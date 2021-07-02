import {Heading, HeadingLevel} from "baseui/heading"
import React, {useState} from "react"
import {Button} from "baseui/button"
import dayjs from "dayjs"
import {Table} from "baseui/table-semantic"
import {ALIGN, Radio, RadioGroup} from "baseui/radio"
import {inferredDate} from "./RehearsalData"
import {Input} from "baseui/input"
import {createTheme, lightThemePrimitives, ThemeProvider} from "baseui"

const gapi = window.gapi

const PlaylistPage = ({googleAuth, startEndList, rehearsalData, value, setValue}) => {
  const [playlistStatus, setPlaylistStatus] = useState({message: ''})
  const [formChoice, setFormChoice] = useState({titleChoice: 'suggested'})
  const MAX_RESULTS = 50

  const suggestedTitle = () => {
    const date = inferredDate(startEndList)
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
    const searchTitle = formChoice.titleChoice === 'custom' ? formChoice.customTitle : suggestedTitle()

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
        message: `Created playlist "${response.result.snippet.title}"`
      })
    }, err => {
      console.error("Execute error", err)
      storePlaylist({})
      setPlaylistStatus({
        ...playlistStatus,
        message: `Error creating playlist: ${JSON.stringify(err)}`
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
        <React.Fragment>
          <Heading styleLevel={6}>Playlist</Heading>
          <Table data={DATA} columns={['Field', 'Value']}/>
        </React.Fragment>
      )
    }
    return null
  }

  return (
    <HeadingLevel>
      <Heading styleLevel={6}>Playlist Title</Heading>
      <div style={{marginBottom: '20px'}}>
        <ThemeProvider
          theme={createTheme(lightThemePrimitives, {
            colors: {inputTextDisabled: 'black'}
          })}
        >
          <RadioGroup
            value={formChoice.titleChoice}
            onChange={e => setFormChoice({...formChoice, titleChoice: e.currentTarget.value})}
            name="titleChoice"
            align={ALIGN.horizontal}
          >
            <Radio value="suggested">Suggested &nbsp;</Radio>
            <Radio value="custom">Custom</Radio>
          </RadioGroup>
          <Input
            value={formChoice.titleChoice === 'suggested' ?
              suggestedTitle(inferredDate(startEndList), rehearsalData.eventType) :
              formChoice.customTitle || ''}
            onChange={e => {
              if (formChoice.titleChoice === 'custom')
                return setFormChoice({...formChoice, customTitle: e.target.value})
              else
                return null
            }}
            disabled={formChoice.titleChoice !== 'custom'}
          />
        </ThemeProvider>
      </div>
      <Button onClick={() => searchPlaylists()} disabled={!isAuthenticated()}>Find or Create Playlist</Button>
      <p>{playlistStatus.message}</p>
      {isAuthenticated() ? null : <p>Please authenticate first</p>}
      {showPlaylist()}
    </HeadingLevel>
  )
}

export default PlaylistPage

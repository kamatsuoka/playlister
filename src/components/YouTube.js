import {HeadingLevel} from "baseui/heading"
import React, {useEffect, useState} from "react"
import {Button} from "baseui/button"
import PlaylistSettings from "./PlaylistSettings"
import dayjs from "dayjs"
import TrackNameSettings from "./TrackNameSettings"

const gapi = window.gapi


const YouTube = ({googleAuth, startEndList}) => {
  const [playlistSettings, setPlaylistSettings] = useState({eventType: "rehearsal"})
  const [trackNameSettings, setTrackNameSettings] = useState({
    prefix: "fcs",
    cameraView: "chorus"
  })
  const [foundPlaylist, setFoundPlaylist] = useState({})

  useEffect(() => {
    if (!playlistSettings.hasOwnProperty('date')) {
      // If video dates are all the same, use that as default
      const dateSet = new Set()
      startEndList.map(f => dayjs(f.startTime)
        .format("YYYY-MM-DD"))
        .forEach(d => dateSet.add(d))
      if (dateSet.size === 1) {
        setPlaylistSettings({...playlistSettings, date: dateSet.values().next().value})
      }
    }
  }, [playlistSettings, startEndList])

  const MAX_RESULTS = 50

  /**
   * Find existing playlist with same name
   */
  const findMatchingPlaylist = (result) => {
    const matchingPlaylists = result.items.filter(i => i.snippet.title === playlistSettings.title)
    if (matchingPlaylists && matchingPlaylists[0]) {
      const playlist = matchingPlaylists[0]
      return {
        id: playlist.id, title: playlist.snippet.title,
        itemCount: playlist.contentDetails.itemCount
      }
    }
    return {}
  }


  // Make sure the client is loaded and sign-in is complete before calling this method.

  function searchPlaylists(nextPageToken = '') {
    const request = {
      "part": [
        "snippet,contentDetails"
      ],
      "maxResults": MAX_RESULTS,
      "mine": true
    }
    if (nextPageToken !== '')
      request.pageToken = nextPageToken
    return gapi.client.youtube.playlists.list(request).then(
      response => {
        const {id, title, itemCount} = findMatchingPlaylist(response.result)
        if (id) {
          setFoundPlaylist({
            ...foundPlaylist,
            id: id,
            message: `found playlist "${title}" with ${itemCount} item(s)`,
            err: ''
          })
          setTrackNameSettings({...trackNameSettings, startIndex: itemCount + 1})
        } else if (response.result.nextPageToken) {
          searchPlaylists(response.result.nextPageToken)
        } else {
          insertPlaylist()
        }
      },
      err => console.error("Execute error", err)
    )
  }

  function insertPlaylist() {
    return gapi.client.youtube.playlists.insert({
      "part": [
        "snippet,status"
      ],
      "resource": {
        "snippet": {
          "title": playlistSettings.title,
          "defaultLanguage": "en"
        },
        "status": {
          "privacyStatus": "unlisted"
        }
      }
    }).then(response => {
      const playlistId = response.result.id
      setFoundPlaylist({
        ...foundPlaylist,
        id: playlistId,
        message: `created playlist "${response.result.snippet.title}"`
      })
      setTrackNameSettings({...trackNameSettings, startIndex: 1})
    }, err => {
      console.error("Execute error", err)
      setFoundPlaylist({
        ...foundPlaylist,
        id: '',
        message: `error creating playlist: ${JSON.stringify(err)}`
      })
    })
  }

  const isAuthenticated = () => googleAuth && googleAuth.isSignedIn

  return (
    <HeadingLevel>
      <div style={{marginTop: '20px'}}>
        <PlaylistSettings startEndList={startEndList} value={playlistSettings} setValue={setPlaylistSettings}/>
      </div>
      <Button onClick={() => searchPlaylists()} disabled={!isAuthenticated()}>Find or Create Playlist</Button>
      <p>{foundPlaylist.message}</p>
      {isAuthenticated() ? null : <p>Please authenticate first</p>}
      <div style={{marginTop: '20px'}}>
        <TrackNameSettings startEndList={startEndList} value={trackNameSettings} setValue={setTrackNameSettings}/>
      </div>
    </HeadingLevel>
  )
}

export default YouTube

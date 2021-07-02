import {Heading, HeadingLevel} from "baseui/heading"
import React, {useEffect, useState} from "react"
import {Input} from "baseui/input"
import {copyData, usePersist} from "../hooks/usePersist"
import {Button} from "baseui/button"
import PlaylistSettings from "./PlaylistSettings"
import dayjs from "dayjs"
import TrackNameSettings from "./TrackNameSettings"

const gapi = window.gapi


const YouTube = ({googleAuth, startEndList}) => {
  const [channelData, setChannelData] = useState({channelId: ''})
  const [playlistSettings, setPlaylistSettings] = useState({eventType: "rehearsal"})
  const [trackNameSettings, setTrackNameSettings] = useState({
    prefix: "fcs",
    cameraView: "chorus"
  })
  const [foundPlaylist, setFoundPlaylist] = useState({})

  usePersist({
    key: 'channelData',
    onRestore: copyData,
    setState: setChannelData,
    state: channelData,
  })

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
    console.log(`findMatchPlaylist: result = `, result)
    const totalResults = result.pageInfo.totalResults
    if (totalResults > 0) {
      const matchingPlaylist = result.items.filter(i => i.snippet.title === playlistSettings.title)
      if (matchingPlaylist && matchingPlaylist[0]) {
        return matchingPlaylist.id.playlistId
      }
    }
    return null
  }


  // Make sure the client is loaded and sign-in is complete before calling this method.

  function searchPlaylists(pageToken = '') {
    const request = {
      "part": [
        "snippet,contentDetails"
      ],
      "channelId": channelData.channelId,
      "maxResults": MAX_RESULTS
    }
    console.log('request = ', JSON.stringify(request))
    console.log(`pageToken = "${pageToken}"`)
    if (pageToken !== '')
      request.pageToken = pageToken
    return gapi.client.youtube.playlists.list(request).then(
      response => {
        const playlistId = findMatchingPlaylist(response.result)
        if (playlistId) {
          setFoundPlaylist({
            ...foundPlaylist,
            id: playlistId,
            message: `found playlist ${response.result.snippet.title}`
          })
          listPlaylistItems(playlistId)
        } else if (response.result.nextPageToken) {
          searchPlaylists(response.result.nextPageToken)
        } else {
          insertPlaylist()
        }
      },
      err => console.error("Execute error", err)
    )
  }

  function listPlaylistItems(playlistId) {
    return gapi.client.youtube.playlistItems.list({
      "part": [
        "snippet"
      ],
      "playlistId": playlistId
    })
      .then(function (response) {
          // Handle the results here (response.result has the parsed body).
          console.log("Response", response);
        },
        function (err) {
          console.error("Execute error", err);
        });
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
        message: `created playlist ${response.result.snippet.title}`
      })
      setTrackNameSettings({...trackNameSettings, startIndex: 1})
    }, err => {
      console.error("Execute error", err)
      setFoundPlaylist({
        ...foundPlaylist,
        id: '',
        message: `error creating playlist: ${err}`
      })
    })
  }

  const isAuthenticated = () => googleAuth && googleAuth.isSignedIn

  return (
    <HeadingLevel>
      <Heading styleLevel={6}>Channel ID</Heading>
      <Input
        value={channelData.channelId}
        onChange={e => setChannelData({...channelData, channelId: e.target.value})}
      />
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

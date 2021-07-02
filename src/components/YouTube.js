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

  const MAX_RESULTS = 25

  /**
   * Find existing playlist with same name
   */
  const findMatchingPlaylist = (result) => {
    const totalResults = result.pageInfo.totalResults
    if (totalResults > MAX_RESULTS)
      console.warn(`got ${totalResults} playlists from search, there may be more on the next page`)
    if (totalResults > 0) {
      const matchingPlaylist = result.items.filter(i => i.snippet.title === playlistSettings.title)
      if (matchingPlaylist && matchingPlaylist[0]) {
        return matchingPlaylist.id.playlistId
      }
    }
    return null
  }

  // Make sure the client is loaded and sign-in is complete before calling this method.

  function searchPlaylists() {
    return gapi.client.youtube.search.list({
      "part": [
        "snippet"
      ],
      "channelId": channelData.channelId,
      "maxResults": MAX_RESULTS,
      "type": "playlist",
      "q": playlistSettings.title
    }).then(
      response => {
        const playlistId = findMatchingPlaylist(response.result)
        if (playlistId) {
          // TODO: call playlist items api to get count of videos
        } else {
          setTrackNameSettings({...trackNameSettings, startIndex: 1})
        }
      },
      err => console.error("Execute error", err)
    )
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
      <Button onClick={searchPlaylists} disabled={!isAuthenticated()}>Check YouTube for Playlist</Button>
      {isAuthenticated() ? null : <p>Please authenticate first</p>}
      <div style={{marginTop: '20px'}}>
        <TrackNameSettings startEndList={startEndList} value={trackNameSettings} setValue={setTrackNameSettings}/>
      </div>
    </HeadingLevel>
  )
}

export default YouTube

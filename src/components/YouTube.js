import {Heading, HeadingLevel} from "baseui/heading"
import React, {useEffect, useState} from "react"
import {Input} from "baseui/input"
import {copyData, usePersist} from "../hooks/usePersist"
import {Button} from "baseui/button"
import PlaylistSettings from "./PlaylistSettings"
import dayjs from "dayjs"

const gapi = window.gapi


const YouTube = ({startEndList, playlistSettings, setPlaylistSettings}) => {
  const [apiData, setApiData] = useState({apiKey: '', clientId: '', channelId: ''})
  const [googleAuth, setGoogleAuth] = useState()

  usePersist({
    key: 'apiData',
    onRestore: copyData,
    setState: setApiData,
    state: apiData,
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
  })

  function authenticate() {
    return gapi.auth2.getAuthInstance()
      .signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
      .then(
        () => console.log("Sign-in successful"),
        err => console.error("Error signing in", err)
      )
  }

  function loadClient() {
    gapi.client.setApiKey(apiData.apiKey)
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(
        () => console.log("GAPI client loaded for API"),
        err => console.error("Error loading GAPI client for API", err)
      )
  }

  // Make sure the client is loaded and sign-in is complete before calling this method.

  function findPlaylist() {
    return gapi.client.youtube.search.list({
      "part": [
        "snippet"
      ],
      "channelId": apiData.channelId,
      "maxResults": 25,
      "type": "playlist",
      "q": playlistSettings.playlistName
    }).then(
      response => console.log("Response", response),
      err => console.error("Execute error", err)
    )
  }

  function initThen(postAuth) {
    return gapi.load("client:auth2", () =>
      gapi.auth2.init({client_id: apiData.clientId}).then(auth => {
        console.log('in init -> then, auth = ', auth)
        postAuth(auth)
      })
    )
  }

  const searchForPlaylist = () => {
    if (googleAuth && googleAuth.isSignedIn) {
      findPlaylist()
    } else {
      initThen(async auth => {
        await authenticate()
        await loadClient()
        findPlaylist()
        setGoogleAuth(auth)
      })
    }
  }

  return (
    <HeadingLevel>
      <Heading styleLevel={6}>API Key</Heading>
      <Input
        value={apiData.apiKey}
        onChange={e => setApiData({...apiData, apiKey: e.target.value})}
      />
      <Heading styleLevel={6}>Client ID</Heading>
      <Input
        value={apiData.clientId}
        onChange={e => setApiData({...apiData, clientId: e.target.value})}
      />
      <Heading styleLevel={6}>Channel ID</Heading>
      <Input
        value={apiData.channelId}
        onChange={e => setApiData({...apiData, channelId: e.target.value})}
      />
      <div style={{marginTop: '20px'}}>
        <Heading styleLevel={6}>Playlist</Heading>
        <PlaylistSettings startEndList={startEndList} value={playlistSettings} setValue={setPlaylistSettings}/>
      </div>

      <Button onClick={searchForPlaylist}>Check YouTube for Playlist</Button>

      {/*
      <button onClick={initialize}>initialize</button>
      <button onClick={() => authenticate().then(loadClient)}>authorize and load</button>
      <button onClick={execute}>execute</button>
*/}
    </HeadingLevel>
  )
}

export default YouTube

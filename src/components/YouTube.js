import {Heading, HeadingLevel} from "baseui/heading"
import React, {useState} from "react"
import {Input} from "baseui/input"
import {copyData, usePersist} from "../hooks/usePersist"

const gapi = window.gapi


const YouTube = ({startEndList, playlistSettings}) => {
  const [apiData, setApiData] = useState({apiKey: '', clientId: '', channelId: ''})

  usePersist({
    key: 'apiData',
    onRestore: copyData,
    setState: setApiData,
    state: apiData,
  })


  const authenticate = () => gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
    .then(function () {
        console.log("Sign-in successful")
      },
      function (err) {
        console.error("Error signing in", err)
      })

  const loadClient = () => {
    gapi.client.setApiKey(apiData.apiKey)
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function () {
          console.log("GAPI client loaded for API")
        },
        function (err) {
          console.error("Error loading GAPI client for API", err)
        })
  }

  // Make sure the client is loaded and sign-in is complete before calling this method.
  const execute = () => gapi.client.youtube.playlists.list({
    "part": [
      "snippet,contentDetails"
    ],
    "channelId": apiData.channelId,
    "maxResults": 25,
  }).then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log("Response", response)
    },
    function (err) {
      console.error("Execute error", err)
    })

  const initialize = () => {
    gapi.load("client:auth2", function () {
      gapi.auth2.init({client_id: apiData.clientId})
    })
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
      <button onClick={initialize}>initialize</button>
      <button onClick={() => authenticate().then(loadClient)}>authorize and load</button>
      <button onClick={execute}>execute</button>
    </HeadingLevel>
  )
}

export default YouTube

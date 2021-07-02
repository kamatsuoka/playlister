import {Heading, HeadingLevel} from "baseui/heading"
import React, {useState} from "react"
import {Input} from "baseui/input"
import {copyData, usePersist} from "../hooks/usePersist"
import {Button} from "baseui/button"

const gapi = window.gapi

const GoogleAuth = ({googleAuth, setGoogleAuth}) => {
  const [apiData, setApiData] = useState({apiKey: '', clientId: ''})

  usePersist({
    key: 'apiData',
    onRestore: copyData,
    setState: setApiData,
    state: apiData,
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

  function initThen(postAuth) {
    return gapi.load("client:auth2", () =>
      gapi.auth2.init({client_id: apiData.clientId}).then(auth => {
        console.log('in init -> then, auth = ', auth)
        postAuth(auth)
      })
    )
  }

  const isAuthenticated = () => googleAuth && googleAuth.isSignedIn

  const showAuthStatus = () => {
    if (isAuthenticated()) {
      return <p>Authenticated</p>
    } else {
      return <p>Click below to authenticate</p>
    }
  }

  const initThenAuthenticate = () => {
    initThen(async auth => {
      await authenticate()
      await loadClient()
      setGoogleAuth(auth)
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
      {showAuthStatus()}
      <Button onClick={initThenAuthenticate}>
        {isAuthenticated() ? "Re-authenticate" : "Authenticate"}
      </Button>
    </HeadingLevel>
  )
}

export default GoogleAuth

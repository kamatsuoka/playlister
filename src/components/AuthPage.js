import {Heading, HeadingLevel} from "baseui/heading"
import React, {useState} from "react"
import {Input} from "baseui/input"
import {copyData, usePersist} from "../hooks/usePersist"
import {Button, KIND as BKind} from "baseui/button"
import {KIND, Notification} from "baseui/notification"
import {gapi, isAuthenticated} from "../util/auth"

const AuthPage = () => {
  const [apiData, setApiData] = useState({apiKey: '', clientId: ''})
  const [authMessage, setAuthMessage] = useState({})
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
        err => {
          const msg = "Error signing in"
          console.error(msg, err)
          setAuthMessage({error: msg})
        }
      )
  }

  function loadClient() {
    gapi.client.setApiKey(apiData.apiKey)
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(
        () => console.log("GAPI client loaded for API"),
        err => {
          const msg = "Error loading GAPI client for API"
          console.error(msg, err)
          setAuthMessage({error: msg})
        }
      )
  }

  function initThen(postAuth) {
    return gapi.load("client:auth2", () =>
      gapi.auth2.init({client_id: apiData.clientId}).then(auth => {
        postAuth(auth)
      })
    )
  }

  const showAuthStatus = () => {
    if (authMessage.message) {
      return <Notification kind={KIND.positive} closeable>{authMessage.message}</Notification>
    } else if (authMessage.error) {
      return <Notification kind={KIND.negative} closeable>{authMessage.error}</Notification>
    }
  }

  const initThenAuthenticate = () => {
    initThen(async () => {
      await authenticate()
      await loadClient()
      setAuthMessage({message: "✅ Authenticated"})
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
      <div style={{marginTop: '20px'}}>
        <Button onClick={initThenAuthenticate} kind={isAuthenticated() ? BKind.secondary : BKind.primary}>
          Authenticate
        </Button>
        {showAuthStatus()}
      </div>
    </HeadingLevel>
  )
}

export default AuthPage

import React, { useState } from 'react'
import { Input } from 'baseui/input'
import { copyData, usePersist } from '../hooks/usePersist'
import { Button, KIND as BKind } from 'baseui/button'
import { KIND, Notification } from 'baseui/notification'
import { gapi, isAuthenticated } from '../util/auth'
import { BaseCard } from './BaseCard'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'

const API_DATA_KEY = 'apiData'
const getPreferences = () => {
  const restoredJson = window.localStorage.getItem(API_DATA_KEY)
  if (restoredJson) {
    try {
      return JSON.parse(restoredJson)
    } catch {
      // no-op
    }
  }
  return {}
}

const AuthPage = () => {
  const [apiData, setApiData] = useState({ apiKey: '', clientId: '' })
  const [authMessage, setAuthMessage] = useState({})
  usePersist({
    key: API_DATA_KEY,
    onRestore: copyData,
    setState: setApiData,
    state: apiData
  })

  function authenticate () {
    // noinspection JSUnresolvedFunction
    return gapi.auth2.getAuthInstance()
      .signIn({ scope: 'https://www.googleapis.com/auth/youtube.force-ssl' })
      .then(
        () => console.log('Sign-in successful'),
        err => {
          const msg = 'Error signing in'
          console.error(msg, err)
          setAuthMessage({ error: msg })
        }
      )
  }

  function loadClient () {
    // noinspection JSUnresolvedFunction
    gapi.client.setApiKey(apiData.apiKey)
    return gapi.client.load('https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest')
      .then(
        () => console.log('GAPI client loaded for API'),
        err => {
          const msg = 'Error loading GAPI client for API'
          console.error(msg, err)
          setAuthMessage({ error: msg })
        }
      )
  }

  function initThen (postAuth) {
    // noinspection JSUnresolvedVariable
    return gapi.load('client:auth2', () =>
      gapi.auth2.init({ client_id: apiData.clientId }).then(auth => {
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
      setAuthMessage({ message: '✅ Authenticated' })
    })
  }

  const handleChange = (evt) => {
    const value = evt.target.value
    setApiData({
      ...apiData,
      [evt.target.name]: value
    })
  }

  return (
    <>
      <BaseCard title="Preferences">
        <FormControl label="youtube channel id">
          <Input
            name="channelId"
            value={apiData.channelId || ''}
            onChange={handleChange}
          />
        </FormControl>
      </BaseCard>
      <BaseCard title="Authorization">
        <FlexGrid
          flexGridColumnCount={2}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem>
            <FormControl label="API Key">
              <Input
                name="apiKey"
                value={apiData.apiKey}
                onChange={handleChange}
              />
            </FormControl>
          </FlexGridItem>
          <FlexGridItem>
            <FormControl label="Client ID">
              <Input
                name="clientId"
                value={apiData.clientId}
                onChange={handleChange}
              />
            </FormControl>
          </FlexGridItem>
          <FlexGridItem>
            <div style={{ marginTop: '20px' }}>
              <Button onClick={initThenAuthenticate} kind={isAuthenticated() ? BKind.secondary : BKind.primary}>
                Authenticate
              </Button>
              {showAuthStatus()}
            </div>
          </FlexGridItem>

        </FlexGrid>
      </BaseCard>
    </>
  )
}

export default AuthPage

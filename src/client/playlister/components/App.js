import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Tab, Tabs } from 'baseui/tabs-motion'

import FilePage from './FilePage'
import AuthPage from './AuthPage'
import VideoPage from './VideoPage'
import { StyledLink } from 'baseui/link'

const engine = new Styletron()

function App () {
  const [activeKey, setActiveKey] = useState(1)
  const [fileInfo, setFileInfo] = useState({})
  const [startEndList, setStartEndList] = useState([])
  const [eventData, setEventData] = useState({ eventType: 'rehearsal' })
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [playlistTitle, setPlaylistTitle] = useState({ titleChoice: 'suggested' })

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <Tabs
          activeKey={activeKey}
          onChange={({ activeKey }) => setActiveKey(activeKey)}
        >
          <Tab title="Auth">
            <AuthPage/>
          </Tab>
          <Tab title="Files">
            <FilePage
              fileInfo={fileInfo} setFileInfo={setFileInfo}
              startEndList={startEndList} setStartEndList={setStartEndList}
              eventData={eventData} setEventData={setEventData}
              playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
              playlistSettings={playlistSettings} setPlaylistSettings={setPlaylistSettings}
              setActiveKey={setActiveKey}
            />
          </Tab>
          <Tab title="Videos">
            <VideoPage
              eventData={eventData} startEndList={startEndList}
              playlistSettings={playlistSettings} setActiveKey={setActiveKey}
            />
          </Tab>
        </Tabs>
        <footer>
          <StyledLink
            href="https://github.com/kamatsuoka/playlister"
            style={{ textDecoration: 'none', paddingLeft: '16px' }}
          >
            <FontAwesomeIcon className="fa-padded" icon={faGithub} size="sm" style={{ paddingRight: '5px' }}/>
            GitHub
          </StyledLink>
        </footer>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App

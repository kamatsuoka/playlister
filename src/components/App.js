import React, {useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {BaseProvider, LightTheme} from 'baseui'
import {Provider as StyletronProvider} from "styletron-react"
import {Client as Styletron} from "styletron-engine-atomic"
import {Tab, Tabs} from 'baseui/tabs-motion';

import FilesPage from './FilesPage'
import AuthPage from "./AuthPage"
import PlaylistPage from "./PlaylistPage"

const engine = new Styletron()

function App() {

  const [activeKey, setActiveKey] = useState(0);
  const [startEndList, setStartEndList] = useState([])
  const [googleAuth, setGoogleAuth] = useState()
  const [rehearsalData, setRehearsalData] = useState({eventType: "rehearsal"})
  const [playlistSettings, setPlaylistSettings] = useState({})

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <Tabs
          activeKey={activeKey}
          onChange={({activeKey}) => setActiveKey(activeKey)}
        >
          <Tab title="Files">
            <FilesPage startEndList={startEndList} setStartEndList={setStartEndList}
                       rehearsalData={rehearsalData} setRehearsalData={setRehearsalData}/>
          </Tab>
          <Tab title="Auth">
            <AuthPage googleAuth={googleAuth} setGoogleAuth={setGoogleAuth}/>
          </Tab>
          <Tab title="Playlist">
            <PlaylistPage googleAuth={googleAuth} startEndList={startEndList} rehearsalData={rehearsalData}
                          value={playlistSettings} setValue={setPlaylistSettings}/>
          </Tab>
        </Tabs>
        <footer>
          <p>
            <a href="https://github.com/kamatsuoka/playlister">
              <FontAwesomeIcon className="fa-padded" icon={faGithub} size="lg"/>
              GitHub
            </a>
          </p>
        </footer>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App

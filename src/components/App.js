import React, {useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {BaseProvider, createTheme, LightTheme, lightThemePrimitives, ThemeProvider} from 'baseui'
import {Provider as StyletronProvider} from "styletron-react"
import {Client as Styletron} from "styletron-engine-atomic"
import {Tab, Tabs} from 'baseui/tabs-motion';

import FilePage from './FilePage'
import AuthPage from "./AuthPage"
import PlaylistPage from "./PlaylistPage"
import VideoPage from "./VideoPage"
import {HeadingLevel} from "baseui/heading"

const engine = new Styletron()

function App() {

  const [activeKey, setActiveKey] = useState(0);
  const [startEndList, setStartEndList] = useState([])
  const [googleAuth, setGoogleAuth] = useState()
  const [rehearsalData, setRehearsalData] = useState({eventType: "rehearsal"})
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [inferredDate, setInferredDate] = useState({})

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <ThemeProvider
          theme={createTheme(lightThemePrimitives, {
            colors: {inputTextDisabled: 'black'}
          })}
        >
          <HeadingLevel>
            <Tabs
              activeKey={activeKey}
              onChange={({activeKey}) => setActiveKey(activeKey)}
            >
              <Tab title="Files">
                <FilePage startEndList={startEndList} setStartEndList={setStartEndList}
                          rehearsalData={rehearsalData} setRehearsalData={setRehearsalData}
                          inferredDate={inferredDate} setInferredDate={setInferredDate}/>
              </Tab>
              <Tab title="Auth">
                <AuthPage googleAuth={googleAuth} setGoogleAuth={setGoogleAuth}/>
              </Tab>
              <Tab title="Playlist">
                <PlaylistPage googleAuth={googleAuth} startEndList={startEndList}
                              rehearsalData={rehearsalData} setRehearsalData={setRehearsalData}
                              inferredDate={inferredDate} setActiveKey={setActiveKey}
                              value={playlistSettings} setValue={setPlaylistSettings}/>
              </Tab>
              <Tab title="Videos">
                <VideoPage googleAuth={googleAuth} inferredDate={inferredDate} startEndList={startEndList}
                           playlistSettings={playlistSettings} setActiveKey={setActiveKey}/>
              </Tab>
            </Tabs>
          </HeadingLevel>
          <footer>
            <p>
              <a href="https://github.com/kamatsuoka/playlister">
                <FontAwesomeIcon className="fa-padded" icon={faGithub} size="lg"/>
                GitHub
              </a>
            </p>
          </footer>
        </ThemeProvider>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App

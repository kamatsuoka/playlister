import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BaseProvider, createTheme, LightTheme, lightThemePrimitives, ThemeProvider } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Tab, Tabs } from 'baseui/tabs-motion'

import FilePage from './FilePage'
import AuthPage from './AuthPage'
import PlaylistPage from './PlaylistPage'
import VideoPage from './VideoPage'
import { HeadingLevel } from 'baseui/heading'
import { StyledLink } from 'baseui/link'

const engine = new Styletron()

function App() {

  const [activeKey, setActiveKey] = useState(0)
  const [startEndList, setStartEndList] = useState([])
  const [rehearsalData, setRehearsalData] = useState({ eventType: 'rehearsal' })
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [playlistTitle, setPlaylistTitle] = useState({ titleChoice: 'suggested' })
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
                <AuthPage/>
              </Tab>
              <Tab title="Playlist">
                <PlaylistPage startEndList={startEndList}
                              rehearsalData={rehearsalData} setRehearsalData={setRehearsalData}
                              inferredDate={inferredDate} setActiveKey={setActiveKey}
                              playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
                              value={playlistSettings} setValue={setPlaylistSettings}/>
              </Tab>
              <Tab title="Videos">
                <VideoPage inferredDate={inferredDate} startEndList={startEndList}
                           playlistSettings={playlistSettings} setActiveKey={setActiveKey}/>
              </Tab>
            </Tabs>
          </HeadingLevel>
          <footer>
            <StyledLink href='https://github.com/kamatsuoka/playlister'>
              <FontAwesomeIcon className='fa-padded' icon={faGithub} size='lg' />
              GitHub
            </StyledLink>
          </footer>
        </ThemeProvider>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App
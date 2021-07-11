import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'

import FilePage from './FilePage'
import AuthPage from './AuthPage'
import VideoPage from './VideoPage'
import { StyledLink } from 'baseui/link'
import { ProgressSteps, Step } from 'baseui/progress-steps'
import { Button } from 'baseui/button'
import PlaylistPage from './PlaylistPage'

const engine = new Styletron()

function App () {
  const [activeKey, setActiveKey] = useState(1)
  const [fileInfo, setFileInfo] = useState({})
  const [startEndList, setStartEndList] = useState([])
  const [eventData, setEventData] = useState({ eventType: 'rehearsal' })
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [playlistTitle, setPlaylistTitle] = useState({ titleChoice: 'suggested' })

  const prevButton = current =>
    current > 0 ? <Button size='compact' onClick={() => setActiveKey(current - 1)}>Prev</Button> : null

  const nextButton = (current, last) =>
    last ? null : <Button size='compact' onClick={() => setActiveKey(current + 1)}>Next</Button>

  const prevNextButtons = (current, last = false) =>
    (
      <div align='right'>
        {prevButton(current)}
        &nbsp;
        {nextButton(current, last)}
      </div>
    )

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <ProgressSteps current={activeKey}>
          <Step title='Auth'>
            <AuthPage />
            {prevNextButtons(0)}
          </Step>
          <Step title='Files'>
            <FilePage
              fileInfo={fileInfo} setFileInfo={setFileInfo}
              startEndList={startEndList} setStartEndList={setStartEndList}
              setActiveKey={setActiveKey}
            />
            {prevNextButtons(1)}
          </Step>
          <Step title='Playlist'>
            <PlaylistPage
              startEndList={startEndList}
              eventData={eventData} setEventData={setEventData}
              playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
              value={playlistSettings} setValue={setPlaylistSettings}
              setActiveKey={setActiveKey}
            />
            {prevNextButtons(2)}
          </Step>
          <Step title='Videos'>
            <VideoPage
              eventData={eventData} startEndList={startEndList}
              playlistSettings={playlistSettings} setActiveKey={setActiveKey}
            />
            {prevNextButtons(3, true)}
          </Step>
        </ProgressSteps>
        <footer>
          <StyledLink
            href='https://github.com/kamatsuoka/playlister'
            style={{ textDecoration: 'none', paddingLeft: '16px' }}
          >
            <FontAwesomeIcon className='fa-padded' icon={faGithub} size='sm' style={{ paddingRight: '5px' }} />
            GitHub
          </StyledLink>
        </footer>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App

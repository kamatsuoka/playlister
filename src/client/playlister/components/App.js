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
  const [current, setCurrent] = useState(1)
  const [fileInfo, setFileInfo] = useState({})
  const [uploadStatus, setUploadStatus] = useState({})
  const [startEndList, setStartEndList] = useState([])
  const [eventData, setEventData] = useState({ eventType: 'rehearsal' })
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [playlistTitle, setPlaylistTitle] = useState({ titleChoice: 'suggested' })

  const prevButton = (current, disabled = false) => {
    if (current > 0) {
      return (
        <Button
          size='compact' disabled={disabled}
          onClick={() => setCurrent(current - 1)}
        >Prev
        </Button>
      )
    } else { return null }
  }

  const nextButton = (current, last, disabled = false) => {
    if (last) {
      return null
    } else {
      return (
        <Button
          size='compact' disabled={disabled}
          onClick={() => setCurrent(current + 1)}
        >Next
        </Button>
      )
    }
  }

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
        <ProgressSteps current={current}>
          <Step title='Auth'>
            <AuthPage />
            {prevNextButtons(0)}
          </Step>
          <Step title='Files'>
            <FilePage
              fileInfo={fileInfo} setFileInfo={setFileInfo}
              uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
              startEndList={startEndList} setStartEndList={setStartEndList}
              current={1} nextButton={nextButton} prevButton={prevButton}
            />
          </Step>
          <Step title='Playlist'>
            <PlaylistPage
              startEndList={startEndList}
              eventData={eventData} setEventData={setEventData}
              playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
              value={playlistSettings} setValue={setPlaylistSettings}
              setActiveKey={setCurrent}
            />
            {prevNextButtons(2)}
          </Step>
          <Step title='Videos'>
            <VideoPage
              eventData={eventData} startEndList={startEndList}
              playlistSettings={playlistSettings} setActiveKey={setCurrent}
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

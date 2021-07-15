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
import AdjustTimePage from './AdjustTimePage'

const engine = new Styletron()

function App () {
  const [current, setCurrent] = useState(1)
  const [metadataList, setMetadataList] = useState([])
  const [uploadStatus, setUploadStatus] = useState([])
  const [startEndList, setStartEndList] = useState([])
  const [eventData, setEventData] = useState({ eventType: 'rehearsal' })
  const [playlistSettings, setPlaylistSettings] = useState({})
  const [timeAdjust, setTimeAdjust] = useState({
    year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0
  })
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
        <ProgressSteps
          current={current}
           overrides={{
             Content: {
               style: () => ({
                 // avoids jumping widths on desktop ... not sure about mobile
                 minWidth: '600px'
               })
             }
           }}
        >
          <Step title='Auth'>
            <AuthPage />
            {prevNextButtons(0)}
          </Step>
          <Step title='Files'>
            <FilePage
              metadataList={metadataList} setMetadataList={setMetadataList}
              uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
              current={1} nextButton={nextButton} prevButton={prevButton}
            />
          </Step>
          <Step title='Time'>
            <AdjustTimePage
              metadataList={metadataList}
              startEndList={startEndList} setStartEndList={setStartEndList}
              timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
              current={2} nextButton={nextButton} prevButton={prevButton}
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
            {prevNextButtons(3)}
          </Step>
          <Step title='Videos'>
            <VideoPage
              eventData={eventData} startEndList={startEndList}
              playlistSettings={playlistSettings} setActiveKey={setCurrent}
            />
            {prevNextButtons(4, true)}
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

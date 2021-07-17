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
import { Button, KIND } from 'baseui/button'
import PlaylistPage from './PlaylistPage'
import AdjustTimePage from './AdjustTimePage'

const engine = new Styletron()

function App () {
  // index of currently selected step
  const [current, setCurrent] = useState(1)
  // file metadata as detected by mediainfo.js
  const [metadataList, setMetadataList] = useState([])
  // status of files uploaded to youtube
  const [uploadStatus, setUploadStatus] = useState([])
  const [startEndList, setStartEndList] = useState([])
  // attributes of event where the videos were recorded
  const [eventData, setEventData] = useState({ eventType: 'rehearsal' })
  // playlist title settings for finding / creating a playlist
  const [playlistTitle, setPlaylistTitle] = useState({ titleChoice: 'suggested', customTitle: '' })
  // metadata about found / created playlist
  const [playlistData, setPlaylistData] = useState({})
  // adjustments to video start/end time, in case camera doesn't record time zone etc.
  const [timeAdjust, setTimeAdjust] = useState({
    year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0
  })

  const prevButton = ({ current, disabled = false }) => {
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

  const nextButton = ({ current, last = false, disabled = false, kind = KIND.primary }) => {
    if (last) {
      return null
    } else {
      return (
        <Button
          size='compact' disabled={disabled} kind={kind}
          onClick={() => setCurrent(current + 1)}
        >Next
        </Button>
      )
    }
  }

  const prevNextButtons = ({ current, last = false }) =>
    (
      <div align='right'>
        {prevButton({ current })}
        &nbsp;
        {nextButton({ current, last })}
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
                // avoid jumping widths on desktop ... not sure about mobile
                minWidth: '720px'
              })
            },
            Description: {
              style: () => ({
                marginBottom: 0 // compactify a little
              })
            }
          }}
        >
          <Step title='Auth'>
            <AuthPage />
            {prevNextButtons({ current: 0 })}
          </Step>
          <Step title='File Metadata'>
            <AdjustTimePage
              metadataList={metadataList} setMetadataList={setMetadataList}
              startEndList={startEndList} setStartEndList={setStartEndList}
              timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
            />
            {prevNextButtons({ current: 1 })}
          </Step>
          <Step title='Uploads'>
            <FilePage
              metadataList={metadataList} setMetadataList={setMetadataList}
              uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
              current={2} prevButton={prevButton} nextButton={nextButton}
            />
          </Step>
          <Step title='Playlist'>
            <PlaylistPage
              startEndList={startEndList}
              eventData={eventData} setEventData={setEventData}
              playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
              playlistData={playlistData} setPlaylistData={setPlaylistData}
            />
            {prevNextButtons({ current: 3 })}
          </Step>
          <Step title='Videos'>
            <VideoPage
              eventData={eventData} startEndList={startEndList}
              playlistData={playlistData} setActiveKey={setCurrent}
            />
            {prevNextButtons({ current: 4, last: true })}
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

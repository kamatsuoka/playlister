import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'

import UploadPage from './UploadPage'
import VideoPage from './VideoPage'
import { StyledLink } from 'baseui/link'
import { ProgressSteps, Step } from 'baseui/progress-steps'
import PlaylistPage from './PlaylistPage'
import FilePage from './FilePage'
import { SnackbarProvider } from 'baseui/snackbar'
import { DEFAULT_DATE } from './EventDate'
import PreferencePage from './PreferencePage'
import AddToPlaylistPage from './AddToPlaylistPage'
import prevNextButtons from './PrevNextButtons'

const engine = new Styletron()

function App () {
  // index of currently selected step
  const [current, setCurrent] = useState(1)
  // info about the organization
  const [orgInfo, setOrgInfo] = useState({ orgName: 'fcs' })
  // info about the camera
  const [cameraInfo, setCameraInfo] = useState({ cameraNumber: 1, cameraName: '' })
  // media info as detected by mediainfo.js
  const [mediaList, setMediaList] = useState([])
  // list of videos uploaded to youtube
  const [uploadList, setUploadList] = useState([])
  const [fileList, setFileList] = useState([])
  // attributes of event where the videos were recorded
  const [eventData, setEventData] = useState({
    defaultDate: '',
    customDate: '',
    eventType: 'rehearsal',
    dateChoice: DEFAULT_DATE
  })
  // playlist title settings for finding / creating a playlist
  const [playlistTitle, setPlaylistTitle] = useState({
    tabIndex: 0,
    titleChoice: 'suggested',
    customTitle: ''
  })
  // list of (hopefully) recent playlists
  const [playlists, setPlaylists] = useState([])
  /**
   * selectedPlaylist is an array of 0 - 1 elements b/c of
   * Select api -- https://baseweb.design/components/select/#select-basic-usage
   */
  const [selectedPlaylist, setSelectedPlaylist] = useState([])
  // metadata about found / created playlist
  const [playlistData, setPlaylistData] = useState({})
  // adjustments to video start/end time, in case camera doesn't record time zone etc.
  const [timeAdjust, setTimeAdjust] = useState({
    year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0
  })
  // map of video id to new title
  const [newTitles, setNewTitles] = useState({})
  // map of video id to playlist
  const [videoPlaylist, setVideoPlaylist] = useState({})

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <SnackbarProvider>
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
            <Step title='Basics'>
              <PreferencePage
                current={0} setCurrent={setCurrent}
                orgInfo={orgInfo} setOrgInfo={setOrgInfo}
                eventData={eventData} setEventData={setEventData}
                cameraInfo={cameraInfo} setCameraInfo={setCameraInfo}
              />
              {prevNextButtons({ current: 0, setCurrent })}
            </Step>
            <Step title='Files'>
              <FilePage
                current={1} setCurrent={setCurrent}
                mediaList={mediaList} setMediaList={setMediaList}
                fileList={fileList} setFileList={setFileList}
                timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
                eventData={eventData} setEventData={setEventData}
              />
            </Step>
            <Step title='Uploads'>
              <UploadPage
                current={2} setCurrent={setCurrent}
                fileList={fileList} uploadList={uploadList} setUploadList={setUploadList}
              />
            </Step>
            <Step title='Choose Playlist'>
              <PlaylistPage
                current={3} setCurrent={setCurrent}
                orgInfo={orgInfo} cameraInfo={cameraInfo}
                uploadList={uploadList} eventData={eventData}
                playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
                playlists={playlists} setPlaylists={setPlaylists}
                selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
                playlistData={playlistData} setPlaylistData={setPlaylistData}
              />
            </Step>
            <Step title='Add to Playlist'>
              <AddToPlaylistPage
                current={4} setCurrent={setCurrent}
                uploadList={uploadList} playlistData={playlistData}
                videoPlaylist={videoPlaylist} setVideoPlaylist={setVideoPlaylist}
              />
            </Step>
            <Step title='Rename'>
              <VideoPage
                current={5} setCurrent={setCurrent}
                uploadList={uploadList} setUploadList={setUploadList}
                playlistData={playlistData} setActiveKey={setCurrent}
                newTitles={newTitles} setNewTitles={setNewTitles}
              />
            </Step>
          </ProgressSteps>
        </SnackbarProvider>
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

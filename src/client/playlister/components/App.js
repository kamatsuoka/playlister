import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'

import UploadPage from './UploadPage'
import VideoPage from './VideoPage'
import { StyledLink } from 'baseui/link'
import PlaylistPage from './PlaylistPage'
import FilePage from './FilePage'
import { SnackbarProvider } from 'baseui/snackbar'
import { DEFAULT_DATE } from './EventDate'
import PreferencePage from './PreferencePage'
import prevNextButtons from './PrevNextButtons'
import { Tab, Tabs } from 'baseui/tabs-motion'

const engine = new Styletron()

function App () {
  // index of currently selected step
  const [activeKey, setActiveKey] = useState(1)
  // info about the organization
  const [orgInfo, setOrgInfo] = useState({ orgName: 'fcs' })
  // info about the camera
  const [cameraInfo, setCameraInfo] = useState({ cameraNumber: 1, cameraName: '' })
  // media info as detected by mediainfo.js
  const [mediaList, setMediaList] = useState([])
  // videos uploaded to youtube, keyed by file id
  const [uploads, setUploads] = useState({})
  // list of local files with video start/end times, sorted by start time
  const [files, setFiles] = useState([])
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
   * Playlist created by clicking Create
   */
  const [createdPlaylist, setCreatedPlaylist] = useState({})
  /**
   * selectedPlaylist is an array of 0 - 1 elements b/c of
   * baseui select api -- https://baseweb.design/components/select/#select-basic-usage
   */
  const [selectedPlaylist, setSelectedPlaylist] = useState([])
  // found / created playlist
  const [playlist, setPlaylist] = useState({})
  // adjustments to video start/end time, in case camera doesn't record time zone etc.
  const [timeAdjust, setTimeAdjust] = useState({
    year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0
  })
  // map of video id to new title
  const [newTitles, setNewTitles] = useState({})
  // items in current playlist - map of videoId to { playlistId, position, etc. }
  const [playlistItems, setPlaylistItems] = useState({})

  const tabOverrides = {
    TabPanel: {
      style: ({
        width: 'fit-content',
        minWidth: '720px'
      })
    }
  }
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <SnackbarProvider>
          <Tabs activeKey={activeKey} disabled>
            <Tab overrides={tabOverrides} title='Basics'>
              <PreferencePage
                current={0} setCurrent={setActiveKey}
                orgInfo={orgInfo} setOrgInfo={setOrgInfo}
                eventData={eventData} setEventData={setEventData}
                cameraInfo={cameraInfo} setCameraInfo={setCameraInfo}
              />
              {prevNextButtons({ current: 0, setCurrent: setActiveKey })}
            </Tab>
            <Tab overrides={tabOverrides} title='Files'>
              <FilePage
                current={1} setCurrent={setActiveKey}
                mediaList={mediaList} setMediaList={setMediaList}
                files={files} setFiles={setFiles}
                timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
                eventData={eventData} setEventData={setEventData}
              />
            </Tab>
            <Tab overrides={tabOverrides} title='Uploads'>
              <UploadPage
                current={2} setCurrent={setActiveKey}
                files={files} uploads={uploads} setUploads={setUploads}
              />
            </Tab>
            <Tab overrides={tabOverrides} title='Playlist'>
              <PlaylistPage
                current={3} setCurrent={setActiveKey}
                orgInfo={orgInfo} cameraInfo={cameraInfo}
                files={files} uploads={uploads} eventData={eventData}
                playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
                playlists={playlists} setPlaylists={setPlaylists}
                selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
                createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
                playlist={playlist} setPlaylist={setPlaylist}
                playlistItems={playlistItems} setPlaylistItems={setPlaylistItems}
              />
            </Tab>
            <Tab overrides={tabOverrides} title='Rename'>
              <VideoPage
                current={5} setCurrent={setActiveKey} files={files}
                uploads={uploads} setUploads={setUploads}
                playlist={playlist} setActiveKey={setActiveKey}
                newTitles={newTitles} setNewTitles={setNewTitles}
              />
            </Tab>
          </Tabs>
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

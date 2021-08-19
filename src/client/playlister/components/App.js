import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'
import { StyledLink } from 'baseui/link'
import FilePage from './FilePage'
import { SnackbarProvider } from 'baseui/snackbar'
import EventInfoPage from './EventInfoPage'
import PrevNextButtons from './PrevNextButtons'
import { Tab, Tabs } from 'baseui/tabs-motion'
import { DEFAULT_DATE, getChosenDate } from '../models/dates'
import { getVideoNumber } from '../models/renaming'
import { HeadingLevel } from 'baseui/heading'
import { DEBUG_METADATA, DEBUG_PLAYLISTS, DebugContext } from '../context/DebugContext'
import LoginPage from './LoginPage'
import SheetConfigPage from './SheetConfigPage'
import { NumberedStep, ProgressSteps } from 'baseui/progress-steps'
import Tooltip from './Tooltip'
import UploadVideosStep from './UploadVideosStep'
import ChoosePlaylistStep from './ChoosePlaylistStep'
import AddVideosStep from './AddVideosStep'
import RenameStep from './RenameStep'
import AddMetadataStep from './AddMetadataStep'
import { UploadPrevNext, uploadTooltip } from './UploadPage'

const engine = new Styletron()

function App () {
  // tail of google sheet
  const [tail, setTail] = useState([])
  // index of currently selected step
  const [current, setCurrent] = useState(0)
  // info about the organization
  const [orgInfo, setOrgInfo] = useState({ orgName: '' })
  // info about the camera
  const [cameraInfo, setCameraInfo] = useState({
    cameraNumber: 1, cameraName: '', defaultCameraView: 'director'
  })
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
  // did we successfully get the tail of the spreadsheet?
  const [tailed, setTailed] = useState(false)
  // step in upload page
  const [uploadStep, setUploadStep] = useState(0)
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
  // map of video id to selected camera view
  const [cameraViews, setCameraViews] = useState({})
  // map of video id to updated title after renaming
  const [renamedTitles, setRenamedTitles] = useState({})
  // items in current playlist - map of videoId to { playlistId, position, etc. }
  const [playlistItems, setPlaylistItems] = useState({})

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 && files.every(file => uploadedFileIds.has(file.fileId))

  const playlistVideoIds = new Set(Object.keys(playlistItems))

  const allAdded = Object.keys(playlist).length > 0 && allUploaded && files.every(file =>
    uploads[file.fileId] && playlistVideoIds.has(uploads[file.fileId].videoId)
  )
  // sheet urls have the form https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=...
  const [spreadsheetInfo, setSpreadsheetInfo] = useState({ spreadsheetId: '', sheetName: '' })
  // video metadata to append to google sheet
  const [videoMetadata, setVideoMetadata] = useState([])
  // rows appended to google sheet
  const [addedRows, setAddedRows] = useState([])

  /**
   * Gets the new title for a video.
   *
   * @param videoId video id
   * @param index index (position) in playlist
   */
  const getNewTitle = (videoId, index) => {
    const cameraView = cameraViews[videoId] || cameraInfo.defaultCameraView
    return `${orgInfo.orgName} ${getChosenDate(eventData)} ` +
      `${getVideoNumber(cameraInfo, index)} ${cameraView}`
  }

  /**
   * Have all videos in playlist been renamed?
   */
  const allRenamed = allAdded && Object.values(playlistItems).every(({ videoId, position, title }) => {
    const intendedTitle = getNewTitle(videoId, position)
    return title === intendedTitle || renamedTitles[videoId] === intendedTitle
  })

  const tabOverrides = {
    TabPanel: {
      style: ({
        width: 'fit-content',
        minWidth: '720px'
      })
    }
  }

  const [debugProps] = useState([DEBUG_METADATA])

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <SnackbarProvider>
          <DebugContext.Provider value={debugProps}>
            <HeadingLevel>
              <Tabs activeKey={current} disabled>
                <Tab overrides={tabOverrides} title='Login'>
                  <LoginPage
                    current={0} setCurrent={setCurrent}
                  />
                </Tab>
                <Tab overrides={tabOverrides} title='Sheet Config'>
                  <SheetConfigPage
                    current={1} setCurrent={setCurrent}
                    spreadsheetInfo={spreadsheetInfo} setSpreadsheetInfo={setSpreadsheetInfo}
                    tail={tail} setTail={setTail} tailed={tailed} setTailed={setTailed}
                  />
                </Tab>
                <Tab overrides={tabOverrides} title='Event Info'>
                  <EventInfoPage
                    current={2} setCurrent={setCurrent}
                    orgInfo={orgInfo} setOrgInfo={setOrgInfo}
                    eventData={eventData} setEventData={setEventData}
                    cameraInfo={cameraInfo} setCameraInfo={setCameraInfo}
                  />
                </Tab>
                <Tab overrides={tabOverrides} title='Timestamps'>
                  <FilePage
                    current={3} setCurrent={setCurrent}
                    mediaList={mediaList} setMediaList={setMediaList}
                    files={files} setFiles={setFiles}
                    timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
                    eventData={eventData} setEventData={setEventData}
                  />
                </Tab>
                <Tab overrides={tabOverrides} title='Upload'>
                  <ProgressSteps
                    current={uploadStep}
                    overrides={{
                      Content: {
                        style: ({ $theme }) => ({
                          minWidth: `calc(3 * ${$theme.sizing.scale4800})`
                        })
                      }
                    }}
                  >
                    <NumberedStep title={<Tooltip tooltip={uploadTooltip}>Upload Videos</Tooltip>}>
                      <UploadVideosStep
                        files={files} uploads={uploads} setUploads={setUploads} allUploaded={allUploaded}
                      />
                      <UploadPrevNext
                        uploadStep={uploadStep} setUploadStep={setUploadStep}
                        nextProps={{ grayed: !(allUploaded || debugProps.includes(DEBUG_PLAYLISTS)) }}
                      />
                    </NumberedStep>
                    <NumberedStep title='Choose Playlist'>
                      <ChoosePlaylistStep
                        setPlaylist={setPlaylist} playlists={playlists} setPlaylists={setPlaylists}
                        setPlaylistItems={setPlaylistItems} uploadedFileIds={uploadedFileIds}
                        createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
                        selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
                        playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
                        eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
                      />
                      <UploadPrevNext
                        uploadStep={uploadStep} setUploadStep={setUploadStep}
                        nextProps={{ grayed: !(playlist.playlistId && playlistItems) }}
                      />
                    </NumberedStep>
                    <NumberedStep title='Add to Playlist'>
                      <AddVideosStep
                        files={files} uploads={uploads} playlist={playlist}
                        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems} allAdded={allAdded}
                      />
                      <UploadPrevNext
                        uploadStep={uploadStep} setUploadStep={setUploadStep}
                        nextProps={{ grayed: !(allAdded || debugProps.includes(DEBUG_PLAYLISTS)) }}
                      />
                    </NumberedStep>
                    <NumberedStep title='Rename Videos'>
                      <RenameStep
                        cameraViews={cameraViews} setCameraViews={setCameraViews} allRenamed={allRenamed}
                        renamedTitles={renamedTitles} setRenamedTitles={setRenamedTitles} getNewTitle={getNewTitle}
                        playlist={playlist} playlistItems={playlistItems} cameraInfo={cameraInfo}
                      />
                      <UploadPrevNext uploadStep={uploadStep} setUploadStep={setUploadStep} />
                    </NumberedStep>
                    <NumberedStep title='Add to Sheet'>
                      <AddMetadataStep
                        cameraInfo={cameraInfo} cameraViews={cameraViews} eventData={eventData}
                        playlist={playlist} spreadsheetInfo={spreadsheetInfo}
                        videoMetadata={videoMetadata} setVideoMetadata={setVideoMetadata}
                        addedRows={addedRows} setAddedRows={setAddedRows}
                      />
                      <UploadPrevNext uploadStep={uploadStep} setUploadStep={setUploadStep} last />
                    </NumberedStep>
                  </ProgressSteps>
                  <PrevNextButtons current={4} last setCurrent={setCurrent} nextProps={{ grayed: !allRenamed }} />
                </Tab>
              </Tabs>
            </HeadingLevel>
          </DebugContext.Provider>
        </SnackbarProvider>
        <footer>
          <StyledLink
            href='https://github.com/kamatsuoka/playlister'
            style={{ textDecoration: 'none', paddingLeft: '16px' }}
          >
            <FontAwesomeIcon className='fa-padded' icon={faGithub} size='sm' style={{ paddingRight: '5px' }} />
            playlister
          </StyledLink>
        </footer>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App

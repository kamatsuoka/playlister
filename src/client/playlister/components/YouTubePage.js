import React, { useContext } from 'react'
import PrevNextButtons from './PrevNextButtons'
import AddItemsStep from './AddItemsStep'
import UploadStep from './UploadStep'
import ChoosePlaylistStep from './ChoosePlaylistStep'
import RenameStep from './RenameStep'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { DEBUG_PLAYLISTS, DebugContext } from '../context/DebugContext'
import { NumberedStep, ProgressSteps } from 'baseui/progress-steps'
import { createTheme, lightThemePrimitives, ThemeProvider, useStyletron } from 'baseui'
import { StyledLink } from 'baseui/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import Tooltip from './Tooltip'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'

export const YouTubePage = ({
  current, setCurrent, files, uploads, setUploads, orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle, playlists, setPlaylists, selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist, playlist, setPlaylist, playlistItems, setPlaylistItems,
  renamedTitles, setRenamedTitles, cameraViews, setCameraViews,
  allUploaded, uploadedFileIds, allAdded, allRenamed, getNewTitle, youTubeStep, setYouTubeStep
}) => {
  /**
   * uploads items, keyed by file id:
   * - videoId
   * - title
   * - publishedAt
   * - fileId
   * - filename
   * - startTime
   * - endTime
   */
  const [css, theme] = useStyletron()
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const debugProps = useContext(DebugContext)

  const uploadTooltip = (
    <>
      You can upload your videos here or on {' '}
      <ThemeProvider
        theme={createTheme(lightThemePrimitives, {
          colors: {
            linkText: '#ffffff',
            linkVisited: '#ffffff',
            linkHover: '#aaaaaa'
          }
        })}
      >
        <StyledLink href='https://www.youtube.com/upload' target='_blank' rel='noopener noreferrer'>
          YouTube
        </StyledLink>
      </ThemeProvider>
      <br />
      If you upload them on YouTube, click sync &nbsp;
      <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} size='sm' />
      &nbsp; to locate them
    </>
  )

  const YouTubePrevNext = ({ prevProps, nextProps, ...otherProps }) => (
    <div className={css({ marginTop: theme.sizing.scale600 })}>
      <PrevNextButtons
        current={youTubeStep} setCurrent={setYouTubeStep} align='left'
        prevProps={{ icon: faArrowUp, ...prevProps }} nextProps={{ icon: faArrowDown, ...nextProps }}
        textual {...otherProps}
      />
    </div>
  )

  return (
    <>
      <ProgressSteps current={youTubeStep}>
        <NumberedStep title={<Tooltip tooltip={uploadTooltip}>Upload Videos</Tooltip>}>
          <UploadStep
            files={files} uploads={uploads} setUploads={setUploads} allUploaded={allUploaded}
            enqueue={enqueue} showError={showError}
          />
          <YouTubePrevNext
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
            enqueue={enqueue} showError={showError}
          />
          <YouTubePrevNext
            nextProps={{ grayed: !(playlist.playlistId && playlistItems) }}
          />
        </NumberedStep>
        <NumberedStep title='Add Videos to Playlist'>
          <AddItemsStep
            files={files} uploads={uploads} playlist={playlist}
            playlistItems={playlistItems} setPlaylistItems={setPlaylistItems} allAdded={allAdded}
            enqueue={enqueue} showError={showError}
          />
          <YouTubePrevNext
            nextProps={{ grayed: !(allAdded || debugProps.includes(DEBUG_PLAYLISTS)) }}
          />
        </NumberedStep>
        <NumberedStep title='Rename Videos'>
          <RenameStep
            cameraViews={cameraViews} setCameraViews={setCameraViews} allRenamed={allRenamed}
            renamedTitles={renamedTitles} setRenamedTitles={setRenamedTitles} getNewTitle={getNewTitle}
            playlistItems={playlistItems} cameraInfo={cameraInfo}
            enqueue={enqueue} showError={showError}
          />
          <YouTubePrevNext last />
        </NumberedStep>
      </ProgressSteps>
      <PrevNextButtons current={current} setCurrent={setCurrent} nextProps={{ grayed: !allRenamed }} />
    </>
  )
}

export default YouTubePage

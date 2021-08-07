import React, { useContext } from 'react'
import PrevNextButtons from './PrevNextButtons'
import PlaylistItems from './PlaylistItems'
import UploadStep from './UploadStep'
import PlaylistStep from './PlaylistStep'
import RenameStep from './RenameStep'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { DEBUG_PLAYLISTS, DebugContext } from './DebugContext'

export const YouTubePage = ({
  current, setCurrent, files, uploads, setUploads, orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle, playlists, setPlaylists, selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist, playlist, setPlaylist, playlistItems, setPlaylistItems,
  renamedTitles, setRenamedTitles, cameraViews, setCameraViews, defaultCameraView,
  allUploaded, uploadedFileIds, allAdded, allRenamed, getNewTitle
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
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const debugProps = useContext(DebugContext)

  return (
    <>
      <UploadStep
        files={files} uploads={uploads} setUploads={setUploads} allUploaded={allUploaded}
        enqueue={enqueue} showError={showError}
      />
      {allUploaded || debugProps.includes(DEBUG_PLAYLISTS)
        ? <PlaylistStep
            setPlaylist={setPlaylist} playlists={playlists} setPlaylists={setPlaylists}
            setPlaylistItems={setPlaylistItems} uploadedFileIds={uploadedFileIds}
            createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
            selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
            enqueue={enqueue} showError={showError}
          />
        : null}
      <PlaylistItems
        files={files} uploads={uploads} playlist={playlist}
        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems} allAdded={allAdded}
        enqueue={enqueue} showError={showError}
      />
      {allAdded || debugProps.includes(DEBUG_PLAYLISTS)
        ? <RenameStep
            cameraViews={cameraViews} setCameraViews={setCameraViews} allRenamed={allRenamed}
            renamedTitles={renamedTitles} setRenamedTitles={setRenamedTitles} getNewTitle={getNewTitle}
            playlistItems={playlistItems} defaultCameraView={defaultCameraView}
            enqueue={enqueue} showError={showError}
          />
        : null}
      <PrevNextButtons current={current} setCurrent={setCurrent} nextProps={{ grayed: !allRenamed }} />
    </>
  )
}

export default YouTubePage

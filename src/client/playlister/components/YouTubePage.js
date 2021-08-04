import React from 'react'
import { KIND } from 'baseui/button'
import prevNextButtons from './PrevNextButtons'
import PlaylistItems from './PlaylistItems'
import { HeadingLevel } from 'baseui/heading'
import UploadStep from './UploadStep'
import PlaylistStep from './PlaylistStep'
import RenameStep from './RenameStep'
import { getChosenDate } from './EventDate'

export const YouTubePage = ({
  current, setCurrent, files, uploads, setUploads, orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle, playlists, setPlaylists, selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist, playlist, setPlaylist, playlistItems, setPlaylistItems,
  newTitles, setNewTitles, cameraViews, setCameraViews, defaultCameraView
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

  /*
  const playlistOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
    (playlistTitle.tabIndex === 1 && selectedPlaylist[0] && selectedPlaylist[0].title)
*/

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 && files.every(file => uploadedFileIds.has(file.fileId))

  const playlistVideoIds = new Set(Object.keys(playlistItems))

  /**
   * Gets the new title for a video.
   *
   * @param videoId video id
   * @param index index (position) in playlist
   */
  const getNewTitle = (videoId, index) => {
    const cameraView = cameraViews[videoId] || defaultCameraView
    return `${orgInfo.orgName} ${getChosenDate(eventData)} ${cameraView} ` +
      `${cameraInfo.cameraNumber}.${((index + 1).toString().padStart(2, 0))}`
  }

  const allAdded = Object.keys(playlist).length > 0 && allUploaded && files.every(file =>
    uploads[file.fileId] && playlistVideoIds.has(uploads[file.fileId].videoId)
  )

  /**
   * Have all videos in playlist been renamed?
   */
  const allRenamed = Object.values(playlistItems).every(({ videoId, position }) =>
    newTitles[videoId] === getNewTitle(videoId, position)
  )

  return (
    <HeadingLevel>
      <UploadStep files={files} uploads={uploads} setUploads={setUploads} />
      {allUploaded
        ? <PlaylistStep
            setPlaylist={setPlaylist} playlists={playlists} setPlaylists={setPlaylists}
            setPlaylistItems={setPlaylistItems} uploadedFileIds={uploadedFileIds}
            createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
            selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
          />
        : null}
      <PlaylistItems
        files={files} uploads={uploads} playlist={playlist}
        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems}
      />
      {allAdded
        ? <RenameStep
            cameraViews={cameraViews} setCameraViews={setCameraViews}
            newTitles={newTitles} setNewTitles={setNewTitles} getNewTitle={getNewTitle}
            playlistItems={playlistItems} defaultCameraView={defaultCameraView}
          />
        : null}
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: allRenamed ? KIND.primary : KIND.secondary }
      })}
    </HeadingLevel>
  )
}

export default YouTubePage

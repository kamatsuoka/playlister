import React, { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { parseDescription } from '../util/dates'
import { findUploads } from '../youtube/api'
import UploadList from './UploadList'
import { KIND } from 'baseui/button'
import prevNextButtons from './PrevNextButtons'

export const YouTubePage = ({
  current, setCurrent,
  files, uploads, setUploads,
  orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist,
  playlist, setPlaylist,
  playlistItems, setPlaylistItems
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

  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const checkUploads = useCallback(() => {
    console.log('in checkUploads')
    const fileIds = files.map(data => data.fileId)
    setChecking(true)
    const onSuccess = foundUploads => {
      setUploads(Object.fromEntries(foundUploads.map(upload => [
        upload.fileData.fileId, {
          videoId: upload.videoId,
          title: upload.title,
          publishedAt: upload.publishedAt,
          ...upload.fileData,
          ...parseDescription(upload.description)
        }])))
      setCheckedFileIds(new Set(fileIds))
      setChecking(false)
    }
    const onFailure = err => {
      showError(err)
      setChecking(false)
    }

    try {
      return findUploads(files, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }, [showError, files, setChecking, setUploads])

  useEffect(() => checkUploads(), [files])

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 &&
    files.map(file => file.fileId).every(fileId => uploadedFileIds.has(fileId))

  const allChecked = files.length > 0 &&
    files.map(file => file.fileId).every(fileId => checkedFileIds.has(fileId))

  return (
    <>
      <UploadList
        files={files} checkedFileIds={checkedFileIds} checking={checking}
        uploads={uploads} setUploads={setUploads} checkUploads={checkUploads}
      />
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: allUploaded ? KIND.primary : KIND.secondary }
      })}
    </>
  )
}

export default YouTubePage

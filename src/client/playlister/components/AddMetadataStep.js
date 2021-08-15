import React, { useCallback, useContext, useEffect, useState } from 'react'
import { resourceToPlaylistItem } from '../models/playlists'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { getChosenDate, localDate } from '../models/dates'
import { getVideoNumber } from '../models/renaming'
import ActionButton from './ActionButton'
import VideoMetadata from './VideoMetadata'
import { BASE_SHEETS_URL } from './EventInfoPage'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { useStyletron } from 'baseui'

const AddMetadataStep = ({
  cameraInfo, eventData, cameraViews, playlist, spreadsheetInfo
}) => {
  const [css, theme] = useStyletron()
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])
  const [adding, setAdding] = useState(false)
  const [addedRows, setAddedRows] = useState([])
  const { password } = useContext(PasswordContext)

  const getUrl = (videoId, playlistId, position) =>
    `${BASE_SHEETS_URL}watch?v=${videoId}&list=${playlistId}&index=${position + 1}`

  const playlistItemsToVideoMetadata = useCallback(items => {
    return items.map((item, index) => ({
      date: getChosenDate(eventData),
      videoNumber: getVideoNumber(cameraInfo, index),
      startTime: localDate(item.startTime),
      endTime: localDate(item.endTime),
      title: item.title,
      link: getUrl(item.videoId, item.playlistId, item.position),
      videoId: item.videoId,
      playlistId: item.playlistId,
      position: item.position,
      cameraNumber: cameraInfo.cameraNumber,
      cameraView: cameraViews[item.videoId] || cameraInfo.defaultCameraView,
      cameraName: cameraInfo.cameraName
    }))
  }, [eventData, cameraInfo, cameraViews])

  /**
   * Gets the updated list of playlist items
   */
  const getPlaylistItems = useCallback(() => {
    const onSuccess = resources => {
      const videoMetadatas = playlistItemsToVideoMetadata(
        resources
          .map(resourceToPlaylistItem)
          .sort((item1, item2) => item1.position - item2.position)
      )
      return setVideoMetadata(videoMetadatas)
    }
    if (playlist.playlistId) {
      setVideoMetadata([])
      try {
        return callServer('listPlaylistItems', onSuccess, showError,
          { password, playlistId: playlist.playlistId }
        )
      } catch (e) {
        showError(e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.playlistId, showError, setVideoMetadata])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getPlaylistItems, [playlist.playlistId])

  /**
   * Adds video metadata to sheet
   */
  const addMetadataToSheet = useCallback(() => {
    setAdding(true)
    const onSuccess = updates => {
      const addedRows = updates.updatedData.values
      console.log('got added rows:', addedRows)
      setAdding(false)
      return setAddedRows(addedRows)
    }
    const onError = e => {
      setAdding(false)
      showError(e)
    }
    try {
      const sheetName = spreadsheetInfo.sheetName
      const quotedSheetName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName
      const range = `${quotedSheetName}!A1:J1`
      const values = videoMetadata.map(meta => [
        meta.date,
        meta.videoNumber,
        meta.startTime,
        meta.endTime,
        meta.link,
        meta.cameraNumber,
        meta.cameraView,
        meta.cameraName
      ])
      return callServer('appendRows', onSuccess, onError, {
        password,
        spreadsheetId: spreadsheetInfo.spreadsheetId,
        range,
        values
      })
    } catch (e) {
      showError(e)
    }
  }, [password, videoMetadata, spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName, showError])

  return (
    <>
      <ActionButton
        onClick={addMetadataToSheet} icon={faPlus} spin={adding} text='Add'
        className={css({
          float: 'left',
          marginTop: theme.sizing.scale200,
          marginRight: theme.sizing.scale600
        })}
      />
      <VideoMetadata videoMetadata={videoMetadata} addedRows={addedRows} />
    </>
  )
}

export default AddMetadataStep

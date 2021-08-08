import React, { useCallback, useContext, useEffect, useState } from 'react'
import { resourceToPlaylistItem } from '../models/playlists'
import * as youtube from '../api/youtube/youtube-client'
import * as sheets from '../api/sheets/sheets-client'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { getChosenDate, localDate } from '../models/dates'
import { getVideoNumber } from '../models/renaming'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons/faAngleDoubleDown'
import VideoMetadata from './VideoMetadata'
import { DEBUG_METADATA, DebugContext } from '../context/DebugContext'
import { BASE_SHEETS_URL } from './SetupPage'

const SheetsPage = ({
  cameraInfo, eventData, cameraViews,
  playlist, spreadsheetInfo, setSpreadsheetInfo
}) => {
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])
  const [adding, setAdding] = useState(false)
  const [addedRows, setAddedRows] = useState([])

  const debugProps = useContext(DebugContext)

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

  const testDataToMetadata = data => ({
    date: data[0],
    videoNumber: data[1],
    startTime: data[2],
    endTime: data[3],
    title: `video ${data[1]}`,
    link: data[4],
    cameraNumber: data[5],
    cameraView: data[6],
    cameraName: data[7]
  })

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
        return youtube.listPlaylistItems({
          playlistId: playlist.playlistId, onSuccess, onError: showError
        })
      } catch (e) {
        showError(e)
      }
    } else {
      if (debugProps.includes(DEBUG_METADATA)) {
        const metadata = [
          ['8/5/2021', '1', '2021-07-21 13:19:57', '2021-07-21 14:44:24', 'https://www.youtube.com/watch?v=f5RS5smvNUs&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=1', '1', 'chorus', 'kenji q2n4k'],
          ['8/5/2021', '2', '2021-07-21 14:53:38', '2021-07-21 15:38:40', 'https://www.youtube.com/watch?v=-f_2nFcc_K8&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=2', '1', 'chorus', 'kenji q2n4k'],
          ['8/5/2021', '3', '2021-07-21 15:38:44', '2021-07-21 16:20:42', 'https://www.youtube.com/watch?v=9KXn-QN34lo&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=3', '1', 'chorus', 'kenji q2n4k']
        ].map(testDataToMetadata)
        setVideoMetadata(metadata)
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
      return sheets.appendRows({
        spreadsheetId: spreadsheetInfo.spreadsheetId,
        range,
        values,
        onSuccess,
        onError
      })
    } catch (e) {
      showError(e)
    }
  }, [videoMetadata, spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName, showError])

  return (
    <>
      <Heading styleLevel={5}>Add Video Metadata {' '}
        <ActionButton
          onClick={addMetadataToSheet} icon={faAngleDoubleDown} spin={adding}
        />
      </Heading>
      <VideoMetadata videoMetadata={videoMetadata} addedRows={addedRows} />
    </>
  )
}

export default SheetsPage

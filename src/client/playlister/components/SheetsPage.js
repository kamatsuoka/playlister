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
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons'
import VideoMetadata from './VideoMetadata'
import GoogleSheetInfo from './GoogleSheetInfo'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import { DEBUG_METADATA, DebugContext } from './DebugContext'
import { Label2 } from 'baseui/typography'

const SheetsPage = ({
  cameraInfo, eventData, cameraViews, defaultCameraView,
  playlist, spreadsheetInfo, setSpreadsheetInfo
}) => {
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])
  const [tail, setTail] = useState([])
  const [adding, setAdding] = useState(false)
  const [addedRows, setAddedRows] = useState([])

  const debugProps = useContext(DebugContext)

  const BASE_URL = 'https://www.youtube.com/'
  const getUrl = (videoId, playlistId, position) =>
    `${BASE_URL}watch?v=${videoId}&list=${playlistId}&index=${position + 1}`

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
      cameraView: cameraViews[item.videoId] || defaultCameraView,
      cameraName: cameraInfo.cameraName
    }))
  }, [eventData, cameraInfo, cameraViews, defaultCameraView])

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
        return youtube.listPlaylistItems(playlist.playlistId, onSuccess, showError)
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

  const showAddedRows = () => (
    <>
      <Label2 style={{ textDecoration: 'underline' }}>Added Rows</Label2>
      <TableBuilder data={addedRows} overrides={tableOverrides}>
        {[...Array(8).keys()].map(i =>
          <TableBuilderColumn header='' key={`column${i}`}>
            {row =>
              row[i] && row[i].startsWith(BASE_URL)
                ? (
                  <StyledLink href={row[i]} target='_blank' rel='noopener noreferrer'>
                    youtube link
                  </StyledLink>
                  )
                : row[i]}
          </TableBuilderColumn>
        )}
      </TableBuilder>
    </>
  )

  return (
    <>
      <GoogleSheetInfo
        spreadsheetInfo={spreadsheetInfo} setSpreadsheetInfo={setSpreadsheetInfo}
        tail={tail} setTail={setTail} baseUrl={BASE_URL}
      />
      <Heading styleLevel={5}>Video Metadata To Add {' '}
        <ActionButton
          onClick={addMetadataToSheet} grayed={tail.length === 0} icon={faAngleDoubleDown} spin={adding}
        />
      </Heading>
      <VideoMetadata videoMetadata={videoMetadata} />
      {addedRows.length > 0 ? showAddedRows() : null}
    </>
  )
}

export default SheetsPage

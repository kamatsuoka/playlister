import React, { useCallback, useEffect, useState } from 'react'
import { resourceToPlaylistItem } from '../models/playlists'
import * as youtube from '../api/youtube/youtube-client'
import * as sheets from '../api/sheets/sheets-client'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { getChosenDate, localDate } from '../models/dates'
import { getVideoNumber } from '../models/renaming'
import { Table, TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import Tooltip from './Tooltip'
import { Heading } from 'baseui/heading'
import { copyData, usePersist } from '../hooks/usePersist'

const SheetsPage = ({
  cameraInfo, eventData, cameraViews, defaultCameraView,
  playlist, spreadsheetInfo, setSpreadsheetInfo
}) => {
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])
  const [tail, setTail] = useState([])

  const BASE_URL = 'https://www.youtube.com/watch'
  const getUrl = (videoId, playlistId, position) =>
    `${BASE_URL}?v=${videoId}&list=${playlistId}&index=${position + 1}`

  const handleChange = (evt, setValues) => {
    const value = evt.target.value
    setSpreadsheetInfo(values => ({
      ...values,
      [evt.target.name]: value
    }))
  }

  const SPREADSHEET_DATA_KEY = 'spreadsheet_info'
  usePersist({
    key: SPREADSHEET_DATA_KEY,
    onRestore: copyData,
    setState: setSpreadsheetInfo,
    state: spreadsheetInfo
  })

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

  /**
   * Gets the updated list of playlist items
   */
  const getPlaylistItems = useCallback(() => {
    if (!playlist.playlistId) {
      return
    }
    setVideoMetadata([])
    const onSuccess = resources => {
      const videoMetadatas = playlistItemsToVideoMetadata(
        resources
          .map(resourceToPlaylistItem)
          .sort((item1, item2) => item1.position - item2.position)
      )
      return setVideoMetadata(videoMetadatas)
    }
    try {
      return youtube.listPlaylistItems(playlist.playlistId, onSuccess, showError)
    } catch (e) {
      showError(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.playlistId, showError, setVideoMetadata])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getPlaylistItems, [playlist.playlistId])

  /**
   * Gets the last few rows of the spreadsheet
   */
  const getTail = useCallback(() => {
    if (spreadsheetInfo.spreadsheetId && spreadsheetInfo.spreadsheetId.length > 40 &&
      spreadsheetInfo.sheetName && spreadsheetInfo.sheetName.length > 3) {
      setTail([])
      const onSuccess = tailRows => {
        return setTail(tailRows)
      }
      try {
        const range = `${spreadsheetInfo.sheetName}!A1:J1`
        return sheets.tailSheet(spreadsheetInfo.spreadsheetId, range, onSuccess, showError)
      } catch (e) {
        showError(e)
      }
    }
  }, [spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName, showError, setTail])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getTail, [spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName])

  const tooltip = (
    <>
      The Google Sheets spreadsheet id is found in the url path.
      <br />
      The url typically looks like
      https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit#gid=...
      <br />
    </>
  )

  /*
  const TAIL_COLUMNS = [
    'rehearsal date',
    'video #',
    'start time',
    'end time',
    'link',
    'camera #',
    'camera view',
    'camera name'
  ]
*/

  return (
    <>
      <Heading styleLevel={5}>Video Metadata</Heading>
      <TableBuilder data={videoMetadata} overrides={tableOverrides}>
        <TableBuilderColumn header='date'>
          {row => row.date}
        </TableBuilderColumn>
        <TableBuilderColumn header='video #'>
          {row => row.videoNumber}
        </TableBuilderColumn>
        <TableBuilderColumn header='start time'>
          {row => row.startTime}
        </TableBuilderColumn>
        <TableBuilderColumn header='end time'>
          {row => row.endTime}
        </TableBuilderColumn>
        <TableBuilderColumn header='link'>
          {row =>
            <StyledLink href={getUrl(row)} target='_blank' rel='noopener noreferrer'>
              {row.title}
            </StyledLink>}
        </TableBuilderColumn>
        <TableBuilderColumn header='camera #'>
          {row => row.cameraNumber}
        </TableBuilderColumn>
        <TableBuilderColumn header='camera view'>
          {row => row.cameraView}
        </TableBuilderColumn>
        <TableBuilderColumn header='camera name'>
          {row => row.cameraName}
        </TableBuilderColumn>
      </TableBuilder>
      <Heading styleLevel={5}>Append to <Tooltip tooltip={tooltip}>Sheet</Tooltip></Heading>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem>
          <FormControl caption='spreadsheet id'>
            <Input
              value={spreadsheetInfo.spreadsheetId || ''}
              name='spreadsheetId'
              placeholder='long alphanumeric in url path like 1BTxLr0...'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem>
          <FormControl caption='sheet name'>
            <Input
              value={spreadsheetInfo.sheetName || ''}
              name='sheetName'
              placeholder='sheet name as it appears in tab'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
      <Table data={tail} overrides={tableOverrides} />
    </>
  )
}

export default SheetsPage

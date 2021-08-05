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
import { Heading, HeadingLevel } from 'baseui/heading'
import { copyData, usePersist } from '../hooks/usePersist'
import ActionButton from './ActionButton'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { useStyletron } from 'baseui'

const SheetsPage = ({
  cameraInfo, eventData, cameraViews, defaultCameraView,
  playlist, spreadsheetInfo, setSpreadsheetInfo
}) => {
  const [, theme] = useStyletron()
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const [videoMetadata, setVideoMetadata] = useState([])
  const [tail, setTail] = useState([])
  const [tailing, setTailing] = useState(false)

  const BASE_URL = 'https://www.youtube.com/watch'
  const getUrl = (videoId, playlistId, position) =>
    `${BASE_URL}?v=${videoId}&list=${playlistId}&index=${position + 1}`

  const handleChange = evt => {
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

  function sheetIdsOkay () {
    return spreadsheetInfo.spreadsheetId && spreadsheetInfo.spreadsheetId.length > 40 &&
      spreadsheetInfo.sheetName && spreadsheetInfo.sheetName.length > 2
  }

  /**
   * Gets the last few rows of the spreadsheet
   */
  const getTail = useCallback(rowCount => {
    if (sheetIdsOkay()) {
      setTail([])
      setTailing(true)
      const onSuccess = tailRows => {
        console.log('got tail of sheet:', tailRows)
        setTailing(false)
        return setTail(tailRows)
      }
      const onError = e => {
        setTailing(false)
        showError(e)
      }
      try {
        const sheetName = spreadsheetInfo.sheetName
        const quotedSheetName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName
        const range = `${quotedSheetName}!A1:J1`
        return sheets.tailSheet(spreadsheetInfo.spreadsheetId, range, rowCount, onSuccess, onError)
      } catch (e) {
        showError(e)
      }
    }
  }, [spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName, showError, setTail])

  const tooltip = (
    <>
      The Google Sheets spreadsheet id is found in the url path.
      <br />
      The url typically looks like
      https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit#gid=...
      <br />
    </>
  )

  const itemProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const itemWidthProps = blockStyle => ({
    ...itemProps,
    overrides: {
      Block: {
        style: ({
          flexGrow: 0,
          ...blockStyle
        })
      }
    }
  })

  return (
    <>
      <Heading styleLevel={5}>Video Metadata</Heading>
      <TableBuilder data={videoMetadata} overrides={tableOverrides}>
        <TableBuilderColumn header='date'>
          {row => row.date}
        </TableBuilderColumn>
        <TableBuilderColumn header='vid #'>
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
            <StyledLink href={row.link} target='_blank' rel='noopener noreferrer'>
              {row.title}
            </StyledLink>}
        </TableBuilderColumn>
        <TableBuilderColumn header='cam #'>
          {row => row.cameraNumber}
        </TableBuilderColumn>
        <TableBuilderColumn header='cam view'>
          {row => row.cameraView}
        </TableBuilderColumn>
        <TableBuilderColumn header='cam name'>
          {row => row.cameraName}
        </TableBuilderColumn>
      </TableBuilder>
      <Heading styleLevel={5}><Tooltip tooltip={tooltip}>Sheet</Tooltip> to Append to</Heading>
      <FlexGrid
        flexGridColumnCount={3}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem {...itemProps}>
          <FormControl caption='spreadsheet id'>
            <Input
              value={spreadsheetInfo.spreadsheetId || ''}
              name='spreadsheetId'
              placeholder='long alphanumeric in url path like 1BTxLr0...'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemWidthProps({ width: theme.sizing.scale4800 })}>
          <FormControl caption='sheet name'>
            <Input
              value={spreadsheetInfo.sheetName || ''}
              name='sheetName'
              placeholder='sheet name as it appears in tab'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem
          {...itemWidthProps({ width: theme.sizing.scale1200, position: 'relative', top: '-' + theme.sizing.scale800 })}
        >
          <ActionButton onClick={() => getTail(3)} grayed={!sheetIdsOkay()} icon={faCheck} spin={tailing} />
        </FlexGridItem>
      </FlexGrid>
      <HeadingLevel>
        <Heading styleLevel={6}>Last Few Rows</Heading>
        <TableBuilder data={tail} overrides={tableOverrides}>
          <TableBuilderColumn header='date'>
            {row => row[0]}
          </TableBuilderColumn>
          <TableBuilderColumn header='vid #'>
            {row => row[1]}
          </TableBuilderColumn>
          <TableBuilderColumn header='start time'>
            {row => row[2]}
          </TableBuilderColumn>
          <TableBuilderColumn header='end time'>
            {row => row[3]}
          </TableBuilderColumn>
          <TableBuilderColumn header='link'>
            {row =>
              <StyledLink href={row[4]} target='_blank' rel='noopener noreferrer'>
                ...{row[4].slice(-15)}
              </StyledLink>}
          </TableBuilderColumn>
          <TableBuilderColumn header='cam #'>
            {row => row[5]}
          </TableBuilderColumn>
          <TableBuilderColumn header='cam view'>
            {row => row[6]}
          </TableBuilderColumn>
          <TableBuilderColumn header='cam name'>
            {row => row[7]}
          </TableBuilderColumn>
        </TableBuilder>
      </HeadingLevel>
      <Table data={tail} overrides={tableOverrides} />
    </>
  )
}

export default SheetsPage

import React, { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Table } from 'baseui/table-semantic'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const VideoList = ({
  uploadList,
  playlistData,
  videoNaming,
  setVideoResources
}) => {
  const [tableData, setTableData] = useState([])
  console.log('VideoList: uploadList = ', uploadList)
  console.log('VideoList: playlistData = ', playlistData)
  const date = playlistData.eventDate
  const startIndex = parseInt(playlistData.itemCount || 0) + 1 + parseInt(videoNaming.indexOffset)
  const pad = (n) => n < 10 ? `0${n}` : `${n}`
  const videoList = uploadList.map((upload, index) => ({
    filename: upload.filename,
    oldTitle: upload.title,
    newTitle: `${videoNaming.prefix} ${date} ${videoNaming.cameraView} ${pad(startIndex + index)}`
  }))
  console.log('VideoList: videoList = ', videoList)

  const COLUMNS = ['Filename', 'Original Title', 'New Title']

  return (
    <Table columns={COLUMNS} data={videoList.map(video => [video.filename, video.oldTitle, video.newTitle])} />
  )
}

export default VideoList

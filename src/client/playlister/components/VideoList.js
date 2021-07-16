import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Table } from 'baseui/table-semantic'
import { BaseCard } from './BaseCard'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const VideoList = ({
  eventData,
  startEndList,
  playlistData,
  videoNaming,
  setVideoResources
}) => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    const date = eventData.inferredDate
    const startIndex = parseInt(playlistData.itemCount || 0) + 1 + parseInt(videoNaming.indexOffset)
    const pad = (n) => n < 10 ? `0${n}` : `${n}`
    const resources = startEndList.map((startEnd, index) => ({
      kind: 'youtube#video',
      snippet: {
        title: `${videoNaming.prefix} ${date} ${videoNaming.cameraView} ${pad(startIndex + index)}`,
        categoryId: 10 // Music
      },
      recordingDetails: {
        recordingDate: dayjs(startEnd.startTime).utc().format()
      }
    }))
    setVideoResources(resources)
    setTableData(startEndList.map(s => s.name).map((n, i) =>
      [n, resources[i].snippet.title, resources[i].recordingDetails.recordingDate])
    )
  }, [startEndList, playlistData, videoNaming])

  const COLUMNS = ['File name', 'Video Name', 'Recording Date']

  return (
    <BaseCard title='Video List'>
      <Table columns={COLUMNS} data={tableData} />
    </BaseCard>
  )
}

export default VideoList

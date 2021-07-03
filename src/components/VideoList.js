import React, {useEffect, useState} from "react"
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import localizedFormat from "dayjs/plugin/localizedFormat"
import advancedFormat from "dayjs/plugin/advancedFormat"
import timezone from "dayjs/plugin/timezone" // dependent on utc plugin
import customParseFormat from "dayjs/plugin/customParseFormat"
import {Table} from 'baseui/table-semantic';
import {BaseCard} from "./BaseCard"

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const VideoList = ({
                     inferredDate,
                     startEndList,
                     playlistSettings,
                     videoNameSettings,
                     videoResources,
                     setVideoResources
                   }) => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    const date = inferredDate.date
    const startIndex = playlistSettings.itemCount + 1
    const pad = (n) => n < 10 ? `0${n}` : `${n}`
    const resources = startEndList.map((startEnd, index) => ({
      kind: "youtube#video",
      snippet: {
        title: `${videoNameSettings.prefix} ${date} ${videoNameSettings.cameraView} ${pad(startIndex + index)}`
      },
      recordingDetails: {
        recordingDate: dayjs(startEnd.startTime).utc().format()
      }
    }))
    setVideoResources(resources)
    setTableData(startEndList.map(s => s.name).map((n, i) =>
      [n, resources[i].snippet.title, resources[i].recordingDetails.recordingDate])
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startEndList, playlistSettings, videoNameSettings])

  const COLUMNS = ['File name', 'Video Name', 'Recording Date']

  return (
    <BaseCard title="Video List">
      <Table columns={COLUMNS} data={tableData}/>
    </BaseCard>
  )
}

export default VideoList

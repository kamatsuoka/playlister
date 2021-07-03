import React, {useEffect, useState} from "react"
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import localizedFormat from "dayjs/plugin/localizedFormat"
import advancedFormat from "dayjs/plugin/advancedFormat"
import timezone from "dayjs/plugin/timezone" // dependent on utc plugin
import customParseFormat from "dayjs/plugin/customParseFormat"
import {Table} from 'baseui/table-semantic';
import {inferredDate} from "./RehearsalData"

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of calculated file properties
 */
const VideoList = ({startEndList, playlistSettings, videoNameSettings, videoResources, setVideoResources}) => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    const date = inferredDate(startEndList)
    const startIndex = playlistSettings.itemCount + 1
    const pad = (n) => n < 10 ? `0${n}` : `${n}`
    const resources = startEndList.map((startEnd, index) => ({
      kind: "youtube#video",
      snippet: {
        title: `${videoNameSettings.prefix} ${date.replaceAll('-', '')} ${videoNameSettings.cameraView} ${pad(startIndex + index)}`
      },
      recordingDetails: {
        recordingDate: dayjs(startEnd.startTime).utc().format()
      }
    }))
    setVideoResources(resources)
    setTableData(startEndList.map(s => s.name).map((n, i) =>
      [n, resources[i].snippet.title, resources[i].recordingDetails.recordingDate])
    )
  }, [startEndList, playlistSettings, videoNameSettings, setVideoResources])

  const COLUMNS = ['File name', 'Video Name', 'Recording Date']

  return (
    <div id="start-end">
      <Table columns={COLUMNS} data={tableData}/>
    </div>
  )
}

export default VideoList

import MediaInfoJs from "./MediaInfoJs"
import React, {useState} from "react"
import MetadataList from "./MetadataList"
import TimezoneOverride from "./TimezoneOverride"
import StartEndList from "./StartEndList"
import PlaylistSettings from "./PlaylistSettings"
import {StyledLink} from "baseui/link"

/**
 * Page that holds MediaInfo lookup and results
 */
const MediaPage = ({className}) => {

  const [fileInfo, setFileInfo] = useState({})
  const [timeZone, setTimeZone] = useState("");
  const [overrideTimeZone, setOverrideTimeZone] = useState(false)
  const [startEndList, setStartEndList] = useState([])
  const [playlistSettings, setPlaylistSettings] =
    useState({eventType: "rehearsal", prefix: "fcs", cameraView: "chorus", startIndex: 1})

  const showFiles = (fileInfo) => {
    return <React.Fragment>
      <div id="file-metadata">
        <h3>File Metadata</h3>
      </div>
      <MetadataList values={fileInfo} setValues={setFileInfo}/>
      <div style={{textAlign: 'right'}}>
        <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>
      </div>
      <hr/>
      <TimezoneOverride value={timeZone} setValue={setTimeZone}
                        override={overrideTimeZone} setOverride={setOverrideTimeZone}/>
      <h3>Start and End Times</h3>
      <StartEndList fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
                    startEndList={startEndList} setStartEndList={setStartEndList}/>
      <h3>Playlist</h3>
      <PlaylistSettings startEndList={startEndList} value={playlistSettings} setValue={setPlaylistSettings}/>
    </React.Fragment>
  }

  return (
    <div className={className}>
      <MediaInfoJs results={fileInfo} setResults={setFileInfo}/>
      {Object.keys(fileInfo).length > 0 ? showFiles(fileInfo) : null}
    </div>
  )
}

export default MediaPage

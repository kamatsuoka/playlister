import MediaInfoJs from "./MediaInfoJs"
import React, {useState} from "react"
import MetadataList from "./MetadataList"
import TimezoneOverride from "./TimezoneOverride"
import CalculatedList from "./CalculatedList"

/**
 * Page that holds MediaInfo lookup and results
 */
const MediaPage = ({className}) => {

  const [fileInfo, setFileInfo] = useState({})
  const [timeZone, setTimeZone] = useState("");
  const [overrideTimeZone, setOverrideTimeZone] = useState(false)
  const [fileProperties, setFileProperties] = useState({})

  const showFiles = (fileInfo) => {
    return <React.Fragment>
      <h3>File Metadata</h3>
      <MetadataList values={fileInfo} setValues={setFileInfo}/>
      <TimezoneOverride value={timeZone} setValue={setTimeZone}
                        override={overrideTimeZone} setOverride={setOverrideTimeZone}/>
      <hr/>
      <h3>Calculated Properties</h3>
      <CalculatedList fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
                      fileProperties={fileProperties} setFileProperties={setFileProperties}/>
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

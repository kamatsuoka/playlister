import MediaInfoJs from "./MediaInfoJs"
import React, {useState} from "react"
import MetadataList from "./MetadataList"
import TimezoneOverride from "./TimezoneOverride"
import StartEndList from "./StartEndList"
import {StyledLink} from "baseui/link"
import {Heading, HeadingLevel} from "baseui/heading"

/**
 * Page that holds MediaInfo lookup and results
 */
const MediaPage = ({className, startEndList, setStartEndList}) => {

  const [fileInfo, setFileInfo] = useState({})
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  const showFiles = (fileInfo) => {
    return (
      <HeadingLevel>
        <div id="file-metadata">
          <Heading styleLevel={6}>File Metadata</Heading>
        </div>
        <MetadataList values={fileInfo} setValues={setFileInfo}/>
        <div style={{textAlign: 'right', marginTop: '10px'}}>
          <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>
        </div>
        <div style={{marginTop: '20px'}}>
          <Heading styleLevel={6}>Start and End Times</Heading>
          <TimezoneOverride value={overrideTimeZone} setValue={setOverrideTimeZone}/>
          <StartEndList fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
                        startEndList={startEndList} setStartEndList={setStartEndList}/>
        </div>
      </HeadingLevel>
    )
  }

  return (
    <div className={className}>
      <MediaInfoJs results={fileInfo} setResults={setFileInfo}/>
      {Object.keys(fileInfo).length > 0 ? showFiles(fileInfo) : null}
    </div>
  )
}

export default MediaPage

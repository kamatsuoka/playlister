import MediaInfoJs from "./MediaInfoJs"
import React, {useState} from "react"
import MetadataList from "./MetadataList"
import TimezoneOverride from "./TimezoneOverride"
import StartEndList from "./StartEndList"
import {StyledLink} from "baseui/link"
import {HeadingLevel} from "baseui/heading"
import InferredDate from "./InferredDate"
import {BaseCard} from "./BaseCard"

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({
                    startEndList, setStartEndList, rehearsalData, setRehearsalData,
                    inferredDate, setInferredDate
                  }) => {

  const [fileInfo, setFileInfo] = useState({})
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)

  return (
    <div>
      <MediaInfoJs results={fileInfo} setResults={setFileInfo}/>
      <HeadingLevel>
        <BaseCard title="File Metadata">
          <MetadataList values={fileInfo} setValues={setFileInfo}/>
          <div style={{textAlign: 'right', marginTop: '10px'}}>
            <StyledLink onClick={() => setFileInfo({})}>Clear All</StyledLink>
          </div>
        </BaseCard>
        <BaseCard title="Start and End Times">
          <TimezoneOverride value={overrideTimeZone} setValue={setOverrideTimeZone}/>
          <StartEndList fileInfo={fileInfo} overrideTimeZone={overrideTimeZone}
                        startEndList={startEndList} setStartEndList={setStartEndList}/>
        </BaseCard>
        <InferredDate startEndList={startEndList} value={inferredDate} setValue={setInferredDate}/>
      </HeadingLevel>
    </div>
  )
}

export default FilePage

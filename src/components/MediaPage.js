import MediaInfoJs from "./MediaInfoJs"
import React, {useState} from "react"
import MediaResults from "./MediaResults"
import TimezoneFix from "./TimezoneFix"

/**
 * Page that holds MediaInfo lookup and results
 */
const MediaPage = ({className}) => {

  const [results, setResults] = useState({})

  return (
    <div className={className}>
      <MediaInfoJs results={results} setResults={setResults}/>
      <MediaResults results={results} setResults={setResults}/>
      <TimezoneFix results={results}/>
    </div>

  )
}

export default MediaPage

import React, {useState} from 'react'
import VideoNaming from "./VideoNaming"
import VideoList from "./VideoList"

const VideoPage = ({inferredDate, startEndList, playlistSettings}) => {
  const [videoNameSettings, setVideoNameSettings] = useState({
    prefix: "fcs", cameraView: "chorus"
  })
  const [videoResources, setVideoResources] = useState({})

  return (
    <React.Fragment>
      <VideoNaming value={videoNameSettings} setValue={setVideoNameSettings}/>
      <VideoList inferredDate={inferredDate} startEndList={startEndList} playlistSettings={playlistSettings}
                 videoNameSettings={videoNameSettings} videoResources={videoResources}
                 setVideoResources={setVideoResources}/>
    </React.Fragment>
  )
}

export default VideoPage

import React, {useState} from 'react'
import VideoNaming from "./VideoNaming"
import {Heading, HeadingLevel} from "baseui/heading"
import VideoList from "./VideoList"

const VideosPage = ({startEndList, playlistSettings}) => {
  const [videoNameSettings, setVideoNameSettings] = useState({
    prefix: "fcs", cameraView: "chorus"
  })
  const [videoResources, setVideoResources] = useState({})

  return (
    <HeadingLevel>
      <Heading styleLevel={6}>Video Naming</Heading>
      <VideoNaming value={videoNameSettings} setValue={setVideoNameSettings}/>
      <Heading styleLevel={6}>Video List</Heading>
      <VideoList startEndList={startEndList} playlistSettings={playlistSettings}
                 videoNameSettings={videoNameSettings} videoResources={videoResources}
                 setVideoResources={setVideoResources}/>
    </HeadingLevel>
  )
}

export default VideosPage

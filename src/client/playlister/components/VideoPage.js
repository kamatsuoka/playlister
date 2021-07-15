import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'

const VideoPage = ({ eventData, startEndList, playlistSettings, setActiveKey }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })
  const [videoResources, setVideoResources] = useState({})

  return (
    <>
      <VideoNaming playlistSettings={playlistSettings} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
      <VideoList
        eventData={eventData} startEndList={startEndList} playlistSettings={playlistSettings}
        videoNaming={videoNaming} setVideoResources={setVideoResources}
      />
    </>
  )
}

export default VideoPage

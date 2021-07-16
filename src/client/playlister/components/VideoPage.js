import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'

const VideoPage = ({ eventData, startEndList, playlistData, setActiveKey }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })
  const [videoResources, setVideoResources] = useState({})

  return (
    <>
      <VideoNaming playlistData={playlistData} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
      <VideoList
        eventData={eventData} startEndList={startEndList} playlistData={playlistData}
        videoNaming={videoNaming} setVideoResources={setVideoResources}
      />
    </>
  )
}

export default VideoPage

import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'

const VideoPage = ({ uploadList, playlistData, setActiveKey }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })
  const [, setVideoResources] = useState({})

  return (
    <>
      <VideoList
        uploadList={uploadList} playlistData={playlistData}
        videoNaming={videoNaming} setVideoResources={setVideoResources}
      />
      <VideoNaming playlistData={playlistData} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
    </>
  )
}

export default VideoPage

import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'

const VideoPage = ({ uploadList, setUploadList, playlistData, newTitles, setNewTitles }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })

  return (
    <>
      <VideoNaming playlistData={playlistData} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
      <VideoList
        uploadList={uploadList} setUploadList={setUploadList}
        playlistData={playlistData} videoNaming={videoNaming}
        newTitles={newTitles} setNewTitles={setNewTitles}
      />

    </>
  )
}

export default VideoPage

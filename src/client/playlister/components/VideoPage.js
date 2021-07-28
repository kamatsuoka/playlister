import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'
import prevNextButtons from './PrevNextButtons'

const VideoPage = ({ current, setCurrent, files, uploads, setUploads, playlist, newTitles, setNewTitles }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })

  return (
    <>
      <VideoNaming playlist={playlist} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
      <VideoList
        uploads={uploads} setUploads={setUploads}
        playlist={playlist} videoNaming={videoNaming}
        newTitles={newTitles} setNewTitles={setNewTitles}
      />
      {prevNextButtons({ current, setCurrent, nextProps: { last: true } })}
    </>
  )
}

export default VideoPage

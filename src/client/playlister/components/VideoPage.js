import React, { useState } from 'react'
import VideoNaming from './VideoNaming'
import VideoList from './VideoList'
import { Button, KIND, SIZE } from 'baseui/button'

const VideoPage = ({ uploadList, playlistData, setActiveKey }) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: 'fcs', cameraView: 'chorus', nextIndex: 1, indexOffset: 0
  })
  const [renaming, setRenaming] = useState(false)

  const renameVideos = () => {

  }

  const allRenamed = () => {
    return false // return true if all videos have been renamed
  }

  return (
    <>
      <VideoList uploadList={uploadList} playlistData={playlistData} videoNaming={videoNaming} />
      <VideoNaming playlistData={playlistData} videoNaming={videoNaming} setVideoNaming={setVideoNaming} />
      <Button
        onClick={() => renameVideos()}
        size={SIZE.compact}
        kind={uploadList.length ? KIND.primary : KIND.secondary}
        isLoading={renaming}
        disabled={uploadList.length === 0 || allRenamed()}
        overrides={{
          Root: { style: ({ $theme }) => ({ marginBottom: $theme.sizing.scale600 }) }
        }}
      >
        Rename Videos
      </Button>

    </>
  )
}

export default VideoPage

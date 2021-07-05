import React, {useState} from 'react'
import VideoNaming from "./VideoNaming"
import VideoList from "./VideoList"
import {Button} from "baseui/button"
import {KIND, Notification} from "baseui/notification"
import {StyledLink} from "baseui/link"
import {isAuthenticated} from "../util/auth"

const VideoPage = ({inferredDate, startEndList, playlistSettings, setActiveKey}) => {
  const [videoNaming, setVideoNaming] = useState({
    prefix: "fcs", cameraView: "chorus", nextIndex: 1, indexOffset: 0
  })
  const [videoResources, setVideoResources] = useState({})

  const canUpload = () => {
    // TODO
    // return isAuthenticated() && Object.keys(videoResources).length > 0 && playlistSettings.id
    return false
  }

  const showNotification = () => {
    const overrides = {Body: {style: {width: 'auto'}}}
    if (!isAuthenticated()) {
      return <Notification kind={KIND.negative} overrides={overrides}>
        Please &nbsp;
        <StyledLink onClick={() => setActiveKey(1)}>authenticate</StyledLink>
        &nbsp; first
      </Notification>
    } else if (!playlistSettings.id) {
      return <Notification kind={KIND.negative} overrides={overrides}>
        Please &nbsp;
        <StyledLink onClick={() => setActiveKey(2)}>find or create the playlist</StyledLink>
        &nbsp; first
      </Notification>
    } else {
      return null
    }
  }


  return (
    <React.Fragment>
      <VideoNaming playlistSettings={playlistSettings} value={videoNaming} setValue={setVideoNaming}/>
      <VideoList inferredDate={inferredDate} startEndList={startEndList} playlistSettings={playlistSettings}
                 videoNaming={videoNaming} setVideoResources={setVideoResources}/>
      <Button disabled={!canUpload()}>Upload no work</Button>
      {showNotification()}
    </React.Fragment>
  )
}

export default VideoPage

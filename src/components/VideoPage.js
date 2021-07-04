import React, {useState} from 'react'
import VideoNaming from "./VideoNaming"
import VideoList from "./VideoList"
import {Button} from "baseui/button"
import {KIND, Notification} from "baseui/notification"
import {StyledLink} from "baseui/link"

const gapi = window.gapi

const VideoPage = ({googleAuth, inferredDate, startEndList, playlistSettings, setActiveKey}) => {
  const [videoNameSettings, setVideoNameSettings] = useState({
    prefix: "fcs", cameraView: "chorus"
  })
  const [videoResources, setVideoResources] = useState({})

  const isAuthenticated = () => googleAuth && googleAuth.isSignedIn

  const canUpload = () => isAuthenticated() && Object.keys(videoResources).length > 0 && playlistSettings.id

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
      <VideoNaming value={videoNameSettings} setValue={setVideoNameSettings}/>
      <VideoList inferredDate={inferredDate} startEndList={startEndList} playlistSettings={playlistSettings}
                 videoNameSettings={videoNameSettings} videoResources={videoResources}
                 setVideoResources={setVideoResources}/>
      <Button disabled={!canUpload()}>Upload not work yet</Button>
      {showNotification()}
    </React.Fragment>
  )
}

export default VideoPage

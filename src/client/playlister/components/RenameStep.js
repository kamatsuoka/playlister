import { Block } from 'baseui/block'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'
import RenameList from './RenameList'
import React, { useState } from 'react'
import { useStyletron } from 'baseui'
import * as youtube from '../api/youtube/youtube-client'

const RenameStep = ({
  cameraViews, setCameraViews, allRenamed, renamedTitles, setRenamedTitles,
  getNewTitle, playlistItems, defaultCameraView, enqueue, showError
}) => {
  const [css, theme] = useStyletron()
  const [renaming, setRenaming] = useState(false)

  const renameVideos = () => {
    setRenaming(true)
    setRenamedTitles({})
    // map of { videoId: title }
    const videoTitleDesc = Object.fromEntries(
      Object.values(playlistItems).map(({ videoId, position, description }) =>
        [videoId, { title: getNewTitle(videoId, position), description }]
      )
    )

    const onSuccess = videoTitles => {
      enqueue({ message: 'all videos renamed' })
      console.log('youtube.renameVideos succeeded with', videoTitles)
      setRenaming(false)
      return setRenamedTitles(videoTitles)
    }
    const onFailure = err => {
      setRenaming(false)
      showError(err)
    }
    console.log('calling youtube.renameVideos with args', videoTitleDesc)
    return youtube.renameVideos(videoTitleDesc, onSuccess, onFailure)
  }

  return (
    <Block className={css({ marginBottom: theme.sizing.scale600 })}>
      <Heading styleLevel={5}>
        4. Rename &nbsp;
        <ActionButton
          onClick={renameVideos} spin={renaming} title='sync' icon={faAngleDoubleRight}
          disabled={Object.keys(playlistItems).length === 0} grayed={allRenamed}
        />
      </Heading>
      <RenameList
        playlistItems={playlistItems} renamedTitles={renamedTitles} setNewTitles={setRenamedTitles}
        cameraViews={cameraViews} setCameraViews={setCameraViews} defaultCameraView={defaultCameraView}
        getNewTitle={getNewTitle}
      />
    </Block>
  )
}

export default RenameStep

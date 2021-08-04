import { Block } from 'baseui/block'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'
import RenameList from './RenameList'
import React, { useState } from 'react'
import { useStyletron } from 'baseui'
import * as youtube from '../youtube/api'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'

const RenameStep = ({
  cameraViews, setCameraViews, newTitles, setNewTitles,
  getNewTitle, playlistItems, defaultCameraView
}) => {
  const [css, theme] = useStyletron()
  const [renaming, setRenaming] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const renameVideos = () => {
    setRenaming(true)
    setNewTitles({})
    // map of { videoId: title }
    const videoTitles = Object.fromEntries(
      Object.values(playlistItems).map(({ videoId, position }) =>
        [videoId, getNewTitle(videoId, position)]
      )
    )
    const onSuccess = videoTitles => {
      setRenaming(false)
      return setNewTitles(videoTitles)
    }
    const onFailure = err => {
      setRenaming(false)
      showError(err)
    }
    console.log('calling youtube.renameVideos with args', videoTitles)
    youtube.renameVideos(videoTitles, onSuccess, onFailure)
  }

  return (
    <Block className={css({ marginBottom: theme.sizing.scale600 })}>
      <Heading styleLevel={5}>
        4. Rename &nbsp;
        <ActionButton
          onClick={renameVideos} spin={renaming} title='sync' icon={faAngleDoubleRight}
          disabled={Object.keys(playlistItems).length === 0}
        />
      </Heading>
      <RenameList
        playlistItems={playlistItems} newTitles={newTitles} setNewTitles={setNewTitles}
        cameraViews={cameraViews} setCameraViews={setCameraViews} defaultCameraView={defaultCameraView}
        getNewTitle={getNewTitle}
      />
    </Block>
  )
}

export default RenameStep

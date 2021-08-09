import { Block } from 'baseui/block'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight'
import RenameList from './RenameList'
import React, { useCallback, useContext, useState } from 'react'
import { useStyletron } from 'baseui'
import PasswordContext from '../context/PasswordContext'
import { callServer } from '../api/api'

const RenameStep = ({
  cameraViews, setCameraViews, allRenamed, renamedTitles, setRenamedTitles,
  getNewTitle, playlistItems, cameraInfo, enqueue, showError
}) => {
  const [css, theme] = useStyletron()
  const [renaming, setRenaming] = useState(false)
  const { password } = useContext(PasswordContext)

  const renameVideos = useCallback(() => {
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
    return callServer('renameVideos', onSuccess, onFailure, { password, videoTitleDesc })
    // eslint-disable-next-line
  }, [playlistItems])

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
        playlistItems={playlistItems} renamedTitles={renamedTitles} getNewTitle={getNewTitle}
        cameraViews={cameraViews} setCameraViews={setCameraViews} cameraInfo={cameraInfo}

      />
    </Block>
  )
}

export default RenameStep

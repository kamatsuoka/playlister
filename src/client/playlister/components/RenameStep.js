import ActionButton from './ActionButton'
import RenameList from './RenameList'
import React, { useCallback, useContext, useState } from 'react'
import { useStyletron } from 'baseui'
import PasswordContext from '../context/PasswordContext'
import { callServer } from '../api/api'
import { faAsterisk } from '@fortawesome/free-solid-svg-icons/faAsterisk'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { Block } from 'baseui/block'
import { Label2, Paragraph2 } from 'baseui/typography'

const RenameStep = ({
  cameraViews, setCameraViews, allRenamed, renamedTitles, setRenamedTitles,
  getNewTitle, playlist, playlistItems, cameraInfo
}) => {
  const [css, theme] = useStyletron()
  const [renaming, setRenaming] = useState(false)
  const { password } = useContext(PasswordContext)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

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
    <>
      <Block className={css({ display: 'flex', alignItems: 'center' })}>
        <ActionButton
          onClick={renameVideos} spin={renaming} title='rename videos' icon={faAsterisk}
          disabled={Object.keys(playlistItems).length === 0} grayed={allRenamed}
          className={css({
            float: 'left',
            marginTop: theme.sizing.scale200,
            marginRight: theme.sizing.scale600
          })}
          text='Rename'
        />
        <Paragraph2>
          videos in &nbsp;
        </Paragraph2>
        <Label2>
          {playlist.title}
        </Label2>
      </Block>
      <RenameList
        playlistItems={playlistItems} renamedTitles={renamedTitles} getNewTitle={getNewTitle}
        cameraViews={cameraViews} setCameraViews={setCameraViews} cameraInfo={cameraInfo}
      />
    </>
  )
}

export default RenameStep

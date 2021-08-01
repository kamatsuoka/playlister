import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React, { useState } from 'react'
import { Input } from 'baseui/input'
import { useStyletron } from 'baseui'
import { FormControl } from 'baseui/form-control'
import { Button, KIND, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { enqueueError, errorMessage } from '../util/enqueueError'
import { useSnackbar } from 'baseui/snackbar'
// import { KIND as NKind, Notification } from 'baseui/notification'
import { DEFAULT_DATE } from './EventDate'
import { Block } from 'baseui/block'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistCreate = ({
  eventData, orgInfo, cameraInfo,
  createdPlaylist, setCreatedPlaylist,
  resourceToPlaylist, uploadedFileIds,
  playlist, setPlaylist,
  playlistTitle, setPlaylistTitle
}) => {
  const [css, theme] = useStyletron()
  const [creating, setCreating] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const eventDate = eventData.dateChoice === DEFAULT_DATE ? eventData.defaultDate : eventData.customDate

  const titleParts = [orgInfo.orgName, eventDate, eventData.eventType, 'cam', cameraInfo.cameraNumber]
  const suggestedTitle = titleParts.filter(p => p).join(' ')

  const handleChange = (evt) => {
    setPlaylistTitle({
      ...playlistTitle,
      [evt.target.name]: evt.target.value
    })
  }

  const isValidTitle = () => {
    if (playlistTitle.titleChoice === SUGGESTED) {
      return suggestedTitle !== ''
    } else {
      return playlistTitle.customTitle !== ''
    }
  }

  /**
   * Success handler for creating/finding a playlist
   */
  const playlistSuccess = verb => plist => {
    if (plist.id) {
      const created = resourceToPlaylist(plist)
      setCreatedPlaylist(created)
      setPlaylist(created)
      enqueue({ message: `${verb} playlist: ${created.title}` })
      console.log(`${verb} playlist: `, created)
    } else {
      showError('Unexpected response: ' + JSON.stringify(plist))
    }
    setCreating(false)
  }

  /**
   * Failure handler for creating/finding playlist
   */
  const playlistFailure = verb => err => {
    setCreating(false)
    showError(`Error ${verb} playlist: ${errorMessage(err)}`)
  }

  const desiredTitle = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle

  /**
   * Checks for existing playlist with desired name.
   * If found, store it as the 'created' playlist.
   * If not, create a new playlist and store it.
   */
  function findOrCreatePlaylist () {
    setCreatedPlaylist({})
    setPlaylist({})
    setCreating(true)
    const title = desiredTitle
    const successHandler = plist => {
      if (plist) {
        return playlistSuccess('found')(plist)
      } else {
        return createPlaylist(title)
      }
    }
    try {
      return youtube.findPlaylist(title, successHandler, playlistFailure('finding'))
    } catch (e) {
      playlistFailure('finding')(e)
    }
  }

  function createPlaylist (title) {
    try {
      return youtube.insertPlaylist(title, playlistSuccess('created'), playlistFailure('creating')
      )
    } catch (e) {
      playlistFailure('creating')(e)
    }
  }

  const playlistWasCreated = () =>
    playlist.title && createdPlaylist.title === playlist.title &&
    playlist.title === desiredTitle

  const buttonOverrides = {
    Root: {
      style: ({ $theme }) => ({
        marginTop: $theme.sizing.scale300,
        marginRight: $theme.sizing.scale500
      })
    }
  }

  const radioOverrides = {
    Root: {
      style: ({ $theme }) => ({
        alignItems: 'start',
        marginRight: $theme.sizing.scale600
      })
    },
    RadioMarkOuter: {
      style: ({ $theme }) => ({
        marginTop: $theme.sizing.scale600
      })
    },
    Label: {
      style: ({ $theme }) => ({
        fontSize: $theme.typography.LabelSmall.fontSize
      })
    }
  }

  const inputOverrides = {
    Root: {
      style: ({
        minWidth: '250px'
      })
    }
  }

  const suggestedInputOverrides = {
    ...inputOverrides,
    Input: {
      props: {
        spellCheck: 'false'
      },
      style: ({
        caretColor: 'transparent'
      })
    }
  }
  return (
    <>
      <Block className={css({ alignItems: 'start', display: 'flex', marginTop: theme.sizing.scale200 })}>
        <Button
          onClick={() => findOrCreatePlaylist()}
          size={SIZE.small}
          kind={playlistWasCreated() ? KIND.secondary : KIND.primary}
          isLoading={creating}
          disabled={uploadedFileIds.size === 0 || !isValidTitle()}
          overrides={buttonOverrides}
          style={{ float: 'left' }}
        >
          Create
        </Button>
        <RadioGroup
          value={playlistTitle.titleChoice}
          name='titleChoice'
          onChange={handleChange}
          align={ALIGN.horizontal}
        >
          <Radio value={SUGGESTED} overrides={radioOverrides}>
            <FormControl caption='suggested'>
              <Input
                value={suggestedTitle}
                readOnly
                overrides={suggestedInputOverrides}
              />
            </FormControl>
          </Radio>
          <Radio value={CUSTOM} overrides={radioOverrides}>
            <FormControl caption='custom'>
              <Input
                value={playlistTitle.customTitle || ''}
                placeholder='custom title'
                name='customTitle'
                onChange={handleChange}
                onFocus={() => setPlaylistTitle({ ...playlistTitle, titleChoice: CUSTOM })}
                overrides={inputOverrides}
              />
            </FormControl>
          </Radio>
        </RadioGroup>
      </Block>
    </>
  )
}

export default PlaylistCreate
export { SUGGESTED, CUSTOM }

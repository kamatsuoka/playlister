import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React, { useState } from 'react'
import { Input } from 'baseui/input'
import { useStyletron } from 'baseui'
import { FormControl } from 'baseui/form-control'
import { Button, KIND, SIZE } from 'baseui/button'
import * as youtube from '../youtube/api'
import { errorMessage, showError } from '../util/showError'
import { useSnackbar } from 'baseui/snackbar'
// import { KIND as NKind, Notification } from 'baseui/notification'
import { DEFAULT_DATE } from './EventDate'
import { Block } from 'baseui/block'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistCreate = ({
  eventData, orgInfo, cameraInfo,
  createdPlaylist, setCreatedPlaylist,
  playlistResource, uploadedFileIds,
  playlistData, setPlaylistData,
  playlistTitle, setPlaylistTitle
}) => {
  const [css, theme] = useStyletron()
  const [creating, setCreating] = useState(false)
  const { enqueue } = useSnackbar()

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
   * Success handler for creating a playlist
   */
  const playlistSuccess = playlist => {
    if (playlist.id) {
      const created = playlistResource(playlist)
      setCreatedPlaylist(created)
      setPlaylistData(created)
      enqueue({ message: `created playlist: ${created.title}` })
      console.log('created: ', created)
    } else {
      showError(enqueue, 'Unexpected response: ' + JSON.stringify(playlist))
    }
    setCreating(false)
  }

  /**
   * Failure handler for creating playlist
   */
  const playlistFailure = err => {
    setCreating(false)
    showError(enqueue, `Error creating playlist: ${errorMessage(err)}`)
  }

  const desiredTitle = playlistTitle.titleChoice === CUSTOM ? playlistTitle.customTitle : suggestedTitle

  function createPlaylist () {
    setCreatedPlaylist({})
    setPlaylistData({})
    setCreating(true)
    try {
      youtube.insertPlaylist(
        desiredTitle,
        eventDate,
        playlistSuccess,
        playlistFailure
      )
    } catch (e) {
      playlistFailure(e)
    }
  }

  const playlistWasCreated = () =>
    playlistData.title && createdPlaylist.title === playlistData.title &&
    playlistData.title === desiredTitle

  const notifOverrides = {
    Body: {
      style: ({
        width: 'fit-content',
        alignItems: 'center'
      })
    }
  }

/*
  const showCreateStatus = () => {
    if (playlistTitle.tabIndex === 0 && playlistWasCreated()) {
      return (
        <Notification kind={NKind.positive} overrides={notifOverrides}>
          Playlist created: {createdPlaylist.title}
        </Notification>
      )
    }
    return null
  }
*/

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
      style: ({ $theme }) => ({
        minWidth: '250px' // $theme.sizing.scale4800
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
          onClick={() => createPlaylist()}
          size={SIZE.small}
          kind={playlistWasCreated() ? KIND.secondary : KIND.primary}
          isLoading={creating}
          disabled={uploadedFileIds.length === 0 || !isValidTitle()}
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

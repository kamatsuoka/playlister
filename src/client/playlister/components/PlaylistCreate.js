import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import React, { useState } from 'react'
import { Input } from 'baseui/input'
import { useStyletron } from 'baseui'
import { FormControl } from 'baseui/form-control'
import * as youtube from '../api/youtube/youtube-client'
import { enqueueError, errorMessage } from '../util/enqueueError'
import { useSnackbar } from 'baseui/snackbar'
import { Block } from 'baseui/block'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import ActionButton from './ActionButton'
import { getChosenDate } from '../models/dates'

const SUGGESTED = 'suggested'
const CUSTOM = 'custom'

const PlaylistCreate = ({
  eventData, orgInfo, cameraInfo, createdPlaylist,
  setCreatedPlaylist, resourceToPlaylist, uploadedFileIds,
  setPlaylist, playlistTitle, setPlaylistTitle
}) => {
  const [css, theme] = useStyletron()
  const [creating, setCreating] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const eventDate = getChosenDate(eventData)

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
      enqueue({ message: `${verb} playlist: ${created.title}` })
      setCreatedPlaylist(created)
      setPlaylist(created)
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

  const radioOverrides = {
    Root: {
      style: ({ $theme }) => ({
        alignItems: 'start',
        marginRight: $theme.sizing.scale600,
        marginBottom: 0
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
  const formControlOverrides = {
    ControlContainer: { style: ({ marginBottom: 0 }) },
    Caption: { style: ({ marginBottom: 0 }) }
  }
  return (
    <>
      <Block className={css({ alignItems: 'start', display: 'flex', marginTop: theme.sizing.scale200 })}>
        <ActionButton
          onClick={findOrCreatePlaylist}
          disabled={uploadedFileIds.size === 0 || !isValidTitle()}
          grayed={Object.keys(createdPlaylist).length > 0 && createdPlaylist.title === desiredTitle}
          title='create playlist' icon={faPlus} spin={creating}
          style={{ float: 'left', marginTop: theme.sizing.scale500, marginRight: theme.sizing.scale500 }}
        />
        <RadioGroup
          value={playlistTitle.titleChoice}
          name='titleChoice'
          onChange={handleChange}
          align={ALIGN.horizontal}
        >
          <Radio value={SUGGESTED} overrides={radioOverrides}>
            <FormControl caption='suggested' overrides={formControlOverrides}>
              <Input
                value={suggestedTitle}
                readOnly
                onFocus={() => setPlaylistTitle(values => ({ ...values, titleChoice: SUGGESTED }))}
                positive={playlistTitle.titleChoice === SUGGESTED && createdPlaylist.title === suggestedTitle}
                overrides={suggestedInputOverrides}
              />
            </FormControl>
          </Radio>
          <Radio value={CUSTOM} overrides={radioOverrides}>
            <FormControl caption='custom' overrides={formControlOverrides}>
              <Input
                value={playlistTitle.customTitle || ''}
                placeholder='custom title'
                name='customTitle'
                onChange={handleChange}
                onFocus={() => setPlaylistTitle(values => ({ ...values, titleChoice: CUSTOM }))}
                positive={playlistTitle.titleChoice === CUSTOM && createdPlaylist.title === playlistTitle.customTitle}
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

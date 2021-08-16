import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import { Select } from 'baseui/select'
import React from 'react'
import { useStyletron } from 'baseui'
import { Block } from 'baseui/block'
import ActionButton from './ActionButton'

const PlaylistSelect = ({
  playlists, selectedPlaylist, setSelectedPlaylist,
  setPlaylist, listPlaylists, listing
}) => {
  const [css, theme] = useStyletron()
  const syncButtonOverrides = {
    Root: {
      style: ({ $theme }) => ({
        paddingLeft: $theme.sizing.scale200,
        paddingRight: $theme.sizing.scale200
      })
    }
  }

  return (
    <Block className={css({ alignItems: 'center', display: 'flex', marginTop: theme.sizing.scale200 })}>
      <ActionButton
        onClick={listPlaylists}
        overrides={syncButtonOverrides}
        style={{ verticalAlign: 'middle', marginRight: theme.sizing.scale600 }}
        icon={faSyncAlt} spin={listing}
      />
      <Select
        value={selectedPlaylist}
        onChange={({ value }) => {
          console.log('in recent playlists onChange: value = ', value)
          setSelectedPlaylist(value)
          // recall that selected value is actually an array (baseui...)
          setPlaylist(value[0])
        }}
        options={playlists}
        valueKey='playlistId'
        labelKey='title'
        clearable={false}
        backspaceRemoves={false}
        deleteRemoves={false}
        overrides={{
          Root: {
            style: ({ $theme }) => ({
              width: 'fit-contents',
              minWidth: `calc(3 * ${$theme.sizing.scale4800})`
            })
          },
          Input: {
            style: ({
              caretColor: 'transparent'
            })
          }
        }}
      />
    </Block>
  )
}

export default PlaylistSelect

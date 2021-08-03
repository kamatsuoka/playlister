import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Button, KIND, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { Select } from 'baseui/select'
import React from 'react'

const PlaylistSelect = ({
  playlists, selectedPlaylist, setSelectedPlaylist,
  setPlaylist, listPlaylists, listing
}) => {
  const syncButtonOverrides = {
    Root: {
      style: ({ $theme }) => ({
        paddingLeft: $theme.sizing.scale200,
        paddingRight: $theme.sizing.scale200
      })
    }
  }

  const itemProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const wideItemProps = {
    ...itemProps,
    overrides: {
      Block: {
        style: ({ $theme }) => ({
          width: `calc((150% - ${$theme.sizing.scale800}) / 4)`
        })
      }
    }
  }

  return (
    <FlexGrid
      flexGridColumnCount={2}
      flexGridColumnGap='scale100'
      flexGridRowGap='scale800'
      marginTop='scale600'
      marginBottom='scale600'
    >
      <FlexGridItem {...itemProps} style={{ flexGrow: 0, flexShrink: 1, flexBasis: '0%' }}>
        <Button
          onClick={listPlaylists}
          size={SIZE.small}
          kind={KIND.minimal}
          overrides={syncButtonOverrides}
          style={{ verticalAlign: 'middle' }}
        >
          <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} size='lg' spin={listing} />
        </Button>
      </FlexGridItem>
      <FlexGridItem {...wideItemProps}>
        <Select
          value={selectedPlaylist}
          onChange={({ value }) => {
            console.log('in recent playlists onChange: value = ', value)
            setSelectedPlaylist(value)
            // recall that selected value is actually an array (baseui...)
            setPlaylist(value[0])
          }}
          isLoading={listing}
          options={playlists}
          valueKey='playlistId'
          labelKey='title'
          clearable={false}
          backspaceRemoves={false}
          deleteRemoves={false}
          overrides={{
            Input: {
              style: ({
                caretColor: 'transparent'
              })
            }
          }}
        />
      </FlexGridItem>
    </FlexGrid>
  )
}

export default PlaylistSelect

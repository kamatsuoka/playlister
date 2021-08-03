import React, { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { Input } from 'baseui/input'
import { Button, KIND, SIZE } from 'baseui/button'
import { updateTitle } from '../youtube/api'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { getChosenDate } from './EventDate'
import { FormControl } from 'baseui/form-control'
import { Combobox } from 'baseui/combobox'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of videos with old and new titles
 */
const VideoList = ({ playlistItems, orgInfo, cameraInfo, eventData }) => {
  const [defaultCameraView, setDefaultCameraView] = useState('director')
  const [cameraViews, setCameraViews] = useState({})
  const [renaming, setRenaming] = useState(new Set())
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const date = getChosenDate(eventData)
  const pad = (n) => n < 10 ? `0${n}` : `${n}`

  const getNewTitle = (row, index) => {
    const cameraView = cameraViews[row.videoId] || defaultCameraView
    return `${orgInfo.orgName} ${date} ${cameraView} c${cameraInfo.cameraNumber}.${pad(index)}`
  }

  const tableCellStyles = $theme => ({
    verticalAlign: 'center',
    paddingLeft: $theme.sizing.scale200,
    paddingRight: $theme.sizing.scale200,
    paddingTop: $theme.sizing.scale400,
    paddingBottom: $theme.sizing.scale400
  })

  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => {
        return tableCellStyles($theme)
      }
    }
  }

  const renamedColumnOverrides = {
    TableBodyCell: {
      style: ({
        textAlign: 'center'
      })
    }
  }

  const allRenamed = uploads.every((video, index) => video.newTitle === getNewTitle(video, index))

  const renameVideo = (video, newTitle) => {
    const onSuccess = updatedItems => {
      setRenaming(false)
      return setUploads(
        uploads.map(upload => {
          if (upload.videoId === updatedVideo.videoId) {
            upload.newTitle = updatedVideo.title
          }
          return upload
        }))
    }
    const onFailure = err => {
      setRenaming(false)
      showError(err)
    }
    try {
      updateTitle(video.videoId, newTitle, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }

  const renameVideos = () => {
    setRenaming(true)
    const newTitles = Object.entries(playlistItems).map((videoId, ))
    playlistItems.forEach((video, index) => {
      const newTitle = getNewTitle(video, index)
      if (video.title !== newTitle) {
        renameVideo(video, newTitle)
      }
    })
  }

  return (
    <>
      <FormControl label='default camera view'>
        <Combobox
          value={defaultCameraView}
          name='cameraView'
          options={['chorus', 'corner', 'director', 'elevated']}
          mapOptionToString={option => option}
          onChange={setDefaultCameraView}
        />
      </FormControl>
      <TableBuilder data={playlistItems}>
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Original Title'>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Camera View'>
          {row =>
            <Input
              value={cameraViews[row.videoId] || defaultCameraView}
              name='cameraView'
              onChange={evt => setCameraViews({
                ...cameraViews,
                [row.videoId]: evt.target.value
              })}
            />}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='New Title'>
          {(row, index) => getNewTitle(row, index)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={{ ...columnOverrides, ...renamedColumnOverrides }} header='Renamed'>
          {(row, index) => {
            if (row.newTitle === getNewTitle(row, index)) {
              return <FontAwesomeIcon icon={faCheck} />
            } else {
              return null
            }
          }}
        </TableBuilderColumn>
      </TableBuilder>
      <Button
        onClick={() => renameVideos()}
        size={SIZE.compact}
        kind={uploads.length && !allRenamed ? KIND.primary : KIND.secondary}
        isLoading={renaming.size !== 0}
        disabled={uploads.length === 0}
        overrides={{
          Root: { style: ({ $theme }) => ({ marginBottom: $theme.sizing.scale600 }) }
        }}
      >
        Rename Videos
      </Button>
    </>
  )
}

export default VideoList

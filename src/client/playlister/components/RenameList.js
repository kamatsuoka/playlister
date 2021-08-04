import React from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Combobox } from 'baseui/combobox'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of videos with old and new titles
 */
const RenameList = ({
  playlistItems, newTitles, cameraViews, setCameraViews,
  getNewTitle, defaultCameraView
}) => {
  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => ({
        verticalAlign: 'center',
        paddingTop: $theme.sizing.scale200,
        paddingBottom: $theme.sizing.scale200
      })
    }
  }

  const cameraViewColumnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => ({
        ...columnOverrides.TableBodyCell.style({ $theme }),
        width: $theme.sizing.scale3200,
        paddingRight: $theme.sizing.scale800
      })
    }
  }

  return (
    <>
      <TableBuilder data={Object.values(playlistItems).sort((a, b) => a.position - b.position)}>
        <TableBuilderColumn overrides={columnOverrides} header='Original Title'>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={cameraViewColumnOverrides} header='Camera View'>
          {row =>
            <Combobox
              value={cameraViews[row.videoId] || defaultCameraView}
              name='cameraView'
              options={['chorus', 'corner', 'director', 'elevated']}
              mapOptionToString={option => option}
              onChange={value => setCameraViews({ ...cameraViews, [row.videoId]: value })}
            />}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='New Title'>
          {(row, index) => getNewTitle(row.videoId, index)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header=''>
          {(row, index) => newTitles[row.videoId] === getNewTitle(row.videoId, index)
            ? <FontAwesomeIcon icon={faCheck} />
            : null}
        </TableBuilderColumn>
      </TableBuilder>
      \
    </>
  )
}

export default RenameList

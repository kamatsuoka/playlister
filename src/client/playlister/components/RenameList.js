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
  playlistItems, renamedTitles, cameraViews, setCameraViews, getNewTitle, defaultCameraView
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

  const hasIntendedTitle = (row, index) => {
    const intendedTitle = getNewTitle(row.videoId, index)
    console.log(`in rename list row ${index}, intended title = ${intendedTitle}`)
    if (row.title === intendedTitle) {
      console.log(`video ${row.title} already had intended title`)
      return true
    }
    if (renamedTitles[row.videoId]) {
      const renamedTitle = renamedTitles[row.videoId].title
      if (renamedTitle === intendedTitle) {
        console.log(`video ${row.title} was renamed to match intended title`)
        return true
      } else {
        console.log(`video ${row.title} was renamed but does NOT match intended title!!!`)
      }
    } else {
      console.log(`video ${row.title} has not been renamed`)
    }
    return false
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
          {(row, index) => hasIntendedTitle(row, index) ? <FontAwesomeIcon icon={faCheck} /> : null}
        </TableBuilderColumn>
      </TableBuilder>
    </>
  )
}

export default RenameList

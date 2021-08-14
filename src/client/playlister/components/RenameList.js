import React from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { Combobox } from 'baseui/combobox'
import GreenCheckMark from './GreenCheckMark'

dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

/**
 * List of videos with old and new titles
 */
const RenameList = ({
  playlistItems, renamedTitles, getNewTitle,
  cameraViews, setCameraViews, cameraInfo
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
    if (row.title === intendedTitle) {
      return true
    }
    return renamedTitles[row.videoId] === intendedTitle
  }

  return (
    <>
      <TableBuilder data={Object.values(playlistItems).sort((a, b) => a.position - b.position)}>
        <TableBuilderColumn overrides={columnOverrides} header=''>
          {(row, index) => hasIntendedTitle(row, index) ? <GreenCheckMark /> : null}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Original Title'>
          {row => row.title}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={cameraViewColumnOverrides} header='Camera View'>
          {row =>
            <Combobox
              value={cameraViews[row.videoId] || cameraInfo.defaultCameraView}
              name='cameraView'
              options={['chorus', 'corner', 'director', 'elevated']}
              mapOptionToString={option => option}
              onChange={value => setCameraViews({ ...cameraViews, [row.videoId]: value })}
              overrides={{
                Input: {
                  props: {
                    overrides: {
                      Input: {
                        style: ({ $theme }) => ({
                          paddingTop: $theme.sizing.scale200,
                          paddingBottom: $theme.sizing.scale200
                        })
                      }
                    }
                  }
                }
              }}
            />}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='New Title'>
          {(row, index) => getNewTitle(row.videoId, index)}
        </TableBuilderColumn>
      </TableBuilder>
    </>
  )
}

export default RenameList

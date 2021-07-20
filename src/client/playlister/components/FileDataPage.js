import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import FileDataList from './FileDataList'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import MediaReader from './MediaReader'
import { BaseCard } from './BaseCard'
import { KIND as NKind, Notification } from 'baseui/notification'
import { Paragraph3 } from 'baseui/typography'
import { StyledTable, StyledTableBody, StyledTableBodyCell, StyledTableBodyRow } from 'baseui/table-semantic'
import { withStyle } from 'styletron-react'
import { useStyletron } from 'baseui'

const TableCell = withStyle(StyledTableBodyCell, ({ $theme }) => ({
  paddingTop: $theme.sizing.scale200,
  paddingRight: $theme.sizing.scale200,
  paddingBottom: $theme.sizing.scale200,
  paddingLeft: $theme.sizing.scale200
}))

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const FileDataPage = ({
  mediaList, setMediaList,
  fileDataList, setFileDataList,
  timeAdjust, setTimeAdjust, prevNextButtons
}) => {
  /**
   * fileDataList items:
   * - fileId
   * - name
   * - startTime
   * - duration
   * - endTime
   */
  const [mediaErrors, setMediaErrors] = useState([])
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)
  const [css, theme] = useStyletron()
  const handleChange = (evt) => {
    setTimeAdjust({
      ...timeAdjust,
      [evt.target.name]: parseInt(evt.target.value)
    })
  }

  const timeOffset = (name, max, width = theme.sizing.scale2400) => {
    return (
      <div className={css({ float: 'left', paddingRight: theme.sizing.scale200 })}>
        <FormControl label={name}>
          <Input
            value={timeAdjust[name] || 0}
            type="number"
            min={-max}
            max={max}
            name={name}
            onChange={handleChange}
            overrides={{
              Root: {
                style: ({
                  width: width,
                  height: theme.sizing.scale1000
                })
              }
            }}
          />
        </FormControl>
      </div>
    )
  }

  function filesAndOffset () {
    return (
      <>
        <Paragraph3>
          Take a look at the start and end times and make sure they match
          what you expect. <br /> If they need adjusting, you can use the settings below.
        </Paragraph3>
        <FileDataList
          mediaList={mediaList} setMediaList={setMediaList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          fileDataList={fileDataList} setFileDataList={setFileDataList}
        />
        <BaseCard title=''>
          <StyledTable>
            <StyledTableBody>
              <StyledTableBodyRow>
                <TableCell style={{ verticalAlign: 'middle' }}>
                  Time Zone
                </TableCell>
                <TableCell colSpan={3}>
                  <TimezoneOverride mediaList={mediaList} value={overrideTimeZone} setValue={setOverrideTimeZone} />
                </TableCell>
              </StyledTableBodyRow>
              <StyledTableBodyRow>
                <TableCell style={{ verticalAlign: 'middle' }}>
                  Offsets
                </TableCell>
                <TableCell colSpan={3} style={{ display: 'inline-block' }}>
                  {timeOffset('year', 2000, theme.sizing.scale3200)}
                  {timeOffset('month', 11)}
                  {timeOffset('day', 30)}
                  {timeOffset('hour', 23)}
                  {timeOffset('minute', 59)}
                  {timeOffset('second', 59)}
                </TableCell>
              </StyledTableBodyRow>
            </StyledTableBody>
          </StyledTable>
        </BaseCard>
      </>
    )
  }

  const errorTable = () => {
    if (mediaErrors.length > 0) {
      return (
        <>
          <Notification kind={NKind.negative} closeable overrides={{ Body: { style: { width: 'auto' } } }}>
            <ul>
              {mediaErrors.map((e, i) => <li key={i}>{e.filename}: invalid media file</li>)}
            </ul>
          </Notification>
        </>
      )
    } else {
      return null
    }
  }

  return (
    <>
      <MediaReader setMediaList={setMediaList} setMediaErrors={setMediaErrors} />
      {errorTable()}
      {mediaList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons}
    </>
  )
}

export default FileDataPage

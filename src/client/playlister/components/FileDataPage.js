import React, { useState } from 'react'
import TimezoneOverride from './TimezoneOverride'
import FileDataList from './FileDataList'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import MediaReader from './MediaReader'
import { StyledTable, StyledTableBody, StyledTableBodyCell, StyledTableBodyRow } from 'baseui/table-semantic'
import { withStyle } from 'styletron-react'
import { useStyletron } from 'baseui'
import { Modal } from 'baseui/modal'
import { Accordion, StatefulPanel } from 'baseui/accordion'

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
   * - file
   */
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)
  const [css, theme] = useStyletron()
  const handleChange = (evt) => {
    setTimeAdjust({
      ...timeAdjust,
      [evt.target.name]: parseInt(evt.target.value)
    })
  }

  const [previewUrl, setPreviewUrl] = React.useState(null)
  function closePreview () {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  /**
   * Shows a video centered on the screen. Use a transparent Modal to
   * provide standard close behavior (click outside or press escape).
   */
  const videoPreview = () => (
    <Modal
      onClose={closePreview}
      isOpen={previewUrl != null}
      overrides={{
        Dialog: { style: { backgroundColor: 'transparent' } },
        Close: { style: ({ display: 'none' }) }
      }}
    >
      <video
        autoPlay controls style={{
          maxWidth: '80vh',
          maxHeight: '80vh',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <source src={previewUrl} />
      </video>
    </Modal>
  )

  const timeOffset = (name, max, width = theme.sizing.scale1600) => {
    return (
      <div className={css({ float: 'left', paddingRight: theme.sizing.scale200 })}>
        <FormControl label={name}>
          <Input
            value={timeAdjust[name] || 0}
            type='number'
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
              },
              Input: {
                style: ({
                  paddingLeft: theme.sizing.scale200,
                  paddingRight: theme.sizing.scale200
                })
              }
            }}
          />
        </FormControl>
      </div>
    )
  }

  function filesAndOffset () {
    // panel expander icon is placed to the left of the title by shifting the title
    const timestampAdjustmentTitle = <span style={{ paddingLeft: theme.sizing.scale600 }}>Timestamp Adjustments </span>
    return (
      <>
        <FileDataList
          mediaList={mediaList} setMediaList={setMediaList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          fileDataList={fileDataList} setFileDataList={setFileDataList}
          setPreviewUrl={setPreviewUrl}
        />
        <Accordion>
          <StatefulPanel
            title={timestampAdjustmentTitle}
            overrides={{
              Content: {
                style: ({ $theme }) => ({
                  paddingBottom: $theme.sizing.scale400,
                  marginBottom: $theme.sizing.scale800
                })
              },
              PanelContainer: {
                style: ({
                  borderBottomWidth: 0
                })
              },
              ToggleIcon: {
                style: ({
                  position: 'absolute' // moves icon all the way to the left of its div
                })
              }
            }}
          >
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
                    Offset
                  </TableCell>
                  <TableCell colSpan={3} style={{ display: 'inline-block' }}>
                    {timeOffset('year', 2000, theme.sizing.scale2400)}
                    {timeOffset('month', 11)}
                    {timeOffset('day', 30)}
                    {timeOffset('hour', 23)}
                    {timeOffset('minute', 59)}
                    {timeOffset('second', 59)}
                  </TableCell>
                </StyledTableBodyRow>
              </StyledTableBody>
            </StyledTable>
          </StatefulPanel>
        </Accordion>
      </>
    )
  }

  return (
    <>
      <MediaReader setMediaList={setMediaList} />
      {videoPreview()}
      {mediaList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons}
    </>
  )
}

export default FileDataPage

import React from 'react'
import TimezoneOverride from './TimezoneOverride'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { StyledTable, StyledTableBody, StyledTableBodyCell, StyledTableBodyRow } from 'baseui/table-semantic'
import { withStyle } from 'styletron-react'
import { useStyletron } from 'baseui'
import { Accordion, StatefulPanel } from 'baseui/accordion'
import EventDate from './EventDate'

const TableCell = withStyle(StyledTableBodyCell, ({ $theme }) => ({
  paddingTop: $theme.sizing.scale200,
  paddingRight: $theme.sizing.scale200,
  paddingBottom: $theme.sizing.scale200,
  paddingLeft: $theme.sizing.scale200
}))

/**
 * Adjust time on file metadata in case camera has time set incorrectly
 */
const TimeOffset = ({
  mediaList,
  timeAdjust, setTimeAdjust,
  overrideTimeZone, setOverrideTimeZone,
  eventData, setEventData
}) => {
  const [css, theme] = useStyletron()
  const handleChange = (evt) => {
    setTimeAdjust({
      ...timeAdjust,
      [evt.target.name]: parseInt(evt.target.value)
    })
  }

  /**
   * Builds a number input for a time offset
   *
   * @param name year, month, etc
   * @param max max (absolute) value
   * @param width width of root of input element
   */
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

  const timestampAdjustmentTitle = <span style={{ paddingLeft: theme.sizing.scale600 }}>Time Adjustments </span>

  // panel expander icon is placed to the left of the title by shifting the title
  return (
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
            <StyledTableBodyRow>
              <TableCell style={{ verticalAlign: 'middle' }}>
                Event Date
              </TableCell>
              <TableCell colSpan={3} style={{ display: 'inline-block' }}>
                <EventDate eventData={eventData} setEventData={setEventData} />
              </TableCell>
            </StyledTableBodyRow>
          </StyledTableBody>
        </StyledTable>
      </StatefulPanel>
    </Accordion>
  )
}

export default TimeOffset

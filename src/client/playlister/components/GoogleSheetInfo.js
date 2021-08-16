import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import React, { useCallback, useContext, useState } from 'react'
import ActionButton from './ActionButton'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { copyData, usePersist } from '../hooks/usePersist'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import Tooltip from './Tooltip'
import { useStyletron } from 'baseui'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { Label2 } from 'baseui/typography'
import { Block } from 'baseui/block'

const GoogleSheetInfo = ({ spreadsheetInfo, setSpreadsheetInfo, tail, setTail, baseUrl, tailed, setTailed }) => {
  const [, theme] = useStyletron()
  const [tailing, setTailing] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const { password } = useContext(PasswordContext)

  const handleChange = evt => {
    const value = evt.target.value
    setSpreadsheetInfo(values => ({
      ...values,
      [evt.target.name]: value
    }))
    setTailed(false)
  }

  const SPREADSHEET_DATA_KEY = 'spreadsheet_info'
  usePersist({
    key: SPREADSHEET_DATA_KEY,
    onRestore: copyData,
    setState: setSpreadsheetInfo,
    state: spreadsheetInfo
  })

  const sheetIdsOkay = () => spreadsheetInfo.spreadsheetId && spreadsheetInfo.spreadsheetId.length > 40 &&
    spreadsheetInfo.sheetName && spreadsheetInfo.sheetName.length > 1

  /**
   * Gets the last few rows of the spreadsheet,
   * with first row prepended as header
   */
  const getTail = useCallback(rowCount => {
    setTail([])
    setTailing(true)
    setTailed(false)
    const onSuccess = tailRows => {
      console.log('got tail of sheet:', tailRows)
      setTailed(true)
      setTailing(false)
      return setTail(tailRows)
    }
    const onFailure = e => {
      setTailed(false)
      setTailing(false)
      showError(e)
    }
    try {
      const sheetName = spreadsheetInfo.sheetName
      const quotedSheetName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName
      const range = `${quotedSheetName}!A1:J1`
      return callServer('tailSheet', onSuccess, onFailure, {
        password,
        spreadsheetId: spreadsheetInfo.spreadsheetId,
        range,
        rowCount,
        header: false
      })
    } catch (e) {
      showError(e)
    }
  }, [setTail, setTailed, showError, spreadsheetInfo.sheetName, spreadsheetInfo.spreadsheetId, password])

  const itemProps = {
    display: 'flex',
    // alignItems: 'center',
    justifyContent: 'center'
  }

  const itemWidthProps = blockStyle => ({
    ...itemProps,
    overrides: {
      Block: {
        style: ({
          flexGrow: 0,
          ...blockStyle
        })
      }
    }
  })

  const showTail = () => {
    const tableData = tail.length >= 3 ? [['...']].concat(tail) : tail
    const overrides = {
      ...tableOverrides,
      Table: {
        style: ({
          border: `2px solid ${theme.colors.borderPositive}`
        })
      },
      TableHeadRow: {
        style: ({ display: 'none' })
      }
    }
    return (
      <>
        <Label2>Sheet found</Label2>
        <Block style={{
          marginTop: theme.sizing.scale800,
          marginLeft: theme.sizing.scale800,
          marginBottom: theme.sizing.scale800
        }}
        >
          <TableBuilder
            data={tableData} overrides={overrides}
            emptyMessage='You have access to the sheet but it seems to be empty!'
          >
            {[...Array(8).keys()].map(i =>
              <TableBuilderColumn header='' key={`column${i}`}>
                {row =>
                  row[i] && row[i].startsWith(baseUrl)
                    ? (
                      <StyledLink href={row[i]} target='_blank' rel='noopener noreferrer'>
                        youtube link
                      </StyledLink>
                      )
                    : row[i]}
              </TableBuilderColumn>
            )}
          </TableBuilder>
        </Block>
      </>
    )
  }

  const tooltip = (
    <>
      The spreadsheet id is found in the url path.
      <p />
      The url typically looks like
      https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit#gid=...
    </>
  )

  const spreadsheetIdCaption = <Tooltip tooltip={tooltip}>spreadsheet id</Tooltip>

  return (
    <>
      <FlexGrid
        flexGridColumnCount={3}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem {...itemProps} style={{ flexGrow: 0, flexShrink: 1, flexBasis: '0%', marginTop: theme.sizing.scale200 }}>
          <ActionButton
            onClick={() => getTail(3)} disabled={!sheetIdsOkay()}
            grayed={tailed} icon={faSearch} spin={tailing}
            title={sheetIdsOkay()
              ? 'find sheet and show recent rows'
              : 'please enter valid google spreadsheet id and sheet name'}
          />
        </FlexGridItem>
        <FlexGridItem {...itemProps}>
          <FormControl caption={spreadsheetIdCaption}>
            <Input
              value={spreadsheetInfo.spreadsheetId || ''}
              name='spreadsheetId'
              placeholder='long alphanumeric id'
              overrides={{ Input: { props: { spellCheck: 'false' } } }}
              onChange={handleChange}
              positive={tailed}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemWidthProps({ width: '30%' })}>
          <FormControl caption='sheet name'>
            <Input
              value={spreadsheetInfo.sheetName || ''}
              name='sheetName'
              placeholder='sheet name from tab'
              onChange={handleChange}
              positive={tailed}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
      {tailed ? showTail() : null}
    </>
  )
}

export default GoogleSheetInfo

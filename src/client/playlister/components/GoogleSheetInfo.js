import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import React, { useCallback, useState } from 'react'
import { useStyletron } from 'baseui'
import { Heading } from 'baseui/heading'
import ActionButton from './ActionButton'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import * as sheets from '../api/sheets/sheets-client'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import { copyData, usePersist } from '../hooks/usePersist'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { tableOverrides } from './TableOverrides'
import { StyledLink } from 'baseui/link'
import Tooltip from './Tooltip'
import { Label2 } from 'baseui/typography'

const GoogleSheetInfo = ({ spreadsheetInfo, setSpreadsheetInfo, tail, setTail, baseUrl }) => {
  const [, theme] = useStyletron()
  const [tailing, setTailing] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const handleChange = evt => {
    const value = evt.target.value
    setSpreadsheetInfo(values => ({
      ...values,
      [evt.target.name]: value
    }))
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
    const onSuccess = tailRows => {
      console.log('got tail of sheet:', tailRows)
      setTailing(false)
      return setTail(tailRows)
    }
    const onError = e => {
      setTailing(false)
      showError(e)
    }
    try {
      const sheetName = spreadsheetInfo.sheetName
      const quotedSheetName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName
      const range = `${quotedSheetName}!A1:J1`
      return sheets.tailSheet({
        spreadsheetId: spreadsheetInfo.spreadsheetId,
        range,
        rowCount,
        header: false,
        onSuccess,
        onError
      })
    } catch (e) {
      showError(e)
    }
  }, [spreadsheetInfo.spreadsheetId, spreadsheetInfo.sheetName, showError, setTail])

  const itemProps = {
    display: 'flex',
    alignItems: 'center',
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

  const showTail = () => (
    <>
      <Label2 style={{ textDecoration: 'underline' }}>Recent Rows</Label2>
      <TableBuilder data={tail} overrides={tableOverrides}>
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
    </>
  )

  const tooltip = (
    <>
      The Google Sheets spreadsheet id is found in the url path.
      <br />
      The url typically looks like
      https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit#gid=...
      <br />
    </>
  )

  return (
    <>
      <Heading styleLevel={5}><Tooltip tooltip={tooltip}>Google Sheet</Tooltip>{' '}
        <ActionButton
          onClick={() => getTail(3)} disabled={!sheetIdsOkay()} icon={faSearch} spin={tailing}
          title={sheetIdsOkay()
            ? 'find sheet and show recent rows'
            : 'please enter valid google spreadsheet id and sheet name'}
        />
      </Heading>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        <FlexGridItem {...itemProps}>
          <FormControl caption='spreadsheet id'>
            <Input
              value={spreadsheetInfo.spreadsheetId || ''}
              name='spreadsheetId'
              placeholder='long alphanumeric in url path like 1BTxLr0...'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem {...itemWidthProps({ width: '35%' })}>
          <FormControl caption='sheet name'>
            <Input
              value={spreadsheetInfo.sheetName || ''}
              name='sheetName'
              placeholder='sheet name from tab'
              onChange={handleChange}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
      {tail[0] ? showTail() : null}
    </>
  )
}

export default GoogleSheetInfo

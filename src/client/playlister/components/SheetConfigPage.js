/**
 * Configure google sheet that holds video metadata
 */
import React from 'react'
import { copyData, usePersist } from '../hooks/usePersist'
import PrevNextButtons from './PrevNextButtons'
import GoogleSheetInfo from './GoogleSheetInfo'
import { Heading } from 'baseui/heading'
import Tooltip from './Tooltip'

export const BASE_SHEETS_URL = 'https://www.youtube.com/'

const SheetConfigPage = ({
  current, setCurrent, spreadsheetInfo, setSpreadsheetInfo, tail, setTail, tailed, setTailed
}) => {
  const SPREADSHEET_DATA_KEY = 'spreadsheet_info'
  usePersist({
    key: SPREADSHEET_DATA_KEY,
    onRestore: copyData,
    setState: setSpreadsheetInfo,
    state: spreadsheetInfo
  })

  const tooltipText = (
    <>
      This sheet will hold the video metadata. Before we go any further,
      enter the spreadsheet id and sheet name below.
      <p />
      When you click the search icon,
      you should see the last few rows of the sheet below.
    </>
  )

  return (
    <>
      <Heading styleLevel={5}><Tooltip tooltip={tooltipText}>Find Google Sheet</Tooltip></Heading>

      <GoogleSheetInfo
        spreadsheetInfo={spreadsheetInfo} setSpreadsheetInfo={setSpreadsheetInfo}
        tailed={tailed} setTailed={setTailed} tail={tail} setTail={setTail} baseUrl={BASE_SHEETS_URL}
      />
      <PrevNextButtons
        current={current} setCurrent={setCurrent}
        nextProps={{
          disabled: !tailed,
          title: tailed ? '' : 'click the search icon to verify your access to the google sheet'
        }}
      />
    </>
  )
}

export default SheetConfigPage

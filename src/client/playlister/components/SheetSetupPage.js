/**
 * Configure google sheet that holds video metadata
 */
import React, { useState } from 'react'
import { copyData, usePersist } from '../hooks/usePersist'
import PrevNextButtons from './PrevNextButtons'
import { ToasterContainer } from 'baseui/toast'
import GoogleSheetInfo from './GoogleSheetInfo'
import { Heading } from 'baseui/heading'
import Tooltip from './Tooltip'

export const BASE_SHEETS_URL = 'https://www.youtube.com/'

const SheetSetupPage = ({
  current, setCurrent, spreadsheetInfo, setSpreadsheetInfo, tailed, setTailed
}) => {
  const [tail, setTail] = useState([])

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
      <Heading styleLevel={5}><Tooltip tooltip={tooltipText}>Google Sheet</Tooltip></Heading>

      <GoogleSheetInfo
        spreadsheetInfo={spreadsheetInfo} setSpreadsheetInfo={setSpreadsheetInfo}
        tailed={tailed} setTailed={setTailed} tail={tail} setTail={setTail} baseUrl={BASE_SHEETS_URL}
      />
      <ToasterContainer>
        <PrevNextButtons
          current={current} setCurrent={setCurrent}
          nextProps={{
            disabled: !tailed,
            title: tailed ? '' : 'click the search icon to verify your access to the google sheet'
          }}
        />
      </ToasterContainer>
    </>
  )
}

export default SheetSetupPage

/**
 * Configure google sheet that holds video metadata
 */
import React, { useState } from 'react'
import { copyData, usePersist } from '../hooks/usePersist'
import PrevNextButtons from './PrevNextButtons'
import { ToasterContainer } from 'baseui/toast'
import GoogleSheetInfo from './GoogleSheetInfo'
import { Paragraph2 } from 'baseui/typography'
import { Heading } from 'baseui/heading'

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

  return (
    <>
      <Heading styleLevel={5}>Google Sheet</Heading>
      <Paragraph2>
        This sheet will hold the video metadata. Before we go any further,
        make sure you have access to it by clicking the search icon.
      </Paragraph2>

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

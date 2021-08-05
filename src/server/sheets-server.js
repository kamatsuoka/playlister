/**
 * Appends rows to a spreadsheet, starting at the first empty row
 *
 * @param spreadsheetId {string} id of spreadsheet
 * @param range {string} range to search for data in spreadsheet (typically e.g. sheetId!A1:C1),
 * after which rows will be appended
 * @param values {[[]]} array of rows, with each row an array of values
 * @return object with values
 * @see https://developers.google.com/sheets/api/guides/values#appending_values
 */
export const appendRows = (spreadsheetId, range, values) => {
  Logger.log(`sheets-server.appendRows: appending ${JSON.stringify(values)}`)
  const valueInputOption = 'USER_ENTERED'
  const valueRange = Sheets.newRowData()
  valueRange.values = values
  const appendRequest = Sheets.newAppendCellsRequest()
  appendRequest.sheetName = spreadsheetId
  appendRequest.rows = [valueRange]
  return Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range, { valueInputOption })
}

/**
 * Gets a range from a sheet
 *
 * @param spreadsheetId {string} id of spreadsheet
 * @param range {string} range to get
 * @return {[[]]} array of rows, with each row an array of values
 */
export const getRange = (spreadsheetId, range) => {
  Logger.log(`sheets-server.getRange: getting ${spreadsheetId} / ${range}`)
  return Sheets.Spreadsheets.Values.get(spreadsheetId, range).values
}

/**
 * Tails a sheet. Returns last `rowCount` rows, optionally prepended with
 * first row as header.
 *
 * Finds the last row by appending an empty list of rows to the table, which returns
 * the range appended. The `range` parameter specifies where to search for data.
 *
 * @param spreadsheetId {string} id of spreadsheet
 * @param range {string} range to search for data in spreadsheet (typically e.g. sheetId!A1:C1)
 * @param rowCount number of rows to return
 * @param header true to prepend with first row as header
 * @return {[[]]} array of rows, with each row an array of values
 */
export const tailSheet = ({ spreadsheetId, range, rowCount, header }) => {
  const appendResult = appendRows(spreadsheetId, range, [])
  Logger.log(`result of empty appendRows: ${appendResult}`)
  const appendRange = appendResult.updates.updatedRange
  Logger.log(`append range: ${appendRange}`)
  const lastCol = range.match(/([A-Z]+)[0-9]+$/)[1]
  const prefix = range.includes('!') ? range.split('!')[0] + '!' : ''

  const getHeadRows = () => {
    const headRange = `${prefix}A1:${lastCol}1`
    Logger.log(`head range: ${headRange}`)
    return getRange(spreadsheetId, headRange)
  }

  const getTailRows = () => {
    const lastRow = appendRange.match(/[0-9]+$/)[0]
    const firstRow = Math.max(1, lastRow - rowCount)
    const tailRange = `${prefix}A${firstRow}:${lastCol}${lastRow}`
    Logger.log(`tail range: ${tailRange}`)
    return getRange(spreadsheetId, tailRange)
  }

  return header ? getHeadRows().concat(getTailRows()) : getTailRows()
}

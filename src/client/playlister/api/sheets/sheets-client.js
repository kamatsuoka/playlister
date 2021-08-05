import { getAppsScriptRun } from '../auth'

export const appendRows = (spreadsheetId, range, values, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .appendRows(spreadsheetId, range, values)
  } else {
    throw new Error('appendRows not implemented outside Apps Script')
  }
}

export const tailSheet = (spreadsheetId, range, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .tailSheet(spreadsheetId, range)
  } else {
    throw new Error('tailSheet not implemented outside Apps Script')
  }
}

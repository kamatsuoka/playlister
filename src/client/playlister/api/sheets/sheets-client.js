import { getAppsScriptRun } from '../auth'

export const appendRows = (spreadsheetId, range, values, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .appendRows(spreadsheetId, range, values)
  } else {
    return new Promise(resolve => {
      return resolve([])
    }).then(onSuccess).catch(onFailure)
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
    return new Promise(resolve => {
      return resolve([])
    }).then(onSuccess).catch(onFailure)
  }
}

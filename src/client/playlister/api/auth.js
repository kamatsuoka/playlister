/**
 * Checks password
 */
const checkPassword = ({ password, onSuccess, onFailure }) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .checkPassword(password)
  } else {
    return new Promise(resolve => {
      return resolve(true)
    }).then(onSuccess).catch(onFailure)
  }
}

/**
 * Get Apps Script script runner
 */
const getAppsScriptRun = () => {
  /* eslint-disable no-undef */
  if (typeof google !== 'undefined' &&
    typeof google.script !== 'undefined' &&
    typeof google.script.run !== 'undefined') {
    return google.script.run
  } else {
    return null
  }
}

export { getAppsScriptRun, checkPassword }

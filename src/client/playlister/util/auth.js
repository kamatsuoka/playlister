const gapi = window.gapi

/**
 * Checks if user is authenticated.
 * If running in Apps Script, the answer is always yes.
 */
const isAuthenticated = () => {
  try {
    if (getAppsScriptRun()) { return true }
    if (gapi.auth2) {
      const auth2 = gapi.auth2.getAuthInstance()
      return auth2 && auth2.isSignedIn.get()
    }
  } catch (e) {
    console.error(e)
  }
  return false
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

export { gapi, getAppsScriptRun, isAuthenticated }

const gapi = window.gapi

/**
 * Checks if user is signed in
 */
const isAuthenticated = () => {
  try {
    if (gapi.auth2) {
      const auth2 = gapi.auth2.getAuthInstance()
      return auth2 && auth2.isSignedIn.get()
    }
  } catch (e) {
    console.error(e)
  }
  return false
}

export {gapi, isAuthenticated}

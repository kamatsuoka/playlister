import Mocks, { sleep } from './mocks/Mocks'

/**
 * Get Apps Script script runner
 *
 * @return RunnerFunctions & PublicEndpoints
 */
export const getAppsScriptRun = () => {
  /* eslint-disable no-undef */
  if (typeof google !== 'undefined' &&
    typeof google.script !== 'undefined' &&
    typeof google.script.run !== 'undefined') {
    return google.script.run
  } else {
    return null
  }
}

/**
 * Calls a server-side function by name,
 * adding success and failure handlers.
 *
 * When running outside Apps Script, looks in Mocks
 * for a function to call to retrieve mock values.
 *
 * @param fn name of function to call
 * @param onSuccess success handler
 * @param onFailure failure handler
 * @param params object containing arguments to fn
 */
export const callServer = async (fn, onSuccess, onFailure, params) => {
  const run = getAppsScriptRun()
  if (run) {
    return run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)[fn](params)
  } else {
    await sleep(1000)
    // return mock objects for testing outside apps script
    return new Promise(resolve => {
      return resolve(Mocks[fn] ? Mocks[fn](params) : undefined)
    }).then(onSuccess).catch(onFailure)
  }
}

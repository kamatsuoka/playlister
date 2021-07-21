/**
 * Gets a message for an error
 */
export function errorMessage (err) {
  let message = 'an error occurred'
  if (typeof err === 'string') {
    message = err
  } else if (err instanceof Error) {
    message = err.message
  } else if (err instanceof Object) {
    message = JSON.stringify(err)
  }
  return message
}

/**
 * Shows an error using the snackbar
 * @param enqueue snackbar enqueue function
 * @param err error message or object
 */
export function showError (enqueue, err) {
  console.log('ERROR: ', err)
  enqueue({ message: errorMessage(err) })
}

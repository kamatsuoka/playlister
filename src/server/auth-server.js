const VALIDATED = 'validated'
const PASSWORD_HASH = 'mtBO93jfSmM/wBFk1rSFzgxsv3yr0EBeyesLN8L2XylbWkOEpZ8ebovEjGXD4uRXwSATzZHVXWIBa27r809chw=='

/**
 * Checks if the password is valid
 *
 * @throws {Error} if password invalid
 */
export const checkPassword = password => {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, password, Utilities.Charset.US_ASCII)
  const hash = Utilities.base64Encode(digest)
  console.log(`hash = ${hash}`)
  if (hash === PASSWORD_HASH) {
    PropertiesService.getUserProperties().setProperty(VALIDATED, 'true')
  } else {
    PropertiesService.getUserProperties().setProperty(VALIDATED, 'false')
    throw new Error('invalid password')
  }
}

/**
 * Runs a function after checking password
 */
export const withAuth = fn => params => {
  const validated = PropertiesService.getUserProperties().getProperty(VALIDATED)
  console.log('in withAuth, validated = ', validated)
  if (validated === 'true') {
    return fn(params)
  } else {
    throw new Error('please login first')
  }
}

export default checkPassword

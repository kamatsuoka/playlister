const VALIDATED = 'validated'

/**
 * Checks if the password is valid.
 *
 * Relies on PASSWORD_HASH being set in script properties
 *
 * @throws {Error} if password invalid
 * @see https://developers.google.com/apps-script/guides/properties
 */
export const checkPassword = password => {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, password, Utilities.Charset.US_ASCII)
  const hash = Utilities.base64Encode(digest)
  console.log(`input hash = ${hash}`)
  const passwordHash = PropertiesService.getScriptProperties().getProperty('PASSWORD_HASH')
  console.log(`password hash = ${passwordHash}`)
  if (hash === passwordHash) {
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

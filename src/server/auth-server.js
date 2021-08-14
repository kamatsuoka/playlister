/**
 * Checks if the password is valid
 *
 * @throws {Error} if password invalid
 */
export const checkPassword = password => {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, password, Utilities.Charset.US_ASCII)
  const hash = Utilities.base64Encode(digest)
  console.log(`hash = ${hash}`)
  if (hash !== 'mtBO93jfSmM/wBFk1rSFzgxsv3yr0EBeyesLN8L2XylbWkOEpZ8ebovEjGXD4uRXwSATzZHVXWIBa27r809chw==') {
    throw new Error('invalid password')
  }
}

/**
 * Runs a function after checking password
 */
export const withAuth = fn => ({ password, ...params }) => {
  checkPassword(password)
  return fn(params)
}

export default checkPassword

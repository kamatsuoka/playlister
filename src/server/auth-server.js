/**
 * Checks if the password is valid
 *
 * @throws {Error} if password invalid
 */
export const checkPassword = password => {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, password, Utilities.Charset.US_ASCII)
  const hash = Utilities.base64Encode(digest)
  if (hash !== 'A0Af2X2OOdS76bZ8DgN99oTLAh08yLaS82YrbLqH7h+xcZX7UcGjZKEJ6mqz8BDJmdd9n7/fNqX5a/h4HtIcxg==') {
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

/**
 * Checks if the password is valid
 */
export const checkPassword = (password) => {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, password, Utilities.Charset.US_ASCII)
  const hash = Utilities.base64Encode(digest)
  return hash === 'A0Af2X2OOdS76bZ8DgN99oTLAh08yLaS82YrbLqH7h+xcZX7UcGjZKEJ6mqz8BDJmdd9n7/fNqX5a/h4HtIcxg=='
}

export default checkPassword

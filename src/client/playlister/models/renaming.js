/**
 * Gets the video number given camera info and index in playlist
 * @param cameraInfo contains cameraNumber
 * @param position zero-based index in playlist
 * @return e.g. 1.02 for first camera's second video
 */
export const getVideoNumber = (cameraInfo, position) =>
   `${cameraInfo.cameraNumber}.${((position + 1).toString().padStart(2, 0))}`

/**
 * Gets title as munged from filename by youtube:
 * extension removed, any non-alnum character replaced with space
 */
export const youtubeTitle = filename => {
  const parts = filename.split('.')
  const noExt = parts.length > 1 ? (parts.pop(), parts.join('.')) : filename
  return noExt.replace(/[^a-z0-9]/gi, ' ')
}

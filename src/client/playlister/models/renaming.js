/**
 * Gets the video number given camera info and index in playlist
 * @param cameraInfo contains cameraNumber
 * @param position zero-based index in playlist
 * @return e.g. 1.02 for first camera's second video
 */
export const getVideoNumber = (cameraInfo, position) =>
   `${cameraInfo.cameraNumber}.${((position + 1).toString().padStart(2, 0))}`

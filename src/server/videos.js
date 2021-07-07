/**
 * Inserts a video
 * @param resource {Schema.Video}
 * @param mediaData
 * @returns {GoogleAppsScript.YouTube.Schema.Video}
 */
const insertVideo = (resource, mediaData) => {
  const part = ['snippet', 'recordingDetails']
  return YouTube.Videos.insert(resource, part, mediaData)
}

export { insertVideo }

import dayjs from './dayjs/dayjs.min'
import duration from './dayjs/plugin/duration'

// noinspection JSUnresolvedFunction
dayjs.extend(duration)

const CATEGORY_ID_MUSIC = '10'

/**
 * Searches a list of items for one with given title
 */
const findMatchingItem = (result, title) => {
  const matchingItems = result.items.filter(i => i.snippet.title === title)
  if (matchingItems && matchingItems[0]) {
    return matchingItems[0]
  }
  return null
}

/**
 * Finds my playlist with given title
 */
export const findPlaylist = ({ title, nextPageToken = '' }) => {
  const MAX_RESULTS = 50
  const part = 'snippet,contentDetails'
  const optionalArgs = {
    maxResults: MAX_RESULTS,
    mine: true
  }

  if (nextPageToken !== '') {
    optionalArgs.pageToken = nextPageToken
  }
  const response = YouTube.Playlists.list(part, optionalArgs)
  const playlist = findMatchingItem(response, title)
  if (playlist) {
    return playlist
  }
  if (response.nextPageToken) {
    return findPlaylist({ title, nextPageToken: response.nextPageToken })
  }
  return null
}

/**
 * Lists my (hopefully recent) playlists
 */
export const listPlaylists = () => {
  const MAX_RESULTS = 50
  const part = 'id,snippet,contentDetails'
  const optionalArgs = {
    maxResults: MAX_RESULTS,
    mine: true
  }
  const response = YouTube.Playlists.list(part, optionalArgs)
  return response.items
}

/**
 * Inserts (creates) a new playlist
 */
export function insertPlaylist ({ title, description }) {
  const resource = {
    snippet: {
      title: title,
      description: description
    },
    status: {
      privacyStatus: 'unlisted'
    }
  }
  const part = 'snippet,contentDetails,status'
  return YouTube.Playlists.insert(resource, part)
}

/**
 * Finds videos in the user's uploaded videos by:
 *
 * 1. Fetching the user's channels
 * 2. Fetching each channel's "uploads" playlist
 * 3. Listing videos in the uploads playlist
 * 4. Updating video's description field to contain video start/end time, if necessary
 * 5. Returning videos that match one of the given filenames / titles
 *
 * @param {Object} fileMap - map of filename to { title, fileData }
 * @return Array of { videoId, title, publishedAt, filename, duration, startTime }
 */
export function findUploads ({ fileMap }) {
  Logger.log(`fileMap = ${JSON.stringify(fileMap)}`)
  // titles as they have likely been munged from filenames:
  // extension removed, any non-alnum character replaced with space
  const filenameSet = new Set(Object.keys(fileMap))
  const titleSet = new Set(Object.values(fileMap).map(file => file.title))
  const titleToFilename = Object.fromEntries(
    Object.entries(fileMap).map(([filename, data]) => [data.title, filename])
  )
  Logger.log(`titleToFilename = ${JSON.stringify(titleToFilename)}`)

  const matchingVideos = {} // map of filename to video data
  const channels = YouTube.Channels.list('contentDetails', { mine: true })
  console.log(`in findUploads, found ${channels.items.length} channels`)
  // we *probably* just have one channel, but just in case ...
  channels.items.forEach(channel => {
    // Channel resource: https://developers.google.com/youtube/v3/docs/channels
    // each channel has a special 'uploads' playlist that's not ordinarily visible
    const playlistId = channel.contentDetails.relatedPlaylists.uploads
    if (!playlistId) {
      console.error(`playlistId for channel uploads not found! channel: ${JSON.stringify(channel)}`)
    }
    // Although it's not documented, playlist items seem to come back in reverse
    // chronological order. We're going to assume our files were uploaded
    // recently enough that we don't need to look back more than 50 items.
    const items = listPlaylistItems({ playlistId, prune: false })
    Logger.log(`for channel ${channel.id}, got ${items.length} PlaylistItems`)
    if (items.length === 0) {
      return []
    } else {
      const pubDates = items.map(item => item.snippet.publishedAt).sort()
      Logger.log(`PlaylistItems published dates range from ${pubDates[0]} to ${pubDates[pubDates.length - 1]}`)
      const uploads = items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt
      })).filter(upload => dayjs().diff(dayjs(upload.publishedAt), 'days') < 4) // filter out old uploads
      const matches = uploads.flatMap(upload => {
        if (filenameSet.has(upload.title)) {
          upload.filename = upload.title
        } else if (titleSet.has(upload.title)) {
          upload.filename = titleToFilename[upload.title]
        }
        if (upload.filename) {
          upload.fileData = fileMap[upload.filename].fileData
          return [upload]
        }
        return []
      })
      for (const match of matches) {
        const videos = YouTube.Videos.list('snippet,contentDetails', {
          id: match.videoId, fields: 'items(id, snippet(title), contentDetails(duration))'
        })
        const video = videos.items[0]
        if (!video) {
          Logger.log(`Error: didn't find video with id ${match.videoId}`)
          continue
        }
        Logger.log(`matching video: ${JSON.stringify(video)}`)
        // noinspection JSUnresolvedFunction
        const videoSeconds = dayjs.duration(video.contentDetails.duration).asSeconds()
        if (Math.abs(videoSeconds - fileMap[match.filename].durationSeconds) > 1) {
          Logger.log(`duration of video ${video.id}, "${video.snippet.title}" at ${videoSeconds} seconds ` +
            `doesn't match file ${match.filename} at ${fileMap[match.filename].durationSeconds} seconds ` +
            ' (±1), ignoring')
          continue
        }
        if (matchingVideos[match.filename] &&
          video.snippet.publishedAt < matchingVideos[match.filename].publishedAt) {
          Logger.log(`video ${video.id} ${video.snippet.title} at ${video.snippet.publishedAt} ` +
              `is older than video ${matchingVideos[match.filename].id} ${matchingVideos[match.filename].title} ` +
              `at ${matchingVideos[match.filename].publishedAt}, ignoring`)
          continue
        }
        const desiredDescription = JSON.stringify({
          startTime: match.fileData.startTime,
          endTime: match.fileData.endTime,
          filename: match.filename
        })
        if (match.description !== desiredDescription) {
          Logger.log(`Updating description of video ${match.videoId} to contain startTime and endTime`)
          const updateResource = {
            id: match.videoId,
            snippet: {
              title: match.title,
              description: desiredDescription,
              categoryId: CATEGORY_ID_MUSIC
            }
          }
          YouTube.Videos.update(updateResource, 'snippet')
        }
        match.duration = video.contentDetails.duration
        matchingVideos[match.filename] = match
        Logger.log(`matching video: ${JSON.stringify(match)}`)
      }
    }
  })
  return Object.values(matchingVideos)
}

/**
 * Updates the title of a video
 *
 * @param videoId id of video to update
 * @param title new title
 * @param description description
 */
export function updateTitle ({ videoId, title, description }) {
  // TODO: add in update to status: unlisted once app is approved
  const response = YouTube.Videos.update(
    {
      id: videoId,
      snippet: {
        title: title,
        description: description,
        categoryId: CATEGORY_ID_MUSIC
      }
    },
    'snippet'
  )
  Logger.log(`updateTitle: response = ${JSON.stringify(response)}`)
  return {
    videoId: response.id,
    title: response.snippet.title
  }
}

/**
 * Inserts a video into a playlist
 *
 * @returns  GoogleAppsScript.YouTube.Schema.PlaylistItem
 * @see https://developers.google.com/youtube/v3/docs/playlistItems#resource
 */
function insertPlaylistItem (videoId, playlistId) {
  Logger.log(`inserting video ${videoId} into playlist ${playlistId}`)
  const resource = {
    snippet: {
      playlistId: playlistId,
      resourceId: {
        kind: 'youtube#video',
        videoId: videoId
      }
    }
  }
  return YouTube.PlaylistItems.insert(resource, 'snippet')
}

/**
 * Updates a playlist item
 *
 * @returns  GoogleAppsScript.YouTube.Schema.PlaylistItem
 * @see https://developers.google.com/youtube/v3/docs/playlistItems#resource
 */
function updatePlaylistItem ({ playlistItemId, videoId, playlistId, position }) {
  const resource = {
    id: playlistItemId,
    snippet: {
      playlistId: playlistId,
      position: position,
      resourceId: {
        kind: 'youtube#video',
        videoId: videoId
      }
    }
  }
  return YouTube.PlaylistItems.update(resource, 'snippet')
}

/**
 * Lists items in a playlist
 *
 * @returns Array[{ id, snippet: { title, description, playlistId, position }, resourceId: { videoId } } ]
 */
export function listPlaylistItems ({ playlistId, prune = true }) {
  console.log(`calling listPlaylistItems with playlistId = ${playlistId}`)
  const optionalArgs = {
    playlistId: playlistId,
    maxResults: 50,
    fields: 'items(id, snippet(publishedAt, title, description, playlistId, position, resourceId(videoId)))'
  }
  const items = YouTube.PlaylistItems.list('snippet', optionalArgs).items
  let pruned = false
  if (prune) {
    for (const item of items) {
      if (item.snippet.title === 'Deleted video') {
        YouTube.PlaylistItems.remove(item.id)
        pruned = true
      }
    }
  }
  return pruned ? YouTube.PlaylistItems.list('snippet', optionalArgs).items : items
}

/**
 * Adds an array of video ids to a playlist in the order specified,.
 * If video is already in playlist, just set its position.
 *
 * @param videos {Array} array of video data including videoId
 * @param playlistId id of playlist to add videos to
 */
export function addToPlaylist ({ videos, playlistId }) {
  const videoIds = videos.map(v => v.videoId)
  const videoItems = new Map() // map of video id to playlist item id
  const addVideoItem = item => videoItems.set(item.snippet.resourceId.videoId, item.id)
  // add any existing playlist items id to videoItems
  listPlaylistItems({ playlistId }).forEach(addVideoItem)
  console.log('videoItems already in playlist: ', videoItems)
  // add any new videos to the playlist and add their new playlist item id to videoItems
  const newVideoIds = videoIds.filter(id => !videoItems.has(id))
  console.log('video ids not already in playlist', newVideoIds)
  newVideoIds.forEach(videoId =>
    addVideoItem(insertPlaylistItem(videoId, playlistId))
  )
  console.log('updated videoItems: ', videoItems)
  // set playlist positions based on the order in videoIds and return updated playlist items
  return videoIds.map((videoId, position) =>
    updatePlaylistItem({
      playlistItemId: videoItems.get(videoId),
      videoId,
      playlistId,
      position
    }))
}

/**
 * Renames videos
 *
 * @param videoTitleDesc Object of { videoId: { title, description } }
 * @return Array Object of { videoId: title }
 */
export function renameVideos ({ videoTitleDesc }) {
  const newTitles = Object.entries(videoTitleDesc).map(([videoId, { title, description }]) =>
    updateTitle({ videoId, title, description })
  )
  return Object.fromEntries(newTitles.map(({ videoId, title }) =>
    [videoId, title]
  ))
}

/**
 * Gets upload url to start resumable video upload
 */
export function getUploadUrl ({ url, origin, videoResource, fileSize, contentType }) {
  const token = ScriptApp.getOAuthToken()
  const headers = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    'X-Upload-Content-Length': fileSize,
    'X-Upload-Content-Type': contentType,
    origin
  }
  const payloadString = JSON.stringify(videoResource)
  console.log('getUploadUrl payloadString: ', payloadString)
  const params = {
    method: 'post',
    payload: payloadString,
    headers: headers
  }
  console.log(`getUploadUrl params: ${JSON.stringify(params)}`)
  const response = UrlFetchApp.fetch(url, params)
  const responseHeaders = response.getHeaders()
  console.log(`getUploadUrl response headers: ${JSON.stringify(responseHeaders)}`)
  return responseHeaders.Location || responseHeaders.location
}

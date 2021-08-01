import dayjs from './dayjs/dayjs.min'
import duration from './dayjs/plugin/duration'

dayjs.extend(duration)

const CATEGORY_ID_MUSIC = 10

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
export const findMyPlaylist = (title, nextPageToken = '') => {
  const MAX_RESULTS = 50
  const part = ['snippet', 'contentDetails']
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
    return findMyPlaylist(title, response.nextPageToken)
  }
  return null
}

/**
 * Lists my (hopefully recent) playlists
 */
export const listPlaylists = () => {
  const MAX_RESULTS = 50
  const part = ['id', 'snippet', 'contentDetails']
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
export function insertPlaylist (title, description) {
  const resource = {
    snippet: {
      title: title,
      description: description
    },
    status: {
      privacyStatus: 'unlisted'
    }
  }
  const part = ['snippet', 'contentDetails', 'status']
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
 * @param {Object} files - map of filename to { title, fileData }
 * @return Array of { videoId, title, publishedAt, filename, duration, startTime }
 */
export function findUploads (files) {
  Logger.log(`files = ${JSON.stringify(files)}`)
  // titles as they have likely been munged from filenames:
  // extension removed, any non-alnum character replaced with space
  const filenameSet = new Set(Object.keys(files))
  const titleSet = new Set(Object.values(files).map(file => file.title))
  const titleToFilename = Object.fromEntries(
    Object.entries(files).map(([filename, data]) => [data.title, filename])
  )
  Logger.log(`titleToFilename = ${JSON.stringify(titleToFilename)}`)

  const matchingVideos = {} // map of filename to video data
  const channels = YouTube.Channels.list('contentDetails', { mine: true })
  // we *probably* just have one channel, but just in case ...
  channels.items.forEach(channel => {
    // Channel resource: https://developers.google.com/youtube/v3/docs/channels
    // each channel has a special 'uploads' playlist that's not ordinarily visible
    const playlistId = channel.contentDetails.relatedPlaylists.uploads
    const playlistResponse = YouTube.PlaylistItems.list('snippet', {
      playlistId: playlistId,
      maxResults: 50,
      fields: 'items(snippet(publishedAt, title, description, resourceId(videoId)))'
    })

    // Although it's not documented, playlist items seem to come back in reverse
    // chronological order. We're going to assume our files were uploaded
    // recently enough that we don't need to look back more than 50 items.
    const items = playlistResponse.items
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
      }))
      const matches = uploads.flatMap(upload => {
        if (filenameSet.has(upload.title)) {
          upload.filename = upload.title
        } else if (titleSet.has(upload.title)) {
          upload.filename = titleToFilename[upload.title]
        }
        if (upload.filename) {
          upload.fileData = files[upload.filename].fileData
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
        const videoSeconds = dayjs.duration(video.contentDetails.duration).asSeconds()
        if (Math.abs(videoSeconds - files[match.filename].durationSeconds) > 1) {
          Logger.log(`duration of video ${video.id}, "${video.snippet.title}" at ${videoSeconds} seconds ` +
            `doesn't match file ${match.filename} at ${files[match.filename].durationSeconds} seconds ` +
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
          endTime: match.fileData.endTime
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
 */
export function updateTitle (videoId, title) {
  // TODO: add in update to status: unlisted once app is approved
  const response = YouTube.Videos.update(
    {
      id: videoId,
      snippet: {
        title: title,
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
export function insertPlaylistItem (videoId, playlistId) {
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
export function updatePlaylistItem ({ playlistItemId, videoId, playlistId, position }) {
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
export function listPlaylistItems (playlistId) {
  const optionalArgs = {
    playlistId: playlistId,
    maxResults: 50,
    fields: 'items(id, snippet(title, description, playlistId, position, resourceId(videoId)))'
  }
  const items = YouTube.PlaylistItems.list('snippet', optionalArgs).items
  let pruned = false
  for (const item of items) {
    if (item.snippet.title === 'Deleted video') {
      YouTube.PlaylistItems.remove(item.id)
      pruned = true
    }
  }
  return pruned ? YouTube.PlaylistItems.list('snippet', optionalArgs).items : items
}

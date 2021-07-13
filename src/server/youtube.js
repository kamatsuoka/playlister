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
const findMyPlaylist = (title, nextPageToken = '') => {
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
 * Inserts (creates) a new playlist
 */
function insertPlaylist (title, description) {
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
 * Finds recent videos
 */
const findRecentVideos = () => {
  const MAX_RESULTS = 50
  const part = ['snippet']
  const optionalArgs = {
    type: 'video',
    order: 'date',
    maxResults: MAX_RESULTS,
    forMine: true
  }

  const videos = YouTube.Search.list(part, optionalArgs)
  Logger.log(`findRecentVideos: videos = ${JSON.stringify(videos)}`)
  return videos
}

/**
 * Finds videos in the user's uploaded videos by:
 *
 * 1. Fetching the user's channels
 * 2. Fetching each channel's "uploads" playlist
 * 3. Listing videos in the uploads playlist
 * 4. Returning videos that match one of the given filenames / titles
 *
 * @param {Object} titles - map of title to filename
 */
function findUploads(titles) {
  // titles as they have likely been munged from filenames:
  // extension removed, any non-alnum character replaced with space
  const filenameSet = new Set(Object.values(titles))
  const titleSet = new Set(Object.keys(titles))

  const channels = YouTube.Channels.list('contentDetails', { mine: true })

  // we *probably* just have one channel, but just in case ...
  return channels.items.flatMap(channel => {
    // Channel resource: https://developers.google.com/youtube/v3/docs/channels
    // each channel has a special 'uploads' playlist that's not ordinarily visible
    const playlistId = channel.contentDetails.relatedPlaylists.uploads
    const playlistResponse = YouTube.PlaylistItems.list('snippet', {
      playlistId: playlistId,
      maxResults: 50,
      fields: 'items(snippet(publishedAt,title,thumbnails(default(url)),resourceId(videoId)))'
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
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.default.url
      }))
      const matches = uploads.flatMap(upload => {
        if (filenameSet.has(upload.title)) {
          upload.filename = upload.title
          return [upload]
        }
        if (titleSet.has(upload.title)) {
          upload.filename = titles[upload.title]
          return [upload]
        }
        return []
      })
      for (const match of matches) {
        const matchingVideos = YouTube.Videos.list('snippet', {
          id: match.videoId, part: 'contentDetails', fields: 'items(contentDetails(duration))'
        })
        if (matchingVideos && matchingVideos.items && matchingVideos.items[0]) {
          Logger.log(`matchingVideos: ${JSON.stringify(matchingVideos)}`)
          match.duration = matchingVideos.items[0].contentDetails.duration
        }
        Logger.log(`title match: ${JSON.stringify(match)}`)
      }
      return matches
    }
  })
}

export { findMyPlaylist, insertPlaylist, findUploads }

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
  // eslint-disable-next-line no-undef
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
  // eslint-disable-next-line no-undef
  return YouTube.Playlists.insert(resource, part)
}

/**
 * Finds recent videos
 */
const findRecentVideos = () => {
  const MAX_RESULTS = 50
  const part = ['snippet']
  const optionalArgs = {
    order: 'date',
    maxResults: MAX_RESULTS,
    mine: true
  }

  // eslint-disable-next-line no-undef
  return YouTube.Search.list(part, optionalArgs)
}

export { findMyPlaylist, insertPlaylist, findRecentVideos }

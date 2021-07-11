/**
 * Searches a list of playlists for existing playlist with given title
 */
const searchPlaylistResults = (result, title) => {
  // eslint-disable-next-line no-undef
  Logger.log(`in searchPlaylistResults, result.items = ${result.items}`)
  const matchingPlaylists = result.items.filter(i => i.snippet.title === title)
  if (matchingPlaylists && matchingPlaylists[0]) {
    // eslint-disable-next-line no-undef
    Logger.log(`in searchPlaylistResults, found matching playlist = ${matchingPlaylists[0]}`)
    return matchingPlaylists[0]
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
  const playlist = searchPlaylistResults(response, title)
  if (playlist) {
    // eslint-disable-next-line no-undef
    Logger.log(`in findMyPlaylist: returning playlist = ${playlist}`)
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

export { findMyPlaylist, insertPlaylist }

/**
 * Find existing playlist with same name
 */
const searchPlaylistResults = (result, title) => {
  Logger.log(`in searchPlaylistResults, result.items = ${result.items}`)
  const matchingPlaylists = result.items.filter(i => i.snippet.title === title)
  if (matchingPlaylists && matchingPlaylists[0]) {
    Logger.log(`in searchPlaylistResults, found matching playlist = ${matchingPlaylists[0]}`)
    return matchingPlaylists[0]
  }
  return null
}

const findMyPlaylist = (title, nextPageToken = '') => {
  const MAX_RESULTS = 50
  const part = ['snippet,contentDetails']
  const optionalArgs = {
    maxResults: MAX_RESULTS,
    mine: true,
  }

  if (nextPageToken !== '') {
    optionalArgs.pageToken = nextPageToken
  }
  const response = YouTube.Playlists.list(part, optionalArgs)
  const playlist = searchPlaylistResults(response, title)
  if (playlist) {
    Logger.log(`in findMyPlaylist: returning playlist = ${playlist}`)
    return playlist
  }
  if (response.nextPageToken) {
    return findMyPlaylist(title, response.nextPageToken)
  }
  return null
}

export { findMyPlaylist }

/**
 * YouTube api methods.
 * Some methods will call google.script.run.* to access server-side functions
 * if we're running as a Google Apps Script webapp, while they'll call
 * gapi.client.youtube.* functions if we're running as a regular web app.
 */

import { gapi, getAppsScriptRun } from '../util/auth'
import dayjs from 'dayjs'

/**
 * Finds a playlist by title.
 *
 * @param title title to search for
 * @param onSuccess success handler: (playlist) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
const findPlaylist = (title, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .findMyPlaylist(title)
  } else {
    return searchPlaylists(title)
      .then(onSuccess)
      .catch(onFailure)
  }
}

/**
 * Finds existing item with same name
 */
const findMatchingItem = (response, title) => {
  console.log('findMatchingItem: response', response)
  const items = response && response.result ? response.result.items : []
  const matchingPlaylists = items.filter(i => i.snippet.title === title)
  if (matchingPlaylists && matchingPlaylists[0]) {
    return matchingPlaylists[0]
  }
  return null
}

/**
 * Searches my channel playlist with a given title,
 * optionally using a page token to continue an earlier search.
 *
 * @returns Promise
 */
const searchPlaylists = (title, pageToken = '') => {
  const request = {
    part: 'snippet,contentDetails',
    mine: true,
    maxResults: 50
  }
  if (pageToken !== '') { request.pageToken = pageToken }

  return gapi.client.youtube.playlists.list(request).then(
    response => {
      const playlist = findMatchingItem(response, title)
      if (playlist) {
        return playlist
      } else if (response.result.nextPageToken) {
        return searchPlaylists(title, response.result.nextPageToken)
      } else {
        return null
      }
    }
  )
}

/**
 * Inserts (creates) a playlist.
 * Note! The YouTube API only lets you create a playlist in your own account.
 * I think that means we can't let the app create a playlist on our behalf
 * unless we're signed in as the account owner.
 */
function insertPlaylist (title, onSuccess, onFailure) {
  const description = `created by playlister on ${dayjs().format()}`
  const run = getAppsScriptRun()
  if (run) {
    run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .insertPlaylist(title, description)
  } else {
    const playlistProps = {
      part: [
        'snippet,contentDetails,status'
      ],
      resource: {
        snippet: {
          title: title,
          description: `created by playlister on ${dayjs()}`
        },
        status: {
          privacyStatus: 'unlisted'
        }
      }
    }
    return gapi.client.youtube.playlists.insert(playlistProps)
      .then(response => onSuccess(response.result), err => onFailure(err))
  }
}

/**
 * Gets title as munged from filename by youtube:
 * extension removed, any non-alnum character replaced with space
 */
const youtubeTitle = filename => {
  const parts = filename.split('.')
  const noExt = parts.length > 1 ? (parts.pop(), parts.join('.')) : filename
  return noExt.replace(/[^a-z0-9]/gi, ' ')
}

/**
 * Finds uploads given local file metadata
 *
 * @param metadataList local file metadata
 * @param onSuccess success handler: (video) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
const findUploads = (metadataList, onSuccess, onFailure) => {
  const fileData = Object.fromEntries(
      metadataList.map(data => [data.name, {
        fileId: data.fileId,
        title: youtubeTitle(data.name),
        durationSeconds: Math.round(data.duration)
    }])
  )

  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .findUploads(fileData)
  } else {
    throw 'standalone findUploads (outside Apps Script) not implemented'
    // return searchVideos()
    //   .then(onSuccess)
    //   .catch(onFailure)
  }
}

export { findPlaylist, insertPlaylist, findUploads, youtubeTitle }

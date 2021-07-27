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
  console.log(`findPlaylist: searching for ${title}`)
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

const samplePlaylist = (id, title, description, itemCount, publishedAt) => ({
  id: id,
  snippet: {
    publishedAt: publishedAt,
    title: title,
    description: description
  },
  contentDetails: {
    itemCount: itemCount
  }
})

/**
 * Lists my (hopefully recent) playlists
 *
 * @param onSuccess success handler: (playlist) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
const listPlaylists = (onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .listPlaylists()
  } else {
    // for testing
    const playlists = [
      samplePlaylist('asdf', 'recent playlist 1', 'sample playlist 1', 0, '2021-06-26T00:12:34Z'),
      samplePlaylist('jklm', 'recent playlist 2 with longer title', 'sample playlist 2', 2, '2021-05-25T00:12:34Z'),
      samplePlaylist('zxcv', 'short title', 'sample playlist 1', 3, '2021-03-25T00:12:34Z')
    ]
    return new Promise((resolve, reject) => {
      return resolve(playlists)
    }).then(onSuccess).catch(onFailure)
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
function insertPlaylist (title, eventDate, onSuccess, onFailure) {
  const description = `created by playlister on ${dayjs().format()}`
  const run = getAppsScriptRun()
  if (run) {
    run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .insertPlaylist(title, description)
  } else {
    // for testing
    const playlist = {
      id: 'asdf',
      snippet: {
        title: title,
        description: description,
        publishedAt: dayjs().toISOString()
      },
      contentDetails: {
        itemCount: 0
      }
    }
    return new Promise((resolve, reject) => {
      return resolve(playlist)
    }).then(onSuccess).catch(onFailure)
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
 * @param fileDataList local file metadata with start/end times
 * @param onSuccess success handler: (video) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
const findUploads = (fileDataList, onSuccess, onFailure) => {
  const fileData = Object.fromEntries(
    fileDataList.map(fileData => [fileData.filename, {
      title: youtubeTitle(fileData.filename),
      fileData: { ...fileData, file: undefined } // can't send file object over wire
    }])
  )

  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .findUploads(fileData)
  } else {
    const uploads = fileDataList.map(fd => ({
      videoId: Math.random().toString(36).substr(2, 9),
      title: youtubeTitle(fd.filename),
      publishedAt: dayjs().toISOString(),
      filename: fd.filename,
      duration: fd.duration,
      fileData: fd
    }))
    return new Promise((resolve, reject) => {
      return resolve(uploads)
    }).then(onSuccess).catch(onFailure)
  }
}

const insertPlaylistItem = (videoId, playlistId, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .insertPlaylistItem(videoId, playlistId)
  } else {
    throw Error('insertPlaylistItem not implented outside Apps Script')
  }
}

const updateTitle = (videoId, title, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .updateTitle(videoId, title)
  } else {
    throw Error('updateTitle not implented outside Apps Script')
  }
}

export { findPlaylist, listPlaylists, insertPlaylist, findUploads, youtubeTitle, updateTitle }

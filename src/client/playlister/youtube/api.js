/**
 * YouTube api methods.
 * Some methods will call google.script.run.* to access server-side functions
 * if we're running as a Google Apps Script webapp, while they'll call
 * gapi.client.youtube.* functions if we're running as a regular web app.
 */

import { getAppsScriptRun } from '../util/auth'
import dayjs from 'dayjs'

/**
 * Finds a playlist by title.
 *
 * @param title title to search for
 * @param onSuccess success handler: (playlist) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
export const findPlaylist = (title, onSuccess, onFailure) => {
  console.log(`findPlaylist: searching for ${title}`)
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .findMyPlaylist(title)
  } else {
    return new Promise(resolve => {
      return resolve(undefined)
    }).then(onSuccess).catch(onFailure)
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
export const listPlaylists = (onSuccess, onFailure) => {
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
    return new Promise(resolve => {
      return resolve(playlists)
    }).then(onSuccess).catch(onFailure)
  }
}

/**
 * Inserts (creates) a playlist.
 * Note! The YouTube API only lets you create a playlist in your own account.
 * I think that means we can't let the app create a playlist on our behalf
 * unless we're signed in as the account owner.
 */
export function insertPlaylist (title, onSuccess, onFailure) {
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
    return new Promise(resolve => {
      return resolve(playlist)
    }).then(onSuccess).catch(onFailure)
  }
}

/**
 * Gets title as munged from filename by youtube:
 * extension removed, any non-alnum character replaced with space
 */
export const youtubeTitle = filename => {
  const parts = filename.split('.')
  const noExt = parts.length > 1 ? (parts.pop(), parts.join('.')) : filename
  return noExt.replace(/[^a-z0-9]/gi, ' ')
}

/**
 * Finds uploads given local file metadata
 *
 * @param fileList local file metadata with start/end times
 * @param onSuccess success handler: (video) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
export const findUploads = (fileList, onSuccess, onFailure) => {
  const fileData = Object.fromEntries(
    fileList.map(fileData => [fileData.filename, {
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
    const uploads = fileList.map(fd => ({
      videoId: Math.random().toString(36).substr(2, 9),
      title: youtubeTitle(fd.filename),
      publishedAt: dayjs().toISOString(),
      filename: fd.filename,
      duration: fd.duration,
      fileData: fd
    }))
    return new Promise((resolve) => {
      return resolve(uploads)
    }).then(onSuccess).catch(onFailure)
  }
}

export const insertPlaylistItem = (videoId, playlistId, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .insertPlaylistItem(videoId, playlistId)
  } else {
    // for testing
    const item = {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          videoId: videoId
        }
      }
    }
    return new Promise(resolve => {
      return resolve(item)
    }).then(onSuccess).catch(onFailure)
  }
}

export const updateTitle = (videoId, title, onSuccess, onFailure) => {
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

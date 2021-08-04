/**
 * YouTube api methods.
 * Some methods will call google.script.run.* to access server-side functions
 * if we're running as a Google Apps Script webapp, while they'll call
 * gapi.client.youtube.* functions if we're running as a regular web app.
 */

import { getAppsScriptRun } from '../util/auth'
import dayjs from 'dayjs'

/**
 * Sleeps for a given number of ms (for testing)
 */
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Finds a playlist by title.
 *
 * @param title title to search for
 * @param onSuccess success handler: (playlist) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
export const findPlaylist = async (title, onSuccess, onFailure) => {
  console.log(`findPlaylist: searching for ${title}`)
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .findMyPlaylist(title)
  } else {
    // for testing
    await sleep(1000)
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
export const listPlaylists = async (onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .listPlaylists()
  } else {
    // for testing
    await sleep(1000)
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
export const insertPlaylist = async (title, onSuccess, onFailure) => {
  const description = `created by playlister on ${dayjs().format()}`
  const run = getAppsScriptRun()
  if (run) {
    run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .insertPlaylist(title, description)
  } else {
    // for testing
    await sleep(1000)
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

const randomId = () => Math.random().toString(36).substr(2, 9)

/**
 * Finds uploads given local file metadata
 *
 * @param fileList local file metadata with start/end times
 * @param onSuccess success handler: (video) => {}
 * @param onFailure failure handler: (error) => {}
 * @returns {Promise<*>}
 */
export const findUploads = async (fileList, onSuccess, onFailure) => {
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
    await sleep(1000)
    const uploads = fileList.map(fd => ({
      videoId: randomId(),
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
        title: `title for ${videoId}`,
        position: Math.max(1, Math.round(Math.random() * 5)),
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

export const updatePlaylistItem = ({ playlistItemId, videoId, playlistId, position, onSuccess, onFailure }) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .updatePlaylistItem({ playlistItemId, videoId, playlistId, position })
  } else {
    // for testing
    const item = {
      id: playlistItemId,
      snippet: {
        playlistId: playlistId,
        title: `title for ${videoId}`,
        description: undefined,
        position: position,
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

export const listPlaylistItems = async (playlistId, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .listPlaylistItems(playlistId)
  } else {
    // for testing
    await sleep(1000)
    const numItems = Math.max(1, Math.round(Math.random() * 5))
    const resources = Array.from({ length: numItems }, (x, i) => ({
      id: randomId(),
      snippet: {
        playlistId: playlistId,
        title: `video ${i}`,
        startTime: dayjs().toISOString(),
        position: i,
        resourceId: {
          videoId: i
        }
      }
    }))
    return new Promise(resolve => {
      return resolve(resources)
    }).then(onSuccess).catch(onFailure)
  }
}

/**
 * Adds videos to a playlist
 *
 * @param videos Array of video data with { title, videoId, startTime }
 * @param playlistId playlist id
 * @param onSuccess success handler
 * @param onFailure failure handler
 */
export const addToPlaylist = async (videos, playlistId, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .addToPlaylist(videos.map(v => v.videoId), playlistId)
  } else {
    // for testing
    await sleep(1000)
    const resources = videos.map(({ title, videoId, startTime }, i) => ({
      id: randomId(),
      snippet: {
        playlistId: playlistId,
        title: title,
        startTime: startTime,
        position: i,
        resourceId: {
          videoId: videoId
        }
      }
    }))
    return new Promise(resolve => {
      return resolve(resources)
    }).then(onSuccess).catch(onFailure)
  }
}

/**
 * Rename list of videos. Used to rename all videos in a playlist.
 *
 * @param videoTitleDesc Object of { videoId: { title, description } }
 * @param onSuccess success handler
 * @param onFailure failure handler
 * @return Object of { videoId: title }
 */
export const renameVideos = (videoTitleDesc, onSuccess, onFailure) => {
  const run = getAppsScriptRun()
  if (run) {
    return run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
      .renameVideos(videoTitleDesc)
  }
}

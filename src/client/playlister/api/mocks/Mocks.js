import dayjs from 'dayjs'
import randomId from '../../util/randomId'
import { youtubeTitle } from '../../models/renaming'

/**
 * Sleeps for a given number of ms (for testing)
 */
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Creates a mock playlist
 */
const mockPlaylist = (id, title, description, itemCount, publishedAt) => ({
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
 * Functions that return mock data for testing outside Apps Script
 */
const Mocks = {
  checkPassword: password => {
    if (password === 'asdf') {
      return true
    } else {
      throw new Error('invalid password (mock)')
    }
  },
  tailSheet: () => [],
  findUploads: ({ fileMap }) =>
    Object.values(fileMap).map(({ fileData }) => ({
      videoId: randomId(),
      title: youtubeTitle(fileData.filename),
      publishedAt: dayjs().toISOString(),
      filename: fileData.filename,
      duration: fileData.duration,
      fileData: fileData
    })),
  insertPlaylist: ({ title, description }) => ({
    id: 'asdf',
    snippet: {
      title: title,
      description: description,
      publishedAt: dayjs().toISOString()
    },
    contentDetails: {
      itemCount: 0
    }
  }),
  listPlaylists: () => [
    mockPlaylist('asdf', 'recent playlist 1', 'sample playlist 1', 0, '2021-06-26T00:12:34Z'),
    mockPlaylist('jklm', 'recent playlist 2 with longer title', 'sample playlist 2', 2, '2021-05-25T00:12:34Z'),
    mockPlaylist('zxcv', 'short title', 'sample playlist 1', 3, '2021-03-25T00:12:34Z')
  ],
  listPlaylistItems: () => [],
  addToPlaylist: ({ videos, playlistId }) => videos.map(({ title, videoId, startTime }, i) => ({
    id: randomId(),
    snippet: {
      playlistId: playlistId,
      title: title,
      startTime: startTime,
      position: i,
      description: JSON.stringify({ startTime }),
      resourceId: {
        videoId: videoId
      }
    }
  })),
  renameVideos: ({ videoTitleDesc }) => Object.fromEntries(
    Object.entries(videoTitleDesc).map(([videoId, { title }]) => [videoId, title])
  ),
  appendRows: () => ({ updatedData: { values: [] } })
}

export default Mocks

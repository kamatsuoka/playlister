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
  tailSheet: () => [
    ['8/5/2021', '1', '2021-07-21 13:19:57', '2021-07-21 14:44:24', 'https://www.youtube.com/watch?v=f5RS5smvNUs&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=1', '1', 'chorus', 'kenji q2n4k'],
    ['8/5/2021', '2', '2021-07-21 14:53:38', '2021-07-21 15:38:40', 'https://www.youtube.com/watch?v=-f_2nFcc_K8&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=2', '1', 'chorus', 'kenji q2n4k'],
    ['8/5/2021', '3', '2021-07-21 15:38:44', '2021-07-21 16:20:42', 'https://www.youtube.com/watch?v=9KXn-QN34lo&list=PLI78W9w-3gY4dnp7Y-bDRW0i0OZdRExUO&index=3', '1', 'chorus', 'kenji q2n4k']
  ],
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

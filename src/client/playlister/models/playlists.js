/**
 * Gets playlist properties of interest from youtube Playlist resource
 *
 * https://developers.google.com/youtube/v3/docs/playlists#resource
 */
import { parseDescription } from '../util/dates'

export const resourceToPlaylist = resource => ({
  playlistId: resource.id,
  title: resource.snippet.title,
  itemCount: resource.contentDetails.itemCount,
  publishedAt: resource.snippet.publishedAt,
  description: resource.snippet.description
})

export const resourceToPlaylistItem = resource => ({
  playlistItemId: resource.id,
  playlistId: resource.snippet.playlistId,
  videoId: resource.snippet.resourceId.videoId,
  title: resource.snippet.title,
  position: resource.snippet.position,
  description: resource.snippet.description,
  ...parseDescription(resource.snippet.description)
})

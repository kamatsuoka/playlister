/**
 * Gets playlist properties of interest from youtube Playlist resource
 *
 * https://developers.google.com/youtube/v3/docs/playlists#resource
 */
export const resourceToPlaylist = resource => ({
  playlistId: resource.id,
  title: resource.snippet.title,
  itemCount: resource.contentDetails.itemCount,
  publishedAt: resource.snippet.publishedAt,
  description: resource.snippet.description
})

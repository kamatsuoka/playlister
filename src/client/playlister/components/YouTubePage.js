import React from 'react'
import { KIND } from 'baseui/button'
import prevNextButtons from './PrevNextButtons'
import PlaylistItems from './PlaylistItems'
import { useStyletron } from 'baseui'
import { Heading, HeadingLevel } from 'baseui/heading'
import { Block } from 'baseui/block'
import UploadStep from './UploadStep'
import PlaylistStep from './PlaylistStep'

export const YouTubePage = ({
  current, setCurrent,
  files, uploads, setUploads,
  orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist,
  playlist, setPlaylist,
  playlistItems, setPlaylistItems
}) => {
  /**
   * uploads items, keyed by file id:
   * - videoId
   * - title
   * - publishedAt
   * - fileId
   * - filename
   * - startTime
   * - endTime
   */
  const [css, theme] = useStyletron()

  /*
  const playlistOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
    (playlistTitle.tabIndex === 1 && selectedPlaylist[0] && selectedPlaylist[0].title)
*/

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 && files.every(file => uploadedFileIds.has(file.fileId))

  const playlistVideoIds = new Set(Object.keys(playlistItems))

  const allAdded = Object.keys(playlist).length > 0 && allUploaded && files.every(file =>
    uploads[file.fileId] && playlistVideoIds.has(uploads[file.fileId].videoId)
  )

  const getRenameStep = () =>
    <Block className={css({ marginBottom: theme.sizing.scale600 })}>
      <Heading styleLevel={5}>4. Rename</Heading>
    </Block>

  return (
    <HeadingLevel>
      <UploadStep files={files} uploads={uploads} setUploads={setUploads} />
      {allUploaded
        ? <PlaylistStep
            setPlaylist={setPlaylist} playlists={playlists} setPlaylists={setPlaylists}
            setPlaylistItems={setPlaylistItems} uploadedFileIds={uploadedFileIds}
            createdPlaylist={createdPlaylist} setCreatedPlaylist={setCreatedPlaylist}
            selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
          />
        : null}
      <PlaylistItems
        files={files} uploads={uploads} playlist={playlist}
        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems}
      />
      {allAdded ? getRenameStep() : null}
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: allUploaded ? KIND.primary : KIND.secondary }
      })}
    </HeadingLevel>
  )
}

export default YouTubePage
